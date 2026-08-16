"""
CareerForge AI — Job Endpoints.

Handles job description analysis, real-time job search from external APIs,
resume-job matching with selection chance computation, and cold outreach generation.

Security:
    - Job descriptions treated as untrusted data
    - AI output validated before persistence
    - Apply URLs sourced directly from legitimate APIs, never constructed
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.core.security import TokenData, get_current_user
from app.repositories.job import JobRepository, JobRequirementRepository
from app.repositories.resume import ResumeRepository
from app.schemas.job import JobAnalyzeRequest, JobResponse, ColdDMRequest, ColdDMResponse
from app.services.job_analyzer import JobAnalyzerService
from app.services.cold_dm_service import ColdDMService
from app.services.job_sourcing import JobSourcingService, JobSearchParams, JobListing
from app.services.match_engine import MatchEngineService

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Job Search (real external APIs)
# ---------------------------------------------------------------------------

@router.get(
    "/search",
    response_model=list[dict],
    summary="Search for real job listings from external APIs",
)
async def search_jobs(
    keywords: str = Query(default="", description="Search keywords (e.g. 'python developer')"),
    location: str = Query(default="", description="Location filter"),
    remote_only: bool = Query(default=False, description="Only show remote jobs"),
    limit: int = Query(default=20, ge=1, le=50, description="Max results"),
    current_user: TokenData = Depends(get_current_user),
) -> list[dict]:
    """
    Search for real job listings from external APIs (Arbeitnow, RemoteOK, Adzuna).

    Returns canonical apply URLs sourced directly from the APIs.
    Listings are filtered for freshness (max 30 days old) and deduplicated.
    """
    settings = get_settings()
    service = JobSourcingService(
        adzuna_app_id=getattr(settings, "adzuna_app_id", ""),
        adzuna_app_key=getattr(settings, "adzuna_app_key", ""),
    )

    params = JobSearchParams(
        keywords=keywords,
        location=location,
        remote_only=remote_only,
        limit=limit,
    )

    listings = await service.search(params, check_links=False)
    return [listing.model_dump(mode="json") for listing in listings]


# ---------------------------------------------------------------------------
# Resume-Job Matching with Selection Chance
# ---------------------------------------------------------------------------

@router.post(
    "/match-resume",
    response_model=list[dict],
    summary="Match a resume against live job listings and compute selection chance",
)
async def match_resume_to_jobs(
    resume_id: UUID = Query(..., description="Resume UUID to match against"),
    keywords: str = Query(default="", description="Optional keyword filter"),
    location: str = Query(default="", description="Optional location filter"),
    remote_only: bool = Query(default=False),
    limit: int = Query(default=15, ge=1, le=30),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """
    Fetch real job listings, then compute a selection chance for each
    using the deterministic match engine against the user's resume.

    Selection Chance Formula:
        chance = (required_skill_coverage × 0.40)
               + (semantic_alignment × 0.25)
               + (experience_fit × 0.20)
               + (evidence_strength × 0.15)

    Buckets:
        ≥80% → Strong Match
        60-79% → Good Match
        40-59% → Stretch
        <40% → Long Shot
    """
    # 1. Get resume data
    resume_repo = ResumeRepository(db)
    resume = await resume_repo.get_with_details(resume_id, current_user.user_id)
    if resume is None:
        raise NotFoundError("Resume", resume_id)

    # Build resume context for matching
    sections = [
        {"section_type": s.section_type, "raw_text": s.raw_text, "normalized_text": s.normalized_text}
        for s in resume.sections
    ]
    evidence = [
        {"claim_text": e.claim_text, "verified": e.verified}
        for e in resume.evidence_items
    ]
    resume_text = " ".join(
        s.get("raw_text", "") + " " + (s.get("normalized_text", "") or "")
        for s in sections
    ).lower()

    # Auto-detect keywords from resume if none provided
    if not keywords:
        # Extract key skills from resume for search
        skills_section = next((s for s in sections if s["section_type"] == "skills"), None)
        if skills_section:
            keywords = skills_section["raw_text"][:100]
        else:
            keywords = resume_text[:100]

    # 2. Fetch real job listings
    settings = get_settings()
    sourcing = JobSourcingService(
        adzuna_app_id=getattr(settings, "adzuna_app_id", ""),
        adzuna_app_key=getattr(settings, "adzuna_app_key", ""),
    )
    params = JobSearchParams(keywords=keywords, location=location, remote_only=remote_only, limit=limit)
    listings = await sourcing.search(params)

    # 3. Score each job against the resume
    engine = MatchEngineService()
    matched_jobs = []

    for listing in listings:
        # Build lightweight requirements from listing skills + description
        requirements = []
        for skill in listing.skills:
            requirements.append({
                "requirement_type": "required",
                "requirement_text": skill,
                "normalized_skill": skill.lower(),
            })

        job_metadata = {
            "title": listing.title,
            "company": listing.company,
            "location": listing.location,
            "employment_type": listing.employment_type,
            "experience_level": listing.experience_level,
        }

        # Compute sub-scores using the match engine's internal methods
        required_coverage = engine._skill_coverage(requirements, resume_text)
        experience_fit = engine._experience_fit(resume_text, job_metadata)
        evidence_strength = engine._evidence_strength(evidence)

        # Simple semantic alignment based on keyword overlap (fast, no API call needed)
        job_text = f"{listing.title} {listing.company} {listing.description} {' '.join(listing.skills)}".lower()
        common_words = set(resume_text.split()) & set(job_text.split())
        # Filter out common stop words
        stop_words = {"the", "and", "for", "with", "this", "that", "from", "have", "will", "are", "was", "been"}
        meaningful = {w for w in common_words if len(w) > 3 and w not in stop_words}
        semantic_score = min(100, len(meaningful) * 5)

        # Selection Chance Formula
        chance = (
            required_coverage * 0.40
            + semantic_score * 0.25
            + experience_fit * 0.20
            + evidence_strength * 0.15
        )
        chance = round(min(100, max(0, chance)), 1)

        # Bucket
        if chance >= 80:
            bucket = "Strong Match"
        elif chance >= 60:
            bucket = "Good Match"
        elif chance >= 40:
            bucket = "Stretch"
        else:
            bucket = "Long Shot"

        # Gap analysis for resume tips
        gaps = []
        for skill in listing.skills:
            if skill.lower() not in resume_text:
                gaps.append({
                    "skill": skill,
                    "suggestion": f"Highlight experience with {skill} in your resume.",
                })

        matched_jobs.append({
            **listing.model_dump(mode="json"),
            "selectionChance": chance,
            "selectionBucket": bucket,
            "scores": {
                "required_skill_coverage": required_coverage,
                "semantic_alignment": semantic_score,
                "experience_fit": experience_fit,
                "evidence_strength": evidence_strength,
            },
            "gaps": gaps[:4],  # Top 4 gaps for resume tips
        })

    # Sort by selection chance descending
    matched_jobs.sort(key=lambda j: j["selectionChance"], reverse=True)

    return matched_jobs


# ---------------------------------------------------------------------------
# Existing endpoints (manual job analysis)
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    response_model=JobResponse,
    status_code=201,
    summary="Analyze a job description",
)
async def analyze_job(
    data: JobAnalyzeRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    """
    Analyze a job description and extract structured requirements.

    Requirements are categorized as required/preferred/inferred/unknown.
    The job description is treated as DATA, never as instructions.
    """
    analyzer = JobAnalyzerService()
    job_repo = JobRepository(db)
    req_repo = JobRequirementRepository(db)

    # Analyze the job description
    analysis = await analyzer.analyze_job(
        description=data.description,
        company=data.company,
        title=data.title,
        location=data.location,
        employment_type=data.employment_type,
        experience_level=data.experience_level,
    )

    # Create job record
    job = await job_repo.create(
        user_id=current_user.user_id,
        source=data.source,
        company=data.company,
        title=data.title,
        location=data.location,
        employment_type=data.employment_type,
        experience_level=data.experience_level,
        description=data.description,
        application_url=data.application_url,
    )

    # Create requirement records
    for req_data in analysis.get("requirements", []):
        await req_repo.create(
            job_id=job.id,
            requirement_type=req_data.get("requirement_type", "unknown"),
            requirement_text=req_data.get("requirement_text", ""),
            normalized_skill=req_data.get("normalized_skill"),
            priority=req_data.get("priority", 0),
        )

    # Reload with requirements
    job_with_reqs = await job_repo.get_with_requirements(job.id, current_user.user_id)
    return JobResponse.model_validate(job_with_reqs)


@router.get(
    "",
    response_model=list[JobResponse],
    summary="List analyzed jobs",
)
async def list_jobs(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[JobResponse]:
    """List the current user's analyzed jobs."""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.job import Job

    query = (
        select(Job)
        .options(selectinload(Job.requirements))
        .where(Job.user_id == current_user.user_id)
        .order_by(Job.created_at.desc())
        .limit(50)
    )
    result = await db.execute(query)
    jobs = list(result.scalars().all())
    return [JobResponse.model_validate(j) for j in jobs]


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get a job with requirements",
)
async def get_job(
    job_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    """Get a job with all extracted requirements."""
    job_repo = JobRepository(db)
    job = await job_repo.get_with_requirements(job_id, current_user.user_id)
    if job is None:
        raise NotFoundError("Job", job_id)
    return JobResponse.model_validate(job)


@router.post(
    "/{job_id}/cold-dm",
    response_model=ColdDMResponse,
    summary="Generate a Cold DM for a job",
)
async def generate_cold_dm(
    job_id: UUID,
    data: ColdDMRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ColdDMResponse:
    """Generate a tailored cold DM based on a resume and job description."""
    job_repo = JobRepository(db)
    resume_repo = ResumeRepository(db)

    job = await job_repo.get_by_id(job_id, current_user.user_id)
    if not job:
        raise NotFoundError("Job", job_id)

    resume = await resume_repo.get_with_details(data.resume_id, current_user.user_id)
    if not resume:
        raise NotFoundError("Resume", data.resume_id)

    resume_text = "\n\n".join(s.raw_text for s in resume.sections)

    dm_service = ColdDMService()
    content = await dm_service.generate_cold_dm(resume_text, job.description, data.tone)

    return ColdDMResponse(
        email=content.get("email", ""),
        linkedin=content.get("linkedin", "")
    )


@router.get(
    "/{job_id}/recruiter-lookup",
    response_model=list[dict],
    summary="Find recruiters for a job",
)
async def lookup_recruiters(
    job_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    """Find public recruiter profiles for a job's company."""
    job_repo = JobRepository(db)
    job = await job_repo.get_by_id(job_id, current_user.user_id)
    if not job:
        raise NotFoundError("Job", job_id)

    from app.services.recruiter_discovery import RecruiterDiscoveryService
    service = RecruiterDiscoveryService()
    # Try to extract role area from job title (e.g. "Software Engineer")
    role_area = job.title.split()[0] if job.title else ""
    results = await service.find_recruiters(job.company, role_area)
    return results


@router.get(
    "/{job_id}/boost-suggestions",
    response_model=dict,
    summary="Get suggestions to improve ATS score for a job",
)
async def get_boost_suggestions(
    job_id: UUID,
    resume_id: UUID = Query(...),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get actionable suggestions to boost resume match for this job."""
    job_repo = JobRepository(db)
    resume_repo = ResumeRepository(db)

    job = await job_repo.get_with_requirements(job_id, current_user.user_id)
    if not job:
        raise NotFoundError("Job", job_id)

    resume = await resume_repo.get_with_details(resume_id, current_user.user_id)
    if not resume:
        raise NotFoundError("Resume", resume_id)

    # 1. Recompute match score internally to pass to BoostService
    engine = MatchEngineService()
    sections = [{"section_type": s.section_type, "raw_text": s.raw_text, "normalized_text": s.normalized_text} for s in resume.sections]
    evidence = [{"claim_text": e.claim_text, "verified": e.verified} for e in resume.evidence_items]
    requirements = [{"requirement_type": r.requirement_type, "requirement_text": r.requirement_text, "normalized_skill": r.normalized_skill} for r in job.requirements]
    job_metadata = {"title": job.title, "company": job.company, "location": job.location, "experience_level": job.experience_level}
    
    match_result = await engine.calculate_match(sections, evidence, requirements, job_metadata)
    
    # Format inputs for BoostService
    resume_data = "\n".join(s.raw_text for s in resume.sections)
    job_reqs = {
        "title": job.title,
        "company": job.company,
        "required_skills": [r.requirement_text for r in job.requirements if r.requirement_type == "required"],
        "preferred_skills": [r.requirement_text for r in job.requirements if r.requirement_type == "preferred"]
    }
    
    # We map missing skills from gaps
    missing_req = [g["skill"] for g in match_result["gaps"] if g.get("requirement_type") == "required"]
    missing_pref = [g["skill"] for g in match_result["gaps"] if g.get("requirement_type") == "preferred"]
    
    score_breakdown = {
        "overall": match_result["scores"]["overall"],
        "required_skill_coverage": match_result["scores"]["required_skill_coverage"],
        "missing_required_skills": missing_req,
        "missing_preferred_skills": missing_pref,
        "evidence_strength": match_result["scores"]["evidence_strength"]
    }

    from app.services.boost_service import BoostService
    service = BoostService()
    suggestions = await service.get_boost_suggestions(resume_data, job_reqs, score_breakdown)
    
    return {
        "job_id": str(job.id),
        "score_breakdown": score_breakdown,
        "suggestions": suggestions
    }
