"""
CareerForge AI — Application Endpoints.

Handles job application tracking with status management.
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.core.security import TokenData, get_current_user
from app.repositories.application import ApplicationRepository
from app.schemas.application import (
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationUpdateRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "",
    response_model=list[ApplicationResponse],
    summary="List applications",
)
async def list_applications(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ApplicationResponse]:
    """List all applications for the current user."""
    app_repo = ApplicationRepository(db)
    apps, _ = await app_repo.list_by_user(current_user.user_id, limit=100)
    return [ApplicationResponse.model_validate(a) for a in apps]


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=201,
    summary="Create an application",
)
async def create_application(
    data: ApplicationCreateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    """Create a new job application record."""
    app_repo = ApplicationRepository(db)
    application = await app_repo.create(
        user_id=current_user.user_id,
        job_id=data.job_id,
        resume_version_id=data.resume_version_id,
        status=data.status,
    )
    return ApplicationResponse.model_validate(application)


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Update application status",
)
async def update_application(
    application_id: UUID,
    data: ApplicationUpdateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    """Update an application's status and dates."""
    app_repo = ApplicationRepository(db)
    application = await app_repo.update(
        application_id,
        current_user.user_id,
        status=data.status,
        applied_at=data.applied_at,
        follow_up_at=data.follow_up_at,
    )
    if application is None:
        raise NotFoundError("Application", application_id)
    return ApplicationResponse.model_validate(application)
