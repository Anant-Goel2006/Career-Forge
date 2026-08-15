"""
CareerForge AI — Resume Version Endpoints.

Handles tailored resume creation and DOCX/PDF rendering.
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.core.security import TokenData, get_current_user
from app.repositories.resume_version import ResumeVersionRepository
from app.repositories.resume import ResumeRepository
from app.repositories.job import JobRepository
from app.services.tailor_service import TailorService
from app.schemas.resume_version import (
    ResumeVersionCreateRequest,
    ResumeVersionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=ResumeVersionResponse,
    status_code=201,
    summary="Create a tailored resume version",
)
async def create_resume_version(
    data: ResumeVersionCreateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeVersionResponse:
    """
    Create a tailored resume version for a specific job.

    Uses evidence-backed content only — never fabricates claims.
    Content is structured for downstream DOCX/PDF rendering.
    """
    version_repo = ResumeVersionRepository(db)
    resume_repo = ResumeRepository(db)
    job_repo = JobRepository(db)

    resume = await resume_repo.get_with_details(data.base_resume_id, current_user.user_id)
    if not resume:
        raise NotFoundError("Resume", data.base_resume_id)

    job = await job_repo.get_by_id(data.job_id, current_user.user_id)
    if not job:
        raise NotFoundError("Job", data.job_id)

    resume_text = "\n\n".join(s.raw_text for s in resume.sections)

    tailor_svc = TailorService()
    tailored_data = await tailor_svc.generate_faang_template(
        base_resume_text=resume_text,
        job_description=job.description,
        job_title=job.title,
        company=job.company,
    )

    version = await version_repo.create(
        user_id=current_user.user_id,
        base_resume_id=data.base_resume_id,
        job_id=data.job_id,
        template=data.template,
        content_json=tailored_data,
    )

    return ResumeVersionResponse.model_validate(version)


@router.get(
    "/{version_id}",
    response_model=ResumeVersionResponse,
    summary="Get a resume version",
)
async def get_resume_version(
    version_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeVersionResponse:
    """Get a tailored resume version by ID."""
    version_repo = ResumeVersionRepository(db)
    version = await version_repo.get_by_id(version_id, current_user.user_id)
    if version is None:
        raise NotFoundError("Resume Version", version_id)
    return ResumeVersionResponse.model_validate(version)
