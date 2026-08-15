"""
CareerForge AI — Resume, ResumeSection & EvidenceItem Models.

Core models for the resume parsing and evidence pipeline:
    Upload → Parse → Sections → Evidence Items → Audit

Security:
    - Resumes are stored in private object storage (storage_key)
    - Soft-deletion supported (deleted_at)
    - All access scoped to user_id (tenant isolation)
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Resume(Base):
    """
    An uploaded resume document.

    Lifecycle: uploaded → parsing → parsed → audited
    Soft-deletion via deleted_at enables recovery.
    """

    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Owner user ID — tenant isolation key",
    )
    original_filename: Mapped[str] = mapped_column(
        String(500), nullable=False, doc="Sanitized original filename",
    )
    source_type: Mapped[str] = mapped_column(
        String(10), nullable=False, doc="File format: 'pdf' or 'docx'",
    )
    storage_key: Mapped[str] = mapped_column(
        String(1024), nullable=False, doc="Private object storage path",
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="uploaded",
        doc="Processing status: uploaded, parsing, parsed, audited, error",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None,
        doc="Soft-deletion timestamp",
    )

    # ---------- Relationships ----------
    user: Mapped["User"] = relationship(back_populates="resumes")  # type: ignore[name-defined]  # noqa: F821
    sections: Mapped[list["ResumeSection"]] = relationship(
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="ResumeSection.order_index",
        lazy="selectin",
    )
    evidence_items: Mapped[list["EvidenceItem"]] = relationship(
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Resume id={self.id} filename={self.original_filename} status={self.status}>"


class ResumeSection(Base):
    """
    A parsed section of a resume (e.g., Experience, Education, Skills).
    """

    __tablename__ = "resume_sections"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    section_type: Mapped[str] = mapped_column(
        String(50), nullable=False,
        doc="Section category: summary, experience, education, skills, projects, certifications, etc.",
    )
    raw_text: Mapped[str] = mapped_column(
        Text, nullable=False, doc="Original extracted text",
    )
    normalized_text: Mapped[str | None] = mapped_column(
        Text, nullable=True, doc="Cleaned/normalized text for processing",
    )
    order_index: Mapped[int] = mapped_column(
        Integer, nullable=False, doc="Display order (0-indexed)",
    )

    # ---------- Relationships ----------
    resume: Mapped["Resume"] = relationship(back_populates="sections")

    def __repr__(self) -> str:
        return f"<ResumeSection id={self.id} type={self.section_type} order={self.order_index}>"


class EvidenceItem(Base):
    """
    A verified or unverified factual claim from a resume.
    """

    __tablename__ = "evidence_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resume_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=True,
    )
    claim_text: Mapped[str] = mapped_column(
        Text, nullable=False, doc="The factual claim",
    )
    source_span: Mapped[str | None] = mapped_column(
        Text, nullable=True, doc="Location reference in the original document",
    )
    verified: Mapped[bool] = mapped_column(
        Boolean, default=False, doc="Whether the claim has been verified",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )

    # ---------- Relationships ----------
    user: Mapped["User"] = relationship(back_populates="evidence_items")  # type: ignore[name-defined]  # noqa: F821
    resume: Mapped["Resume | None"] = relationship(back_populates="evidence_items")

    def __repr__(self) -> str:
        return f"<EvidenceItem id={self.id} verified={self.verified}>"
