"""
CareerForge AI — Resume Schemas.

Request/response schemas for resume upload, parsing, and health audit.
Resume content is never logged or exposed unnecessarily.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ResumeSectionResponse(BaseModel):
    """
    A parsed resume section.

    Attributes:
        id: Section UUID.
        section_type: Category (experience, education, skills, etc.).
        raw_text: Original extracted text.
        normalized_text: Cleaned text for processing.
        order_index: Display order.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    section_type: str
    raw_text: str
    normalized_text: str | None
    order_index: int


class EvidenceItemResponse(BaseModel):
    """
    An evidence item extracted from a resume.

    Attributes:
        id: Evidence UUID.
        claim_text: The factual claim.
        source_span: Location in original document.
        verified: Whether the claim has been verified.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    claim_text: str
    source_span: str | None
    verified: bool


class ResumeUploadResponse(BaseModel):
    """
    Response after successful resume upload.

    Attributes:
        id: Resume UUID.
        original_filename: Sanitized filename.
        source_type: File format (pdf/docx).
        status: Current processing status.
        created_at: Upload timestamp.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    original_filename: str
    source_type: str
    status: str
    created_at: datetime


class ResumeResponse(BaseModel):
    """
    Full resume data with sections and evidence.

    Attributes:
        id: Resume UUID.
        original_filename: Sanitized filename.
        source_type: File format.
        status: Processing status.
        sections: Parsed resume sections.
        evidence_items: Extracted evidence.
        created_at: Upload timestamp.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    original_filename: str
    source_type: str
    status: str
    sections: list[ResumeSectionResponse] = []
    evidence_items: list[EvidenceItemResponse] = []
    created_at: datetime


class AuditIssue(BaseModel):
    """
    A single issue found during resume health audit.

    Attributes:
        severity: Issue severity (critical, warning, info).
        category: Issue category (grammar, formatting, content, etc.).
        message: Human-readable issue description.
        suggestion: Suggested fix.
        section: Which resume section is affected.
        line_reference: Approximate location in the section.
    """

    severity: str = Field(description="critical, warning, or info")
    category: str = Field(description="grammar, formatting, content, quantification, etc.")
    message: str = Field(description="Issue description")
    suggestion: str = Field(description="Suggested fix")
    section: str | None = Field(default=None, description="Affected section")
    line_reference: str | None = Field(default=None, description="Location hint")


class ResumeAuditResponse(BaseModel):
    """
    Resume health audit results.

    Detects: grammar/wording problems, weak bullets, repetition,
    poor section hierarchy, inconsistent dates, missing contact data,
    formatting risks, vague claims, lack of genuine quantification,
    and job-specific relevance gaps.

    Never invents claims or issues.

    Attributes:
        resume_id: Audited resume UUID.
        overall_score: Health score (0-100).
        issues: List of identified issues.
        summary: Brief audit summary.
        strengths: Identified strengths.
    """

    resume_id: uuid.UUID
    overall_score: float = Field(ge=0, le=100)
    issues: list[AuditIssue]
    summary: str
    strengths: list[str]
