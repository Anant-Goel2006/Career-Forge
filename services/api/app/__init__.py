"""
CareerForge AI — Backend API Application Package.

This package contains the FastAPI application for the CareerForge AI platform,
an evidence-backed job application intelligence system.

Architecture:
    app/api/      → REST API route handlers (versioned)
    app/core/     → Configuration, database, middleware, exceptions
    app/models/   → SQLAlchemy ORM models
    app/schemas/  → Pydantic v2 request/response schemas
    app/repositories/ → Data access layer with tenant isolation
    app/services/ → Business logic (parsing, matching, tailoring, AI)
    app/security/ → Authentication, authorization, file validation
    app/workers/  → Background job processors
"""

__version__ = "1.0.0"
