"""
CareerForge AI — Job Endpoints.

Handles job description analysis and requirement extraction.

Security:
    - Job descriptions treated as untrusted data
    - AI output validated before persistence
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.core.security import TokenData, get_current_user
from app.repositories.job import JobRepository, JobRequirementRepository
from app.schemas.job import JobAnalyzeRequest, JobResponse, ColdDMRequest, ColdDMResponse
from app.services.job_analyzer import JobAnalyzerService
from app.services.cold_dm_service import ColdDMService

logger = logging.getLogger(__name__)

router = APIRouter()


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
    from app.repositories.resume import ResumeRepository
    
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
    
    return ColdDMResponse(content=content)
