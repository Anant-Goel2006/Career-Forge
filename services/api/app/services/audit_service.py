"""
CareerForge AI — Audit Log Service.

Records security-sensitive actions for compliance and debugging.

Security:
    - Never logs resume contents or API keys
    - Only records action metadata
    - Structured format for analysis
"""

import logging
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """
    Service for recording audit trail entries.

    All security-sensitive actions should be logged through
    this service for compliance and debugging purposes.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def log_action(
        self,
        action: str,
        user_id: UUID | None = None,
        resource_type: str | None = None,
        resource_id: UUID | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """
        Record an audit log entry.

        Args:
            action: Action identifier (e.g., 'resume.upload', 'auth.login').
            user_id: Acting user's UUID (None for system actions).
            resource_type: Type of affected resource.
            resource_id: ID of the affected resource.
            metadata: Additional context (NEVER include secrets or content).
        """
        # Sanitize metadata — ensure no secrets are logged
        safe_metadata = self._sanitize_metadata(metadata) if metadata else None

        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=safe_metadata,
        )
        self._db.add(entry)
        await self._db.flush()

        logger.info(
            "Audit: %s",
            action,
            extra={
                "user_id": str(user_id) if user_id else None,
                "resource_type": resource_type,
                "resource_id": str(resource_id) if resource_id else None,
            },
        )

    def _sanitize_metadata(self, metadata: dict[str, Any]) -> dict[str, Any]:
        """
        Remove any potentially sensitive fields from audit metadata.

        Args:
            metadata: Raw metadata dict.

        Returns:
            Sanitized metadata safe for storage.
        """
        sensitive_keys = {
            "password", "secret", "token", "key", "api_key",
            "authorization", "cookie", "resume_text", "content",
        }
        return {
            k: v for k, v in metadata.items()
            if k.lower() not in sensitive_keys
        }
