"""
CareerForge AI — Resume Version Repository.

Data access for tailored resume versions.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resume_version import ResumeVersion
from app.repositories.base import BaseRepository


class ResumeVersionRepository(BaseRepository[ResumeVersion]):
    """Repository for ResumeVersion model."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(ResumeVersion, db)
