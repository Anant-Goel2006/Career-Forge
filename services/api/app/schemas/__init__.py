"""CareerForge AI — Schemas package."""

from app.schemas.common import (
    ErrorResponse,
    HealthResponse,
    PaginatedResponse,
    PaginationParams,
)
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from app.schemas.resume import (
    ResumeUploadResponse,
    ResumeResponse,
    ResumeSectionResponse,
    ResumeAuditResponse,
    AuditIssue,
)
from app.schemas.job import (
    JobAnalyzeRequest,
    JobResponse,
    JobRequirementResponse,
)
from app.schemas.match import (
    MatchCreateRequest,
    MatchReportResponse,
    MatchScores,
    SkillGap,
)
from app.schemas.resume_version import (
    ResumeVersionCreateRequest,
    ResumeVersionResponse,
    RenderRequest,
)

__all__ = [
    "ErrorResponse", "HealthResponse", "PaginatedResponse", "PaginationParams",
    "UserCreate", "UserLogin", "UserResponse", "TokenResponse",
    "ResumeUploadResponse", "ResumeResponse", "ResumeSectionResponse",
    "ResumeAuditResponse", "AuditIssue",
    "JobAnalyzeRequest", "JobResponse", "JobRequirementResponse",
    "MatchCreateRequest", "MatchReportResponse", "MatchScores", "SkillGap",
    "ResumeVersionCreateRequest", "ResumeVersionResponse", "RenderRequest",
]
