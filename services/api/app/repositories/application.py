"""
CareerForge AI — Application Repository.

Data access for job application tracking.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.repositories.base import BaseRepository


class ApplicationRepository(BaseRepository[Application]):
    """Repository for Application model."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(Application, db)
