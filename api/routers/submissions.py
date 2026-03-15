from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from sqlalchemy import update
from sqlmodel import Session

from bind_client import call_bind_service
from crud import (
    create_submission,
    delete_submission,
    get_submission,
    get_submission_by_name,
    get_submissions,
    update_submission,
)
from database import get_session
from logger import build_logger
from models import PaginatedSubmissions, Submission, SubmissionCreate, SubmissionRead, SubmissionUpdate
from notifier import notifier
from fastapi.responses import StreamingResponse


log = build_logger("api.submissions")

router = APIRouter()

CLAIM_LEASE_SECONDS = 45


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


@router.get("/events")
async def sse_submissions():
    """
    SSE endpoint to notify clients about submission updates.
    """
    async def event_generator():
        queue = await notifier.subscribe()
        try:
            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
        finally:
            notifier.unsubscribe(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")



@router.post("/", status_code=201)
async def create_new_submission(
    data: SubmissionCreate,
    session: Session = Depends(get_session),
):
    log.info("Creating submission — name=%s status=%s", data.name, data.status)
    existing = await run_in_threadpool(get_submission_by_name, session, data.name)
    if existing:
        log.warning("Submission creation failed — name already exists: %s", data.name)
        raise HTTPException(
            status_code=400,
            detail=f"A submission with the name \"{data.name}\" already exists."
        )

    submission = await run_in_threadpool(create_submission, session, data)
    log.info("Submission created — id=%s", submission.id)
    
    # Broadcast creation
    await notifier.broadcast(
        "submission_created",
        SubmissionRead.model_validate(submission).model_dump(mode="json")
    )

    return {
        "message": f"Submission \"{submission.name}\" created successfully",
        "data": SubmissionRead.model_validate(submission)
    }


@router.get("/{submission_id}", response_model=SubmissionRead)
def read_submission(
    submission_id: UUID,
    session: Session = Depends(get_session),
) -> SubmissionRead:
    log.debug("Fetching submission — id=%s", submission_id)
    submission = get_submission(session, submission_id)

    if not submission:
        log.warning("Submission not found — id=%s", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    return submission


@router.patch("/{submission_id}")
async def patch_submission(
    submission_id: UUID,
    data: SubmissionUpdate,
    session: Session = Depends(get_session),
):
    log.info(
        "Updating submission — id=%s payload=%s",
        submission_id,
        data.model_dump(exclude_unset=True),
    )
    if data.name:
        existing = await run_in_threadpool(get_submission_by_name, session, data.name)
        if existing and existing.id != submission_id:
            log.warning("Submission update failed — name already exists: %s", data.name)
            raise HTTPException(
                status_code=400,
                detail=f"A submission with the name \"{data.name}\" already exists."
            )

    submission = await run_in_threadpool(update_submission, session, submission_id, data)

    if not submission:
        log.warning("Submission not found for update — id=%s", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    log.info("Submission updated — id=%s new_status=%s", submission_id, submission.status)
    
    # Broadcast update
    await notifier.broadcast(
        "submission_updated",
        SubmissionRead.model_validate(submission).model_dump(mode="json")
    )

    return {
        "message": f"Submission \"{submission.name}\" updated successfully",
        "data": SubmissionRead.model_validate(submission)
    }


@router.delete("/{submission_id}", status_code=200)
async def remove_submission(
    submission_id: UUID,
    session: Session = Depends(get_session),
):
    log.info("Deleting submission — id=%s", submission_id)
    submission = await run_in_threadpool(get_submission, session, submission_id)
    
    if not submission:
        log.warning("Submission not found for deletion — id=%s", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    name = submission.name
    await run_in_threadpool(delete_submission, session, submission_id)

    log.info("Submission deleted — id=%s", submission_id)
    
    # Broadcast deletion
    await notifier.broadcast(
        "submission_deleted",
        {"id": str(submission_id)}
    )

    return {"message": f"Submission \"{name}\" deleted successfully"}


@router.post("/{submission_id}/bind")
async def bind_submission(
    submission_id: UUID,
    session: Session = Depends(get_session),
):
    log.info("Bind requested — submission_id=%s", submission_id)

    submission = await run_in_threadpool(get_submission, session, submission_id)
    if not submission:
        log.warning("Bind failed — submission not found id=%s", submission_id)
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission.status == "bound":
        log.info("Submission already bound — id=%s, skipping", submission_id)
        return {"submission": SubmissionRead.model_validate(submission), "attempts": 0}

    now = datetime.now(timezone.utc)
    lease_cutoff = now - timedelta(seconds=CLAIM_LEASE_SECONDS)

    stmt = (
        update(Submission)
        .where(Submission.id == submission_id)
        .where((Submission.status == "new") | (Submission.status == "bind_failed"))
        .where(
            (Submission.claimed_at.is_(None))
            | (Submission.claimed_at < lease_cutoff)
        )
        .values(claimed_at=now)
        .execution_options(synchronize_session=False)
    )

    result = await run_in_threadpool(session.exec, stmt)
    await run_in_threadpool(session.commit)

    if result.rowcount == 0:
        log.warning(
            "Bind claim rejected — submission_id=%s is locked by another worker",
            submission_id,
        )
        raise HTTPException(
            status_code=409,
            detail="Submission is currently being processed by another worker",
        )

    log.info("Claim acquired — submission_id=%s, calling bind service", submission_id)

    # Broadcast update via SSE (status is still 'new' or 'bind_failed', but claimed_at is set)
    await notifier.broadcast(
        "submission_updated", 
        SubmissionRead.model_validate(submission).model_dump(mode="json")
    )

    success, attempts = await call_bind_service()
    final_status = "bound" if success else "bind_failed"

    log.info(
        "Bind complete — submission_id=%s success=%s attempts=%d final_status=%s",
        submission_id,
        success,
        attempts,
        final_status,
    )

    await run_in_threadpool(session.refresh, submission)
    submission.status = final_status
    submission.claimed_at = None
    submission.updated_at = datetime.now(timezone.utc)
    session.add(submission)
    await run_in_threadpool(session.commit)
    await run_in_threadpool(session.refresh, submission)

    # Broadcast update via SSE
    await notifier.broadcast(
        "submission_updated", 
        SubmissionRead.model_validate(submission).model_dump(mode="json")
    )


    if not success:
        log.error(
            "Bind failed — submission_id=%s attempts=%d",
            submission_id,
            attempts,
        )
        return JSONResponse(
            status_code=502,
            content={
                "submission": SubmissionRead.model_validate(submission).model_dump(mode="json"),
                "attempts": attempts,
                "message": f"Failed to bind \"{submission.name}\" after {attempts} attempts. Please retry later.",
            },
        )

    return {
        "submission": SubmissionRead.model_validate(submission),
        "attempts": attempts,
        "message": f"\"{submission.name}\" bound successfully in {attempts} attempt{'' if attempts == 1 else 's'}",
    }
