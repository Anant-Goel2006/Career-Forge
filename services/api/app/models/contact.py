"""
CareerForge AI — Contact Model.

Stores publicly discoverable professional contacts for job-related outreach.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Contact(Base):
    """
    A publicly discoverable professional contact.
    """

    __tablename__ = "contacts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(
        String(255), nullable=False,
    )
    role: Mapped[str | None] = mapped_column(
        String(255), nullable=True,
    )
    organization: Mapped[str | None] = mapped_column(
        String(500), nullable=True,
    )
    public_profile_url: Mapped[str | None] = mapped_column(
        String(2048), nullable=True, doc="Public profile URL",
    )
    source_url: Mapped[str | None] = mapped_column(
        String(2048), nullable=True, doc="Provenance: where the contact was found",
    )
    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True, doc="Discovery confidence (0.00 - 100.00)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )

    # ---------- Relationships ----------
    job: Mapped["Job | None"] = relationship()  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        return f"<Contact id={self.id} name={self.name}>"
