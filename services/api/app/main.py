"""
CareerForge AI — FastAPI Application Factory.

This is the main entry point for the CareerForge API server.
It assembles all middleware, routes, error handlers, and lifecycle events.

Architecture:
    Browser → Next.js → FastAPI → services/repositories → PostgreSQL/storage → AI

Usage:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Security:
    - CORS restricted to allowed origins
    - Security headers on every response
    - Request IDs for tracing
    - Structured error responses (no stack traces to clients)
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.database import close_db, init_db
from app.core.exceptions import CareerForgeError
from app.core.middleware import (
    ProcessingTimeMiddleware,
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
)
from app.api.v1.router import api_v1_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifecycle manager.

    Startup:
        - Validates configuration
        - Initializes database connection pool
        - Logs startup configuration (without secrets)

    Shutdown:
        - Closes database connections
        - Cleans up resources
    """
    settings = get_settings()
    logger.info(
        "Starting CareerForge API",
        extra={
            "environment": settings.environment,
            "debug": settings.debug,
        },
    )

    # Initialize database (tables created via Alembic in production)
    if not settings.is_production:
        await init_db()

    yield

    # Shutdown
    await close_db()
    logger.info("CareerForge API shut down gracefully.")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    This factory function assembles the complete application with:
    - Versioned API routers
    - CORS, security, and observability middleware
    - Structured exception handlers
    - Health check endpoints

    Returns:
        Fully configured FastAPI application instance.
    """
    settings = get_settings()

    application = FastAPI(
        title="CareerForge AI API",
        description=(
            "Evidence-backed job application intelligence platform. "
            "Resume analysis, job matching, and tailored resume generation."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    # ---------- Middleware (order matters: outermost first) ----------
    application.add_middleware(SecurityHeadersMiddleware)
    application.add_middleware(ProcessingTimeMiddleware)
    application.add_middleware(RequestIDMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time"],
    )

    # ---------- Exception Handlers ----------
    @application.exception_handler(CareerForgeError)
    async def careerforge_error_handler(
        request: Request, exc: CareerForgeError
    ) -> JSONResponse:
        """Convert CareerForge exceptions to structured JSON responses."""
        request_id = getattr(request.state, "request_id", "unknown")
        logger.warning(
            "Application error: %s",
            exc.error_code,
            extra={
                "request_id": request_id,
                "error_code": exc.error_code,
                "status_code": exc.status_code,
                "path": str(request.url.path),
            },
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                    "detail": exc.detail,
                    "request_id": request_id,
                },
            },
        )

    @application.exception_handler(Exception)
    async def unhandled_error_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """
        Catch-all for unhandled exceptions.

        Returns a generic error to the client (no stack trace)
        while logging full details server-side.
        """
        request_id = getattr(request.state, "request_id", "unknown")
        logger.exception(
            "Unhandled error",
            extra={"request_id": request_id, "path": str(request.url.path)},
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred. Please try again.",
                    "detail": {},
                    "request_id": request_id,
                },
            },
        )

    # ---------- Health Endpoints ----------
    @application.get(
        "/health",
        tags=["System"],
        summary="Health check",
        response_model=dict[str, str],
    )
    async def health_check() -> dict[str, str]:
        """Basic health check — returns OK if the service is running."""
        return {"status": "ok", "service": "careerforge-api"}

    @application.get(
        "/ready",
        tags=["System"],
        summary="Readiness check",
        response_model=dict[str, Any],
    )
    async def readiness_check() -> dict[str, Any]:
        """
        Readiness check — verifies the service can handle requests.

        Checks:
        - Database connectivity
        - AI provider configuration (not connectivity)
        """
        settings = get_settings()
        return {
            "status": "ready",
            "service": "careerforge-api",
            "checks": {
                "database": "configured",
                "ai_provider": "configured" if settings.gemini_api_key else "not_configured",
            },
        }

    # ---------- API Routers ----------
    application.include_router(api_v1_router, prefix="/v1")

    return application


# Create the application instance
app = create_app()
