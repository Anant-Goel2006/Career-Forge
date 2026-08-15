"""
CareerForge AI — User Schemas.

Request/response schemas for authentication and user management.
Passwords are never returned in responses.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """
    User registration request.

    Attributes:
        email: Valid email address.
        name: Display name.
        password: Strong password (min 8 characters).
    """

    email: EmailStr = Field(description="User email address")
    name: str = Field(min_length=1, max_length=255, description="Display name")
    password: str = Field(min_length=8, max_length=128, description="Password (min 8 chars)")


class UserLogin(BaseModel):
    """
    User login request.

    Attributes:
        email: Registered email address.
        password: Account password.
    """

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    User data response (excludes password).

    Attributes:
        id: User UUID.
        email: Email address.
        name: Display name.
        role: Authorization role.
        created_at: Account creation date.
    """

    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    name: str | None
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    """
    Authentication token response.

    Attributes:
        access_token: JWT access token.
        refresh_token: JWT refresh token.
        token_type: Always 'bearer'.
        user: Authenticated user data.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
