"""
CareerForge AI — V1 API Router.

Assembles all versioned API endpoints under /v1/.
Each module handles its own validation, authorization,
and error handling through FastAPI dependencies.

Endpoints:
    POST   /v1/auth/register
    POST   /v1/auth/login
    POST   /v1/resumes
    GET    /v1/resumes/{id}
    POST   /v1/resumes/{id}/audit
    POST   /v1/jobs/analyze
    GET    /v1/jobs
    GET    /v1/jobs/{id}
    GET    /v1/jobs/search
    POST   /v1/matches
    GET    /v1/matches/{id}
    POST   /v1/resume-versions
    GET    /v1/resume-versions/{id}
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.matches import router as matches_router
from app.api.v1.resume_versions import router as versions_router
from app.api.v1.assistant import router as assistant_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(resumes_router, prefix="/resumes", tags=["Resumes"])
api_v1_router.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
api_v1_router.include_router(matches_router, prefix="/matches", tags=["Matching"])
api_v1_router.include_router(versions_router, prefix="/resume-versions", tags=["Resume Versions"])
api_v1_router.include_router(assistant_router, prefix="/assistant", tags=["Assistant"])
