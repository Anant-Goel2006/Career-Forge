"""
CareerForge AI — AuditLog Model.

Records security-sensitive actions for compliance and debugging.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, JSON, String, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditLog(Base):
    """
    An audit trail entry for security-sensitive actions.
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True,
        doc="Action identifier: 'resume.upload', 'auth.login', etc.",
    )
    resource_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True, doc="Affected resource type",
    )
    resource_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True, doc="Affected resource ID",
    )
    metadata_json: Mapped[dict | None] = mapped_column(  # type: ignore[type-arg]
        JSON, nullable=True,
        doc="Structured action context — never contains secrets or resume content",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True,
    )

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} action={self.action}>"
