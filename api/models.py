import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import field_validator
from sqlmodel import Field, SQLModel


# ---------------------------------------------------------------------------
# Enum for allowed statuses
# ---------------------------------------------------------------------------

class SubmissionStatus(str, Enum):
    new = "new"
    bound = "bound"
    bind_failed = "bind_failed"


# ---------------------------------------------------------------------------
# Database table model
# ---------------------------------------------------------------------------

class Submission(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    status: str = Field(default="new")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    claimed_at: Optional[datetime] = Field(default=None)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class SubmissionRead(SQLModel):
    id: UUID
    name: str
    status: str
    created_at: datetime
    updated_at: datetime
    claimed_at: Optional[datetime]

class SuccessResponse(SQLModel):
    message: str

class ResponseWithData(SuccessResponse):
    data: SQLModel

class PaginatedSubmissions(SQLModel):
    items: list[SubmissionRead]
    total: int
    page: int
    size: int

class SubmissionCreate(SQLModel):
    name: str
    status: str = "new"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {s.value for s in SubmissionStatus}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class SubmissionUpdate(SQLModel):
    name: Optional[str] = None
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {s.value for s in SubmissionStatus}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v
