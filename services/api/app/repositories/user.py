"""
CareerForge AI — User Repository.

Data access for user accounts. Handles email uniqueness
and password storage safely.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Repository for User model operations.

    Extends BaseRepository with user-specific queries.
    """

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> User | None:
        """
        Find a user by email address.

        Args:
            email: Email to search for (case-insensitive).

        Returns:
            User or None if not found.
        """
        query = select(User).where(User.email == email.lower())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        """
        Check if an email is already registered.

        Args:
            email: Email to check.

        Returns:
            True if the email is already in use.
        """
        user = await self.get_by_email(email.lower())
        return user is not None
