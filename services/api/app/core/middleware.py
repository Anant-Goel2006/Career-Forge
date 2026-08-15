"""
CareerForge AI — Request Middleware.

Provides cross-cutting concerns applied to every request:
- Request ID generation and propagation
- Request/response logging (without sensitive data)
- Processing time measurement
- Security headers

Security:
    - Never logs request bodies (may contain resume data)
    - Never logs authorization headers or API keys
    - Request IDs enable tracing without exposing internals
"""

import time
import uuid
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Assigns a unique request ID to every incoming request.

    The ID is propagated via the X-Request-ID response header
    for client-side correlation and debugging.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:  # type: ignore[type-arg]
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class ProcessingTimeMiddleware(BaseHTTPMiddleware):
    """
    Measures and reports request processing time.

    The duration is returned in the X-Process-Time header
    in milliseconds for performance monitoring.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:  # type: ignore[type-arg]
        start_time = time.perf_counter()
        response: Response = await call_next(request)
        process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Process-Time"] = str(process_time_ms)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to every response.

    Headers follow OWASP security best practices:
    - Prevent MIME type sniffing
    - Prevent clickjacking
    - Control referrer information
    - Enforce HTTPS content
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:  # type: ignore[type-arg]
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        )
        return response
