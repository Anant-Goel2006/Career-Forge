"""
CareerForge AI — Common Schemas.

Shared request/response schemas used across all API endpoints.
Provides consistent pagination, error responses, and health checks.
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """
    Pagination parameters for list endpoints.

    Attributes:
        page: Page number (1-indexed).
        page_size: Number of items per page.
    """

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        """Calculate SQL offset from page and page_size."""
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated list response wrapper.

    Attributes:
        items: List of items for the current page.
        total: Total number of items across all pages.
        page: Current page number.
        page_size: Items per page.
        total_pages: Total number of pages.
    """

    items: list[T]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_pages: int = Field(ge=0)


class ErrorDetail(BaseModel):
    """
    Structured error detail.

    Attributes:
        code: Machine-readable error code.
        message: Human-readable error message.
        detail: Optional additional context.
        request_id: Request identifier for tracing.
    """

    code: str
    message: str
    detail: dict[str, Any] = Field(default_factory=dict)
    request_id: str = ""


class ErrorResponse(BaseModel):
    """
    Standard error response envelope.

    All API errors return this structure for consistent
    client-side error handling.
    """

    error: ErrorDetail


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str


class ReadinessResponse(BaseModel):
    """Readiness check response with dependency status."""

    status: str
    service: str
    checks: dict[str, str]
