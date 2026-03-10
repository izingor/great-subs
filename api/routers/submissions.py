from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import update
from sqlmodel import Session

from bind_client import call_bind_service
from crud import (
    create_submission,
    delete_submission,
    get_submission,
    get_submissions,
    update_submission,
)
from database import get_session
from models import Submission, SubmissionCreate, SubmissionRead, SubmissionUpdate

router = APIRouter()

CLAIM_LEASE_SECONDS = 120  # 2-minute lease window


# ---------------------------------------------------------------------------
# Standard REST endpoints
# ---------------------------------------------------------------------------


@router.get("/", response_model=list[SubmissionRead])
def list_submissions(
    status: str | None = Query(default=None, description="Filter by status"),
    name: str | None = Query(default=None, description="Search by name (contains)"),
    session: Session = Depends(get_session),
):
    """List all submissions, optionally filtered by status and/or name."""
    return get_submissions(session, status=status, name=name)


@router.post("/", response_model=SubmissionRead, status_code=201)
def create_new_submission(
    data: SubmissionCreate,
    session: Session = Depends(get_session),
):
    """Create a new submission."""
    return create_submission(session, data)


@router.get("/{submission_id}", response_model=SubmissionRead)
def read_submission(
    submission_id: int,
    session: Session = Depends(get_session),
):
    """Retrieve a single submission by id."""
    submission = get_submission(session, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.patch("/{submission_id}", response_model=SubmissionRead)
def patch_submission(
    submission_id: int,
    data: SubmissionUpdate,
    session: Session = Depends(get_session),
):
    """Partially update a submission."""
    submission = update_submission(session, submission_id, data)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.delete("/{submission_id}", status_code=204)
def remove_submission(
    submission_id: int,
    session: Session = Depends(get_session),
):
    """Delete a submission."""
    deleted = delete_submission(session, submission_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Submission not found")
    return None


# ---------------------------------------------------------------------------
# Bind endpoint (Step 4)
# ---------------------------------------------------------------------------


@router.post("/{submission_id}/bind")
async def bind_submission(
    submission_id: int,
    session: Session = Depends(get_session),
):
    submission = get_submission(session, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission.status == "bound":
        return {"submission": SubmissionRead.model_validate(submission), "attempts": 0}

    now = datetime.utcnow()
    lease_cutoff = now - timedelta(seconds=CLAIM_LEASE_SECONDS)

    stmt = (
        update(Submission)
        .where(Submission.id == submission_id)
        .where(Submission.status == "new")
        .where(
            (Submission.claimed_at.is_(None))  # type: ignore[union-attr]
            | (Submission.claimed_at < lease_cutoff)  # type: ignore[operator]
        )
        .values(claimed_at=now)
    )

    result = session.exec(stmt)  # type: ignore[call-overload]
    session.commit()

    if result.rowcount == 0:  # type: ignore[union-attr]
        raise HTTPException(
            status_code=409,
            detail="Submission is currently being processed by another worker",
        )

    success, attempts = await call_bind_service()

    session.refresh(submission)
    submission.status = "bound" if success else "bind_failed"
    submission.claimed_at = None
    submission.updated_at = datetime.utcnow()
    session.add(submission)
    session.commit()
    session.refresh(submission)

    return {"submission": SubmissionRead.model_validate(submission), "attempts": attempts}
