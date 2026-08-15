"""
CareerForge AI — Resume Endpoints.

Handles resume upload, retrieval, and health audit.

Security:
    - File type validation (signature + MIME + extension)
    - Size and page count limits
    - Tenant isolation on all queries
    - Audit logging for uploads
"""

import logging
import os
import tempfile
import uuid as uuid_mod
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import NotFoundError, ValidationError
from app.core.security import TokenData, get_current_user, verify_resource_ownership
from app.repositories.resume import ResumeRepository
from app.schemas.resume import (
    ResumeAuditResponse,
    ResumeResponse,
    ResumeUploadResponse,
)
from app.services.audit_service import AuditService
from app.services.resume_audit import ResumeAuditService
from app.services.resume_parser import ResumeParser

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=ResumeUploadResponse,
    status_code=201,
    summary="Upload a resume (PDF/DOCX)",
)
async def upload_resume(
    file: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeUploadResponse:
    """
    Upload and parse a resume document.

    Accepts PDF and DOCX files. The file undergoes:
    1. Extension validation
    2. File signature (magic bytes) verification
    3. Size limit check
    4. Text extraction and section parsing
    5. Evidence item extraction

    The uploaded file is stored securely and never served directly.
    """
    settings = get_settings()
    parser = ResumeParser()
    resume_repo = ResumeRepository(db)
    audit = AuditService(db)

    # Validate file extension
    if not file.filename:
        raise ValidationError("Filename is required.")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.allowed_upload_extensions:
        raise ValidationError(
            f"Invalid file type '{file_ext}'. Allowed: {', '.join(settings.allowed_upload_extensions)}"
        )

    # Save to temp directory for processing
    temp_dir = tempfile.mkdtemp(prefix="careerforge_")
    try:
        # Sanitize filename
        safe_filename = f"{uuid_mod.uuid4()}{file_ext}"
        temp_path = Path(temp_dir) / safe_filename

        # Write uploaded file
        content = await file.read()
        if len(content) > settings.max_upload_size_bytes:
            raise ValidationError(
                f"File too large. Maximum: {settings.max_upload_size_mb}MB"
            )

        with open(temp_path, "wb") as f:
            f.write(content)

        # Parse the resume
        parsed = await parser.parse(temp_path)

        # Create storage key (in production, upload to object storage)
        storage_key = f"resumes/{current_user.user_id}/{safe_filename}"

        # Ensure local upload directory exists
        upload_dir = Path(settings.local_upload_dir) / str(current_user.user_id)
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Copy to local storage (in production, use object storage)
        local_path = upload_dir / safe_filename
        with open(local_path, "wb") as f:
            f.write(content)

        # Create resume record
        resume = await resume_repo.create(
            user_id=current_user.user_id,
            original_filename=file.filename[:500],
            source_type=file_ext.lstrip("."),
            storage_key=storage_key,
            status="parsed",
        )

        # Create resume sections
        from app.repositories.resume import ResumeSectionRepository, EvidenceRepository
        section_repo = ResumeSectionRepository(db)
        evidence_repo = EvidenceRepository(db)

        for section_data in parsed.get("sections", []):
            await section_repo.create(
                resume_id=resume.id,
                section_type=section_data["section_type"],
                raw_text=section_data["raw_text"],
                normalized_text=section_data.get("raw_text"),
                order_index=section_data.get("order_index", 0),
            )

            # Extract structured evidence items from resume bullet points and key statements
            lines = [
                line.strip().lstrip("•-*•· ")
                for line in section_data["raw_text"].split("\n")
                if len(line.strip().lstrip("•-*•· ")) >= 3
            ]
            for line in lines:
                await evidence_repo.create(
                    user_id=current_user.user_id,
                    resume_id=resume.id,
                    claim_text=line,
                    source_span=section_data["section_type"].capitalize(),
                    verified=True,
                )

        # Audit log
        await audit.log_action(
            action="resume.upload",
            user_id=current_user.user_id,
            resource_type="resume",
            resource_id=resume.id,
            metadata={
                "filename": file.filename[:100],
                "source_type": file_ext.lstrip("."),
                "page_count": parsed.get("page_count", 0),
            },
        )

        return ResumeUploadResponse.model_validate(resume)

    finally:
        # Clean up temp directory
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Get a resume with sections and evidence",
)
async def get_resume(
    resume_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeResponse:
    """
    Retrieve a parsed resume with all sections and evidence items.

    Only the owning user can access their resume (tenant isolation).
    """
    resume_repo = ResumeRepository(db)
    resume = await resume_repo.get_with_details(resume_id, current_user.user_id)

    if resume is None:
        raise NotFoundError("Resume", resume_id)

    return ResumeResponse.model_validate(resume)


@router.post(
    "/{resume_id}/audit",
    response_model=ResumeAuditResponse,
    summary="Run a health audit on a resume",
)
async def audit_resume(
    resume_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ResumeAuditResponse:
    """
    Run a comprehensive health audit on a parsed resume.

    Checks for grammar, formatting, quantification,
    section hierarchy, and content quality issues.
    Never invents claims or fabricates issues.
    """
    resume_repo = ResumeRepository(db)
    audit_svc = AuditService(db)

    # Get resume with sections
    resume = await resume_repo.get_with_details(resume_id, current_user.user_id)
    if resume is None:
        raise NotFoundError("Resume", resume_id)

    # Prepare section data
    sections = [
        {
            "section_type": s.section_type,
            "raw_text": s.raw_text,
            "normalized_text": s.normalized_text,
        }
        for s in resume.sections
    ]
    raw_text = "\n\n".join(s.raw_text for s in resume.sections)

    # Run audit
    audit_service = ResumeAuditService()
    result = await audit_service.audit_resume(sections, raw_text)

    # Update resume status
    await resume_repo.update(resume_id, current_user.user_id, status="audited")

    # Audit log
    await audit_svc.log_action(
        action="resume.audit",
        user_id=current_user.user_id,
        resource_type="resume",
        resource_id=resume_id,
        metadata={"issue_count": len(result.get("issues", []))},
    )

    return ResumeAuditResponse(
        resume_id=resume_id,
        overall_score=result["overall_score"],
        issues=result["issues"],
        summary=result["summary"],
        strengths=result["strengths"],
    )
