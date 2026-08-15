"""
CareerForge AI — Job & JobRequirement Models.

Represents job descriptions and their extracted requirements.
Requirements are categorized as required/preferred/inferred/unknown
to enable transparent matching and skill-gap analysis.

Security:
    - Job descriptions are treated as untrusted data
    - No automatic application or platform bypass
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Job(Base):
    """
    A job posting with its description and metadata.
    """

    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Owner UUID — jobs are private to the candidate who saved them.",
    )
    source: Mapped[str] = mapped_column(
        String(20), nullable=False, doc="Source: 'manual', 'url', 'upload'",
    )
    external_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, doc="External job board identifier",
    )
    company: Mapped[str] = mapped_column(
        String(500), nullable=False, doc="Company name",
    )
    title: Mapped[str] = mapped_column(
        String(500), nullable=False, doc="Job title",
    )
    location: Mapped[str | None] = mapped_column(
        String(500), nullable=True, doc="Job location",
    )
    employment_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True,
        doc="Employment type: full-time, part-time, contract, internship",
    )
    experience_level: Mapped[str | None] = mapped_column(
        String(50), nullable=True,
        doc="Experience level: entry, mid, senior, lead, executive",
    )
    description: Mapped[str] = mapped_column(
        Text, nullable=False, doc="Full job description",
    )
    application_url: Mapped[str | None] = mapped_column(
        String(2048), nullable=True, doc="Application URL",
    )
    posted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )

    # ---------- Relationships ----------
    user: Mapped["User"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    requirements: Mapped[list["JobRequirement"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title} company={self.company}>"


class JobRequirement(Base):
    """
    An extracted requirement from a job description.
    """

    __tablename__ = "job_requirements"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requirement_type: Mapped[str] = mapped_column(
        String(20), nullable=False,
        doc="Type: 'required', 'preferred', 'inferred', 'unknown'",
    )
    requirement_text: Mapped[str] = mapped_column(
        Text, nullable=False, doc="Requirement as stated in the JD",
    )
    normalized_skill: Mapped[str | None] = mapped_column(
        String(255), nullable=True,
        doc="Standardized skill name for matching",
    )
    priority: Mapped[int] = mapped_column(
        Integer, default=0, doc="Relative priority (0 = highest)",
    )

    # ---------- Relationships ----------
    job: Mapped["Job"] = relationship(back_populates="requirements")

    def __repr__(self) -> str:
        return f"<JobRequirement id={self.id} type={self.requirement_type}>"
