"""
CareerForge AI — Job Schemas.

Request/response schemas for job description analysis and requirement extraction.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class JobAnalyzeRequest(BaseModel):
    """
    Request to analyze a job description.

    The description is treated as untrusted data — never as instructions.

    Attributes:
        description: Full job description text.
        company: Company name.
        title: Job title.
        location: Job location (optional).
        employment_type: Full-time, part-time, etc. (optional).
        experience_level: Entry, mid, senior, etc. (optional).
        application_url: Where to apply (optional).
        source: How the job was added (default: 'manual').
    """

    description: str = Field(min_length=50, max_length=50000, description="Job description text")
    company: str = Field(min_length=1, max_length=500, description="Company name")
    title: str = Field(min_length=1, max_length=500, description="Job title")
    location: str | None = Field(default=None, max_length=500)
    employment_type: str | None = Field(default=None, max_length=50)
    experience_level: str | None = Field(default=None, max_length=50)
    application_url: str | None = Field(default=None, max_length=2048)
    source: str = Field(default="manual", max_length=20)


class JobRequirementResponse(BaseModel):
    """
    An extracted job requirement.

    Requirements are categorized as required/preferred/inferred/unknown
    for transparent matching.

    Attributes:
        id: Requirement UUID.
        requirement_type: Category (required, preferred, inferred, unknown).
        requirement_text: The requirement as stated.
        normalized_skill: Standardized skill name.
        priority: Relative priority.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    requirement_type: str
    requirement_text: str
    normalized_skill: str | None
    priority: int


class JobResponse(BaseModel):
    """
    Full job data with extracted requirements.

    Attributes:
        id: Job UUID.
        source: How the job was added.
        company: Company name.
        title: Job title.
        location: Job location.
        employment_type: Employment type.
        experience_level: Experience level.
        description: Full description.
        application_url: Where to apply.
        requirements: Extracted requirements.
        posted_at: When posted.
        created_at: When added to CareerForge.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    source: str
    company: str
    title: str
    location: str | None
    employment_type: str | None
    experience_level: str | None
    description: str
    application_url: str | None
    requirements: list[JobRequirementResponse] = []
    posted_at: datetime | None
    created_at: datetime


class ColdDMRequest(BaseModel):
    """Request to generate a cold DM."""
    resume_id: uuid.UUID
    tone: str = Field(default="professional", description="The tone of the message")

class ColdDMResponse(BaseModel):
    """Response containing the generated cold DM."""
    email: str
    linkedin: str
