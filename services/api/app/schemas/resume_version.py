"""
CareerForge AI — Resume Version Schemas.

Request/response schemas for tailored resume generation and rendering.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ResumeVersionCreateRequest(BaseModel):
    """
    Request to create a tailored resume version.

    Attributes:
        base_resume_id: Source resume for tailoring.
        job_id: Target job to tailor for.
        template: Resume template to use.
    """

    base_resume_id: uuid.UUID = Field(description="Source resume UUID")
    job_id: uuid.UUID = Field(description="Target job UUID")
    template: str = Field(
        default="faang_technical",
        description="Template: faang_technical, analytics, business",
    )


class RenderRequest(BaseModel):
    """
    Request to render a resume version to DOCX/PDF.

    Attributes:
        format: Output format ('docx' or 'pdf').
    """

    format: str = Field(
        default="docx",
        pattern="^(docx|pdf)$",
        description="Output format: docx or pdf",
    )


class ResumeVersionResponse(BaseModel):
    """
    Tailored resume version data.

    Attributes:
        id: Version UUID.
        base_resume_id: Source resume.
        job_id: Target job.
        template: Template used.
        content_json: Structured resume content.
        docx_storage_key: Generated DOCX path.
        pdf_storage_key: Generated PDF path.
        readiness_score: Quality score (0-100).
        created_at: Generation timestamp.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    base_resume_id: uuid.UUID
    job_id: uuid.UUID | None
    template: str
    content_json: dict  # type: ignore[type-arg]
    docx_storage_key: str | None
    pdf_storage_key: str | None
    readiness_score: Decimal | None
    created_at: datetime
