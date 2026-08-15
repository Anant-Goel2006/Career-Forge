"""
CareerForge AI — User Model.

Represents an authenticated user of the platform.
Users own all their data (resumes, applications, etc.)
and tenant isolation is enforced at the repository level.

Roles:
    - 'user': Standard user (upload, audit, tailor, export)
    - 'admin': Platform admin (manage users, view security logs)
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    """
    Platform user account.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique user identifier",
    )
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
        doc="Unique email address",
    )
    name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        doc="Display name",
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Bcrypt-hashed password — never exposed via API",
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="user",
        doc="Authorization role: 'user' or 'admin'",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        doc="Account creation timestamp",
    )

    # ---------- Relationships ----------
    resumes: Mapped[list["Resume"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    evidence_items: Mapped[list["EvidenceItem"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
