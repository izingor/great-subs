from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from models import Submission

def test_create_submission(client: TestClient):
    response = client.post("/submissions/", json={"name": "Test Sub", "status": "new"})
    assert response.status_code == 201
    res_json = response.json()
    assert "message" in res_json
    data = res_json["data"]
    assert data["name"] == "Test Sub"
    assert data["status"] == "new"
    assert data["id"] is not None

def test_list_submissions_pagination(client: TestClient, session: Session):
    for i in range(15):
        sub = Submission(name=f"Sub {i}", status="new")
        session.add(sub)
    session.commit()

    response = client.get("/submissions/?page=1&size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["size"] == 10
    assert len(data["items"]) == 10

    response2 = client.get("/submissions/?page=2&size=10")
    assert response2.status_code == 200
    data2 = response2.json()
    assert len(data2["items"]) == 5

def test_filtering_submissions(client: TestClient, session: Session):
    session.add(Submission(name="Alpha", status="new"))
    session.add(Submission(name="Beta", status="bound"))
    session.commit()

    res = client.get("/submissions/?status=bound")
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Beta"

def test_get_submission(client: TestClient, session: Session):
    sub = Submission(name="Target", status="new")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    res = client.get(f"/submissions/{sub.id}")
    assert res.status_code == 200
    assert res.json()["name"] == "Target"

def test_patch_submission(client: TestClient, session: Session):
    sub = Submission(name="Initial", status="new")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    res = client.patch(f"/submissions/{sub.id}", json={"name": "Updated"})
    assert res.status_code == 200
    res_json = res.json()
    assert "message" in res_json
    data = res_json["data"]
    assert data["name"] == "Updated"
    assert data["status"] == "new"

def test_delete_submission(client: TestClient, session: Session):
    sub = Submission(name="To Delete", status="new")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    res = client.delete(f"/submissions/{sub.id}")
    assert res.status_code == 200
    assert "message" in res.json()

    res2 = client.get(f"/submissions/{sub.id}")
    assert res2.status_code == 404


def test_create_duplicate_submission(client: TestClient, session: Session):
    session.add(Submission(name="Duplicate", status="new"))
    session.commit()

    response = client.post("/submissions/", json={"name": "Duplicate", "status": "new"})
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_patch_duplicate_submission(client: TestClient, session: Session):
    session.add(Submission(name="Existing 1", status="new"))
    session.add(Submission(name="Existing 2", status="new"))
    session.commit()

    # Find ID of Existing 2 to try to rename it to Existing 1
    sub2 = session.exec(select(Submission).where(Submission.name == "Existing 2")).one()

    response = client.patch(f"/submissions/{sub2.id}", json={"name": "Existing 1"})
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_bind_submission_flow(client: TestClient, session: Session):
    sub = Submission(name="Flow Test", status="new")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    with patch("routers.submissions.call_bind_service", new_callable=AsyncMock) as mock_bind:
        mock_bind.return_value = (True, 1)
        
        response = client.post(f"/submissions/{sub.id}/bind")
        assert response.status_code == 200
        data = response.json()
        assert data["submission"]["status"] == "bound"
        assert data["attempts"] == 1
        assert "bound successfully" in data["message"]

def test_bind_submission_conflict(client: TestClient, session: Session):
    sub = Submission(name="Conflict Test", status="new", claimed_at=datetime.now(timezone.utc))
    session.add(sub)
    session.commit()
    session.refresh(sub)

    response = client.post(f"/submissions/{sub.id}/bind")
    assert response.status_code == 409
    assert "being processed" in response.json()["detail"]

def test_bind_submission_retry_failed(client: TestClient, session: Session):
    sub = Submission(name="Retry Test", status="bind_failed")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    with patch("routers.submissions.call_bind_service", new_callable=AsyncMock) as mock_bind:
        mock_bind.return_value = (True, 1)
        
        response = client.post(f"/submissions/{sub.id}/bind")
        assert response.status_code == 200
        assert response.json()["submission"]["status"] == "bound"

def test_bind_submission_not_found(client: TestClient):
    import uuid
    response = client.post(f"/submissions/{uuid.uuid4()}/bind")
    assert response.status_code == 404


def test_bind_submission_service_failure(client: TestClient, session: Session):
    sub = Submission(name="Fail Test", status="new")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    with patch("routers.submissions.call_bind_service", new_callable=AsyncMock) as mock_bind:
        mock_bind.return_value = (False, 5)

        response = client.post(f"/submissions/{sub.id}/bind")
        assert response.status_code == 502
        data = response.json()
        assert data["submission"]["status"] == "bind_failed"
        assert data["attempts"] == 5
        assert "message" in data


def test_search_submissions_by_name(client: TestClient, session: Session):
    session.add(Submission(name="Alpha Corp", status="new"))
    session.add(Submission(name="Beta Inc", status="new"))
    session.commit()

    res = client.get("/submissions/?name=Alpha")
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Alpha Corp"
