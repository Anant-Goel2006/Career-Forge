"""
CareerForge AI — Authentication Endpoints.

Handles user registration and login with JWT tokens.

Security:
    - Passwords hashed with bcrypt
    - JWT tokens with configurable expiry
    - No sensitive data in responses
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictError, AuthenticationError
from app.core.security import (
    TokenData,
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.audit_service import AuditService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    summary="Register a new user",
)
async def register(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user account.

    Returns JWT tokens and user data on success.
    Email must be unique (case-insensitive).
    """
    user_repo = UserRepository(db)
    audit = AuditService(db)

    # Check for existing email
    if await user_repo.email_exists(data.email):
        raise ConflictError("An account with this email already exists.")

    # Create user with hashed password
    user = await user_repo.create(
        email=data.email.lower(),
        name=data.name,
        hashed_password=hash_password(data.password),
        role="user",
    )

    # Generate tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    # Audit log (no sensitive data)
    await audit.log_action(
        action="auth.register",
        user_id=user.id,
        resource_type="user",
        resource_id=user.id,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate a user and return JWT tokens.

    Returns 401 with generic message on failure (no email enumeration).
    """
    user_repo = UserRepository(db)
    audit = AuditService(db)

    # Find user by email
    user = await user_repo.get_by_email(data.email.lower())
    if user is None or not verify_password(data.password, user.hashed_password):
        raise AuthenticationError("Invalid email or password.")

    # Generate tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    # Audit log
    await audit.log_action(
        action="auth.login",
        user_id=user.id,
        resource_type="user",
        resource_id=user.id,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
)
async def get_me(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Get the currently authenticated user's profile."""
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(current_user.user_id)
    if user is None:
        raise AuthenticationError("User not found.")
    return UserResponse.model_validate(user)
