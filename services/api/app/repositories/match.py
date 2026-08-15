"""
CareerForge AI — Match Report Repository.

Data access for resume-job match reports.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import MatchReport
from app.repositories.base import BaseRepository


class MatchReportRepository(BaseRepository[MatchReport]):
    """Repository for MatchReport model."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(MatchReport, db)

    async def get_by_resume_and_job(
        self,
        resume_id: UUID,
        job_id: UUID,
        user_id: UUID,
    ) -> MatchReport | None:
        """
        Find an existing match report for a resume-job pair.

        Args:
            resume_id: Resume UUID.
            job_id: Job UUID.
            user_id: Owner UUID (tenant isolation).

        Returns:
            Existing match report or None.
        """
        query = select(MatchReport).where(
            MatchReport.resume_id == resume_id,
            MatchReport.job_id == job_id,
            MatchReport.user_id == user_id,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_for_user(self, id: UUID, user_id: UUID) -> MatchReport | None:
        """Get a match report only when it belongs to the requesting user."""
        return await self.get_by_id(id, user_id)
