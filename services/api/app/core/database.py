"""
CareerForge AI — Database Engine & Session Management.

Provides async SQLAlchemy engine and session factory.
All database access goes through dependency-injected sessions
to ensure proper connection lifecycle management.

Security:
    - Uses parameterized queries only (via SQLAlchemy ORM)
    - Connection pooling with bounded size
    - SSL/TLS configurable for production
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base for all ORM models.

    All models inherit from this base class which provides:
    - Automatic table name generation
    - Metadata for migrations
    - Common type annotation support
    """

    pass


def _create_engine() -> create_async_engine:
    """
    Create the async SQLAlchemy engine with production-safe defaults.

    Pool settings prevent connection exhaustion while allowing
    sufficient concurrency for typical workloads.
    """
    settings = get_settings()
    kwargs = {}
    if not settings.database_url.startswith("sqlite"):
        kwargs = {
            "pool_size": settings.db_pool_size,
            "max_overflow": settings.db_max_overflow,
            "pool_timeout": settings.db_pool_timeout,
        }
    
    return create_async_engine(
        settings.database_url,
        pool_pre_ping=True,  # Detect stale connections
        echo=settings.debug,  # SQL logging only in debug mode
        **kwargs
    )


engine = _create_engine()

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Avoid lazy-load issues in async context
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a database session.

    The session is automatically committed on success and rolled back
    on exception, ensuring data consistency.

    Usage:
        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...

    Yields:
        AsyncSession: A scoped database session.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables from ORM models and seed default workspace user.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    import uuid
    from app.models.user import User
    from sqlalchemy import select

    default_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    async with async_session_factory() as session:
        try:
            stmt = select(User).where(User.id == default_id)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                user = User(
                    id=default_id,
                    email="workspace@careerforge.local",
                    name="Local Workspace User",
                    hashed_password="workspace_default",
                    role="admin",
                )
                session.add(user)
                await session.commit()
        except Exception:
            await session.rollback()


async def close_db() -> None:
    """Dispose of the database engine and all pooled connections."""
    await engine.dispose()

