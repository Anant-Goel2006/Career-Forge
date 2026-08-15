"""
CareerForge AI — MatchReport Model.

Stores the result of a resume-job match analysis.
Scoring is deterministic — not AI-driven — ensuring
reproducible and transparent results.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, func, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MatchReport(Base):
    """
    A match analysis between a resume and a job.
    """

    __tablename__ = "match_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    score_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, nullable=False,
        doc="Transparent sub-scores: required_skill_coverage, preferred_skill_coverage, etc.",
    )
    gaps_json: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, nullable=False,
        doc="Identified skill gaps and missing requirements",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )

    # ---------- Relationships ----------
    user: Mapped["User"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    resume: Mapped["Resume"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    job: Mapped["Job"] = relationship()  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        return f"<MatchReport id={self.id} resume={self.resume_id} job={self.job_id}>"
