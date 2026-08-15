"""
CareerForge AI — Base Repository.

Generic CRUD operations with tenant isolation built in.
All data access goes through repositories to ensure:
- Consistent tenant isolation
- Parameterized queries (via SQLAlchemy ORM)
- Soft-deletion support
- Audit-friendly data access patterns

Security:
    - Every query is scoped to user_id (tenant isolation)
    - No raw SQL — all queries are parameterized via ORM
    - Soft-deleted records excluded by default
"""

from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic repository providing CRUD operations with tenant isolation.

    All methods that access user-owned resources require a user_id
    parameter to enforce tenant isolation at the data access layer.

    Type Parameters:
        ModelType: The SQLAlchemy model class.

    Attributes:
        model: The SQLAlchemy model class.
        db: The async database session.
    """

    def __init__(self, model: type[ModelType], db: AsyncSession) -> None:
        self.model = model
        self.db = db

    async def get_by_id(
        self,
        id: UUID,
        user_id: UUID | None = None,
    ) -> ModelType | None:
        """
        Get a single record by ID with optional tenant isolation.

        Args:
            id: The record's UUID.
            user_id: If provided, enforces ownership check.

        Returns:
            The record or None if not found / not owned.
        """
        query = select(self.model).where(self.model.id == id)  # type: ignore[attr-defined]

        # Enforce tenant isolation if user_id column exists and user_id provided
        if user_id is not None and hasattr(self.model, "user_id"):
            query = query.where(self.model.user_id == user_id)  # type: ignore[attr-defined]

        # Exclude soft-deleted records
        if hasattr(self.model, "deleted_at"):
            query = query.where(self.model.deleted_at.is_(None))  # type: ignore[attr-defined]

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        user_id: UUID,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[ModelType], int]:
        """
        List records owned by a specific user with pagination.

        Args:
            user_id: Owner's UUID (tenant isolation).
            offset: Pagination offset.
            limit: Maximum records to return.

        Returns:
            Tuple of (records, total_count).
        """
        base_query = select(self.model).where(
            self.model.user_id == user_id  # type: ignore[attr-defined]
        )

        # Exclude soft-deleted records
        if hasattr(self.model, "deleted_at"):
            base_query = base_query.where(
                self.model.deleted_at.is_(None)  # type: ignore[attr-defined]
            )

        # Get total count
        count_query = select(func.count()).select_from(base_query.subquery())
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated results
        query = base_query.offset(offset).limit(limit).order_by(
            self.model.created_at.desc()  # type: ignore[attr-defined]
        )
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def create(self, **kwargs: Any) -> ModelType:
        """
        Create a new record.

        Args:
            **kwargs: Model field values.

        Returns:
            The created record.
        """
        instance = self.model(**kwargs)
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance

    async def update(
        self,
        id: UUID,
        user_id: UUID | None = None,
        **kwargs: Any,
    ) -> ModelType | None:
        """
        Update a record by ID with tenant isolation.

        Args:
            id: Record UUID.
            user_id: Owner UUID for tenant isolation.
            **kwargs: Fields to update.

        Returns:
            Updated record or None if not found.
        """
        instance = await self.get_by_id(id, user_id)
        if instance is None:
            return None

        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)

        await self.db.flush()
        await self.db.refresh(instance)
        return instance

    async def soft_delete(self, id: UUID, user_id: UUID) -> bool:
        """
        Soft-delete a record (sets deleted_at timestamp).

        Only works on models with a deleted_at column.

        Args:
            id: Record UUID.
            user_id: Owner UUID for tenant isolation.

        Returns:
            True if the record was soft-deleted.
        """
        from datetime import datetime, timezone

        if not hasattr(self.model, "deleted_at"):
            return False

        instance = await self.get_by_id(id, user_id)
        if instance is None:
            return False

        instance.deleted_at = datetime.now(timezone.utc)  # type: ignore[attr-defined]
        await self.db.flush()
        return True

    async def hard_delete(self, id: UUID, user_id: UUID | None = None) -> bool:
        """
        Permanently delete a record.

        Args:
            id: Record UUID.
            user_id: Owner UUID for tenant isolation.

        Returns:
            True if the record was deleted.
        """
        instance = await self.get_by_id(id, user_id)
        if instance is None:
            return False

        await self.db.delete(instance)
        await self.db.flush()
        return True
