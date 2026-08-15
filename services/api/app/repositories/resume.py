"""
CareerForge AI — Resume Repository.

Data access for resumes, sections, and evidence items.
All queries are scoped to user_id for tenant isolation.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.resume import EvidenceItem, Resume, ResumeSection
from app.repositories.base import BaseRepository


class ResumeRepository(BaseRepository[Resume]):
    """Repository for Resume model with eager-loaded sections and evidence."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Resume, db)

    async def get_with_details(
        self, id: UUID, user_id: UUID
    ) -> Resume | None:
        """
        Get a resume with all sections and evidence items loaded.

        Args:
            id: Resume UUID.
            user_id: Owner UUID (tenant isolation).

        Returns:
            Resume with loaded relationships or None.
        """
        query = (
            select(Resume)
            .options(
                selectinload(Resume.sections),
                selectinload(Resume.evidence_items),
            )
            .where(Resume.id == id, Resume.user_id == user_id)
            .where(Resume.deleted_at.is_(None))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class ResumeSectionRepository(BaseRepository[ResumeSection]):
    """Repository for ResumeSection model."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(ResumeSection, db)

    async def get_by_resume(self, resume_id: UUID) -> list[ResumeSection]:
        """
        Get all sections for a resume, ordered by position.

        Args:
            resume_id: Parent resume UUID.

        Returns:
            Ordered list of resume sections.
        """
        query = (
            select(ResumeSection)
            .where(ResumeSection.resume_id == resume_id)
            .order_by(ResumeSection.order_index)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class EvidenceRepository(BaseRepository[EvidenceItem]):
    """Repository for EvidenceItem model."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(EvidenceItem, db)

    async def get_by_user(self, user_id: UUID) -> list[EvidenceItem]:
        """
        Get all evidence items for a user.

        Args:
            user_id: Owner UUID.

        Returns:
            List of evidence items.
        """
        query = (
            select(EvidenceItem)
            .where(EvidenceItem.user_id == user_id)
            .order_by(EvidenceItem.created_at.desc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_verified_by_resume(self, resume_id: UUID) -> list[EvidenceItem]:
        """
        Get all verified evidence items for a resume.

        Args:
            resume_id: Resume UUID.

        Returns:
            List of verified evidence items.
        """
        query = (
            select(EvidenceItem)
            .where(
                EvidenceItem.resume_id == resume_id,
                EvidenceItem.verified.is_(True),
            )
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
