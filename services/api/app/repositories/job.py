"""
CareerForge AI — Job Repository.

Data access for jobs and their requirements.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.job import Job, JobRequirement
from app.repositories.base import BaseRepository


class JobRepository(BaseRepository[Job]):
    """Repository for Job model with eager-loaded requirements."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Job, db)

    async def get_with_requirements(self, id: UUID, user_id: UUID) -> Job | None:
        """
        Get a job with all requirements loaded.

        Args:
            id: Job UUID.

        Returns:
            Job with loaded requirements or None.
        """
        query = (
            select(Job)
            .options(selectinload(Job.requirements))
            .where(Job.id == id, Job.user_id == user_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class JobRequirementRepository(BaseRepository[JobRequirement]):
    """Repository for JobRequirement model."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(JobRequirement, db)

    async def get_by_job(self, job_id: UUID) -> list[JobRequirement]:
        """
        Get all requirements for a job, ordered by priority.

        Args:
            job_id: Parent job UUID.

        Returns:
            Ordered list of job requirements.
        """
        query = (
            select(JobRequirement)
            .where(JobRequirement.job_id == job_id)
            .order_by(JobRequirement.priority)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
