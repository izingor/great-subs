from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import Session, select, func

from models import Submission, SubmissionCreate, SubmissionUpdate


def get_submissions(
    session: Session,
    *,
    status: Optional[str] = None,
    name: Optional[str] = None,
    page: int = 1,
    size: int = 10,
) -> tuple[list[Submission], int]:
    """Return paginated submissions and total count."""
    statement = select(Submission).order_by(Submission.created_at.desc())
    if status:
        statement = statement.where(Submission.status == status)
    if name:
        statement = statement.where(Submission.name.contains(name))

    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    statement = statement.offset((page - 1) * size).limit(size)
    items = list(session.exec(statement).all())
    
    return items, total


def get_submission(session: Session, submission_id: UUID) -> Optional[Submission]:
    """Return a single submission by id, or None."""
    return session.get(Submission, submission_id)


def get_submission_by_name(session: Session, name: str) -> Optional[Submission]:
    """Return a single submission by name, or None."""
    statement = select(Submission).where(Submission.name == name)
    return session.exec(statement).first()


def create_submission(session: Session, data: SubmissionCreate) -> Submission:
    """Insert a new submission and return it."""
    submission = Submission.model_validate(data)
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission


def update_submission(
    session: Session,
    submission_id: UUID,
    data: SubmissionUpdate,
) -> Optional[Submission]:
    """Partially update a submission. Returns None if not found."""
    submission = session.get(Submission, submission_id)
    if not submission:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(submission, key, value)

    submission.updated_at = datetime.now(timezone.utc)
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission


def delete_submission(session: Session, submission_id: UUID) -> bool:
    """Delete a submission. Returns True if deleted, False if not found."""
    submission = session.get(Submission, submission_id)
    if not submission:
        return False
    session.delete(submission)
    session.commit()
    return True
