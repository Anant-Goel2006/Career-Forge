"""
CareerForge AI — ResumeVersion Model.

Stores tailored resume versions generated for specific jobs.
Each version contains evidence-backed content and maintains
a one-page constraint with professional formatting.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import DateTime, ForeignKey, JSON, Numeric, String, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ResumeVersion(Base):
    """
    A tailored resume version for a specific job opening.
    """

    __tablename__ = "resume_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    base_resume_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
    )
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
    )
    template: Mapped[str] = mapped_column(
        String(50), nullable=False, default="faang_technical",
        doc="Template: faang_technical, analytics, business",
    )
    content_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, nullable=False, doc="Structured resume content",
    )
    docx_storage_key: Mapped[str | None] = mapped_column(
        String(1024), nullable=True, doc="Generated DOCX file path",
    )
    pdf_storage_key: Mapped[str | None] = mapped_column(
        String(1024), nullable=True, doc="Generated PDF file path",
    )
    readiness_score: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True,
        doc="Quality/completeness score (0.00 - 100.00)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )

    # ---------- Relationships ----------
    user: Mapped["User"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    base_resume: Mapped["Resume"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    job: Mapped["Job | None"] = relationship()  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        return f"<ResumeVersion id={self.id} template={self.template}>"
