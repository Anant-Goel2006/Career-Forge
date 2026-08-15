"""
CareerForge AI — OutreachDraft Model.

Stores draft messages for professional outreach.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OutreachDraft(Base):
    """
    A draft outreach message for a professional contact.
    """

    __tablename__ = "outreach_drafts"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("contacts.id", ondelete="SET NULL"),
        nullable=True,
    )
    channel: Mapped[str] = mapped_column(
        String(20), nullable=False,
        doc="Channel: email, linkedin, referral",
    )
    subject: Mapped[str | None] = mapped_column(
        String(500), nullable=True,
    )
    body: Mapped[str] = mapped_column(
        Text, nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft",
        doc="Status: draft, reviewed, sent",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )

    # ---------- Relationships ----------
    user: Mapped["User"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    job: Mapped["Job"] = relationship()  # type: ignore[name-defined]  # noqa: F821
    contact: Mapped["Contact | None"] = relationship()  # type: ignore[name-defined]  # noqa: F821

    def __repr__(self) -> str:
        return f"<OutreachDraft id={self.id} channel={self.channel} status={self.status}>"
