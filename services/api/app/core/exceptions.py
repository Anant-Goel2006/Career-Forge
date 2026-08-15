"""
CareerForge AI — Structured API Exceptions.

Provides a consistent error hierarchy that maps to HTTP status codes
and structured JSON error responses. Every error includes:
- A stable error code for client-side handling
- A human-readable message
- Optional detail metadata (never containing secrets)

Security:
    - Error messages never expose internal state, SQL, or stack traces
    - Secrets, file paths, and system info are redacted
    - All errors are logged server-side with full context
"""

from typing import Any
from uuid import UUID


class CareerForgeError(Exception):
    """
    Base exception for all CareerForge application errors.

    Subclasses define specific HTTP status codes and error categories.
    The API exception handler converts these to structured JSON responses.

    Attributes:
        status_code: HTTP status code to return.
        error_code: Stable machine-readable error identifier.
        message: Human-readable error description.
        detail: Optional additional context (never contains secrets).
    """

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        detail: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.detail = detail or {}
        super().__init__(self.message)


class ValidationError(CareerForgeError):
    """Request validation failed (400)."""

    status_code = 400
    error_code = "VALIDATION_ERROR"


class AuthenticationError(CareerForgeError):
    """Authentication required or credentials invalid (401)."""

    status_code = 401
    error_code = "AUTHENTICATION_ERROR"

    def __init__(self, message: str = "Authentication required.") -> None:
        super().__init__(message)


class AuthorizationError(CareerForgeError):
    """
    User lacks permission for the requested action (403).

    Authorization is deterministic and server-side only.
    AI is never used as an authorization engine.
    """

    status_code = 403
    error_code = "AUTHORIZATION_ERROR"

    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(message)


class NotFoundError(CareerForgeError):
    """Requested resource does not exist (404)."""

    status_code = 404
    error_code = "NOT_FOUND"

    def __init__(
        self,
        resource_type: str = "Resource",
        resource_id: str | UUID | None = None,
    ) -> None:
        resource_id_str = str(resource_id) if resource_id else "unknown"
        super().__init__(
            message=f"{resource_type} not found.",
            detail={"resource_type": resource_type, "resource_id": resource_id_str},
        )


class ConflictError(CareerForgeError):
    """Resource conflict, e.g. duplicate entry (409)."""

    status_code = 409
    error_code = "CONFLICT"


class FileTooLargeError(CareerForgeError):
    """Uploaded file exceeds size limits (413)."""

    status_code = 413
    error_code = "FILE_TOO_LARGE"

    def __init__(self, max_size_mb: int) -> None:
        super().__init__(
            message=f"File exceeds the maximum allowed size of {max_size_mb}MB.",
            detail={"max_size_mb": max_size_mb},
        )


class UnsupportedFileTypeError(CareerForgeError):
    """File type is not in the allowlist (415)."""

    status_code = 415
    error_code = "UNSUPPORTED_FILE_TYPE"

    def __init__(self, allowed_types: list[str] | None = None) -> None:
        types = allowed_types or [".pdf", ".docx"]
        super().__init__(
            message=f"Unsupported file type. Allowed: {', '.join(types)}",
            detail={"allowed_types": types},
        )


class RateLimitError(CareerForgeError):
    """Request rate limit exceeded (429)."""

    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"

    def __init__(self, retry_after_seconds: int = 60) -> None:
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            detail={"retry_after_seconds": retry_after_seconds},
        )


class AIProviderError(CareerForgeError):
    """AI provider (Gemini) returned an error or timed out (502)."""

    status_code = 502
    error_code = "AI_PROVIDER_ERROR"

    def __init__(self, message: str = "AI service is temporarily unavailable.") -> None:
        super().__init__(message)


class AIValidationError(CareerForgeError):
    """
    AI output failed evidence validation (422).

    AI output is untrusted until validated. This error indicates
    the AI generated content that could not be verified against
    candidate evidence.
    """

    status_code = 422
    error_code = "AI_VALIDATION_ERROR"

    def __init__(self, message: str = "AI output failed validation checks.") -> None:
        super().__init__(message)
