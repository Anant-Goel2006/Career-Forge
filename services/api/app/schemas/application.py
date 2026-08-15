"""
CareerForge AI — Application Schemas.

Request/response schemas for job application tracking.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ApplicationCreateRequest(BaseModel):
    """
    Request to create a job application record.

    Attributes:
        job_id: Target job.
        resume_version_id: Resume version used (optional).
        status: Initial status (default: 'saved').
    """

    job_id: uuid.UUID
    resume_version_id: uuid.UUID | None = None
    status: str = Field(default="saved", pattern="^(saved|applied)$")


class ApplicationUpdateRequest(BaseModel):
    """
    Request to update an application status.

    Attributes:
        status: New status.
        applied_at: When applied (if status = 'applied').
        follow_up_at: Scheduled follow-up date.
    """

    status: str = Field(
        pattern="^(saved|applied|interviewing|offered|accepted|rejected|withdrawn)$",
    )
    applied_at: datetime | None = None
    follow_up_at: datetime | None = None


class ApplicationResponse(BaseModel):
    """
    Application record response.

    Attributes:
        id: Application UUID.
        job_id: Target job.
        resume_version_id: Resume version used.
        status: Current status.
        applied_at: When applied.
        follow_up_at: Follow-up date.
        created_at: Record creation date.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    job_id: uuid.UUID
    resume_version_id: uuid.UUID | None
    status: str
    applied_at: datetime | None
    follow_up_at: datetime | None
