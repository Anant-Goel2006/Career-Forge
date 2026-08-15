"""
CareerForge AI — Match Report Schemas.

Request/response schemas for resume-job match analysis.
Scoring is deterministic with transparent sub-scores.
Never promises universal ATS compatibility or guaranteed scores.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MatchScores(BaseModel):
    """
    Transparent sub-scores for a resume-job match.

    Each score is 0-100 with clear methodology.
    No single "ATS score" — transparency over simplicity.

    Attributes:
        required_skill_coverage: % of required skills matched with evidence.
        preferred_skill_coverage: % of preferred skills matched.
        evidence_strength: Quality of supporting evidence.
        role_fit: How well the candidate's experience fits the role.
        experience_fit: Experience level alignment.
        education_fit: Education requirement match.
        location_fit: Location compatibility.
        keyword_alignment: Keyword overlap with JD.
        formatting_readiness: Resume formatting quality.
        overall: Weighted aggregate (not an "ATS score").
    """

    required_skill_coverage: float = Field(ge=0, le=100)
    preferred_skill_coverage: float = Field(ge=0, le=100)
    evidence_strength: float = Field(ge=0, le=100)
    role_fit: float = Field(ge=0, le=100)
    experience_fit: float = Field(ge=0, le=100)
    education_fit: float = Field(ge=0, le=100)
    location_fit: float = Field(ge=0, le=100)
    keyword_alignment: float = Field(ge=0, le=100)
    formatting_readiness: float = Field(ge=0, le=100)
    overall: float = Field(ge=0, le=100)


class SkillGap(BaseModel):
    """
    An identified skill gap between resume and job requirements.

    Attributes:
        skill: The missing or weak skill.
        requirement_type: Whether required or preferred.
        importance: How important this gap is (high, medium, low).
        suggestion: How to address the gap (if possible with existing evidence).
    """

    skill: str
    requirement_type: str = Field(description="required or preferred")
    importance: str = Field(description="high, medium, or low")
    suggestion: str


class MatchCreateRequest(BaseModel):
    """
    Request to create a match analysis.

    Attributes:
        resume_id: Resume to match.
        job_id: Job to match against.
    """

    resume_id: uuid.UUID
    job_id: uuid.UUID


class MatchReportResponse(BaseModel):
    """
    Full match report with scores and gaps.

    Attributes:
        id: Match report UUID.
        resume_id: Matched resume.
        job_id: Matched job.
        scores: Transparent sub-scores.
        gaps: Identified skill gaps.
        created_at: Analysis timestamp.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    resume_id: uuid.UUID
    job_id: uuid.UUID
    scores: MatchScores
    gaps: list[SkillGap]
    created_at: datetime
