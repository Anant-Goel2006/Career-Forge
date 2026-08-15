"""
CareerForge AI — Application Configuration.

Loads all configuration from environment variables using Pydantic Settings.
Secrets are NEVER exposed to the client or logged.

Usage:
    from app.core.config import get_settings
    settings = get_settings()
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All secrets are server-only and never prefixed with NEXT_PUBLIC_.
    Settings are validated at startup — missing required values cause
    an immediate, clear error rather than a runtime surprise.
    """

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---------- General ----------
    app_name: str = "CareerForge AI"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    api_base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # ---------- Database ----------
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost:5432/careerforge",
        description="PostgreSQL connection string. Must use asyncpg driver.",
    )
    db_pool_size: int = Field(default=20, ge=1, le=100)
    db_max_overflow: int = Field(default=10, ge=0, le=50)
    db_pool_timeout: int = Field(default=30, ge=5)

    # ---------- AI Provider (Server Only) ----------
    gemini_api_key: str = Field(
        default="",
        description="Gemini API key. Server-only, never exposed to client.",
    )
    embedding_api_key: str = ""
    ai_max_tokens: int = Field(default=4096, ge=256, le=32768)
    ai_temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    ai_request_timeout: int = Field(default=60, ge=10, le=300)

    # ---------- Authentication ----------
    auth_secret: str = Field(
        default="change-me-in-production",
        description="JWT signing secret. Must be strong in production.",
    )
    access_token_expire_minutes: int = Field(default=30, ge=5)
    refresh_token_expire_days: int = Field(default=7, ge=1)

    # ---------- Storage ----------
    storage_endpoint: str = ""
    storage_bucket: str = "careerforge-uploads"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    local_upload_dir: str = "uploads"

    # ---------- Rate Limiting ----------
    rate_limit_requests_per_minute: int = Field(default=60, ge=1)
    rate_limit_ai_requests_per_minute: int = Field(default=20, ge=1)

    # ---------- File Upload Limits ----------
    max_upload_size_mb: int = Field(default=10, ge=1, le=50)
    max_resume_pages: int = Field(default=10, ge=1, le=50)
    allowed_upload_extensions: list[str] = [".pdf", ".docx"]

    # ---------- CORS ----------
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ---------- Monitoring ----------
    sentry_dsn: str = ""

    @computed_field  # type: ignore[prop-decorator]
    @property
    def max_upload_size_bytes(self) -> int:
        """Calculate max upload size in bytes from MB setting."""
        return self.max_upload_size_mb * 1024 * 1024

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Get cached application settings singleton.

    Settings are loaded once and cached for the application lifetime.
    This ensures consistent configuration and avoids repeated file reads.

    Returns:
        Settings: Validated application configuration.
    """
    return Settings()
