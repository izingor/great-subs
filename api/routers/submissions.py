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
from logger import build_logger
from models import PaginatedSubmissions, Submission, SubmissionCreate, SubmissionRead, SubmissionUpdate

log = build_logger("api.submissions")

router = APIRouter()

CLAIM_LEASE_SECONDS = 120


@router.get("/", response_model=PaginatedSubmissions)
def list_submissions(
    status: str | None = Query(default=None, description="Filter by status"),
    name: str | None = Query(default=None, description="Search by name (contains)"),
    page: int = Query(default=1, ge=1, description="Page number"),
    size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session),
) -> PaginatedSubmissions:
    log.debug("Listing submissions — status_filter=%s name_filter=%s page=%d size=%d", status, name, page, size)
    items, total = get_submissions(session, status=status, name=name, page=page, size=size)
    log.debug("Returning %d submissions (total %d)", len(items), total)
    return PaginatedSubmissions(items=items, total=total, page=page, size=size)


@router.post("/", response_model=SubmissionRead, status_code=201)
def create_new_submission(
    data: SubmissionCreate,
    session: Session = Depends(get_session),
) -> SubmissionRead:
    log.info("Creating submission — name=%s status=%s", data.name, data.status)
    submission = create_submission(session, data)
    log.info("Submission created — id=%d", submission.id)
    return submission


@router.get("/{submission_id}", response_model=SubmissionRead)
def read_submission(
    submission_id: int,
    session: Session = Depends(get_session),
) -> SubmissionRead:
    log.debug("Fetching submission — id=%d", submission_id)
    submission = get_submission(session, submission_id)

    if not submission:
        log.warning("Submission not found — id=%d", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    return submission


@router.patch("/{submission_id}", response_model=SubmissionRead)
def patch_submission(
    submission_id: int,
    data: SubmissionUpdate,
    session: Session = Depends(get_session),
) -> SubmissionRead:
    log.info(
        "Updating submission — id=%d payload=%s",
        submission_id,
        data.model_dump(exclude_unset=True),
    )
    submission = update_submission(session, submission_id, data)

    if not submission:
        log.warning("Submission not found for update — id=%d", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    log.info("Submission updated — id=%d new_status=%s", submission_id, submission.status)
    return submission


@router.delete("/{submission_id}", status_code=204)
def remove_submission(
    submission_id: int,
    session: Session = Depends(get_session),
) -> None:
    log.info("Deleting submission — id=%d", submission_id)
    deleted = delete_submission(session, submission_id)

    if not deleted:
        log.warning("Submission not found for deletion — id=%d", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    log.info("Submission deleted — id=%d", submission_id)
    return None


@router.post("/{submission_id}/bind")
async def bind_submission(
    submission_id: int,
    session: Session = Depends(get_session),
):
    log.info("Bind requested — submission_id=%d", submission_id)

    submission = get_submission(session, submission_id)
    if not submission:
        log.warning("Bind failed — submission not found id=%d", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission.status == "bound":
        log.info("Submission already bound — id=%d, skipping", submission_id)
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
        log.warning(
            "Bind claim rejected — submission_id=%d is locked by another worker",
            submission_id,
        )
        raise HTTPException(
            status_code=409,
            detail="Submission is currently being processed by another worker",
        )

    log.info("Claim acquired — submission_id=%d, calling bind service", submission_id)

    success, attempts = await call_bind_service()
    final_status = "bound" if success else "bind_failed"

    log.info(
        "Bind complete — submission_id=%d success=%s attempts=%d final_status=%s",
        submission_id,
        success,
        attempts,
        final_status,
    )

    session.refresh(submission)
    submission.status = final_status
    submission.claimed_at = None
    submission.updated_at = datetime.utcnow()
    session.add(submission)
    session.commit()
    session.refresh(submission)

    return {"submission": SubmissionRead.model_validate(submission), "attempts": attempts}
