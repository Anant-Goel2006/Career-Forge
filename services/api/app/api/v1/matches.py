"""
CareerForge AI — Match Endpoints.

Handles resume-job match analysis with deterministic scoring.
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.core.security import TokenData, get_current_user
from app.repositories.job import JobRepository
from app.repositories.match import MatchReportRepository
from app.repositories.resume import ResumeRepository
from app.schemas.match import MatchCreateRequest, MatchReportResponse
from app.services.match_engine import MatchEngineService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=MatchReportResponse,
    status_code=201,
    summary="Create a match analysis",
)
async def create_match(
    data: MatchCreateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchReportResponse:
    """
    Perform a deterministic match analysis between a resume and job.

    Calculates transparent sub-scores and identifies skill gaps.
    Scoring is algorithmic, not AI-driven, for reproducibility.
    """
    resume_repo = ResumeRepository(db)
    job_repo = JobRepository(db)
    match_repo = MatchReportRepository(db)
    engine = MatchEngineService()

    # Verify resume ownership
    resume = await resume_repo.get_with_details(data.resume_id, current_user.user_id)
    if resume is None:
        raise NotFoundError("Resume", data.resume_id)

    # Get job with requirements
    job = await job_repo.get_with_requirements(data.job_id, current_user.user_id)
    if job is None:
        raise NotFoundError("Job", data.job_id)

    # Prepare data for matching
    sections = [
        {"section_type": s.section_type, "raw_text": s.raw_text, "normalized_text": s.normalized_text}
        for s in resume.sections
    ]
    evidence = [
        {"claim_text": e.claim_text, "verified": e.verified}
        for e in resume.evidence_items
    ]
    requirements = [
        {
            "requirement_type": r.requirement_type,
            "requirement_text": r.requirement_text,
            "normalized_skill": r.normalized_skill,
        }
        for r in job.requirements
    ]
    job_metadata = {
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "employment_type": job.employment_type,
        "experience_level": job.experience_level,
    }

    # Calculate match
    result = engine.calculate_match(sections, evidence, requirements, job_metadata)

    # Store match report
    match_report = await match_repo.create(
        user_id=current_user.user_id,
        resume_id=data.resume_id,
        job_id=data.job_id,
        score_json=result["scores"],
        gaps_json=result["gaps"],
    )

    return MatchReportResponse(
        id=match_report.id,
        resume_id=data.resume_id,
        job_id=data.job_id,
        scores=result["scores"],
        gaps=result["gaps"],
        created_at=match_report.created_at,
    )


@router.get(
    "/{match_id}",
    response_model=MatchReportResponse,
    summary="Get a saved match analysis",
)
async def get_match(
    match_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchReportResponse:
    """Return a match report owned by the authenticated user."""
    match_repo = MatchReportRepository(db)
    match_report = await match_repo.get_for_user(match_id, current_user.user_id)
    if match_report is None:
        raise NotFoundError("Match report", match_id)

    return MatchReportResponse(
        id=match_report.id,
        resume_id=match_report.resume_id,
        job_id=match_report.job_id,
        scores=match_report.score_json,
        gaps=match_report.gaps_json,
        created_at=match_report.created_at,
    )
