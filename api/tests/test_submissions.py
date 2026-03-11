from fastapi.testclient import TestClient
from sqlmodel import Session
from models import Submission

def test_create_submission(client: TestClient):
    response = client.post("/submissions/", json={"name": "Test Sub", "status": "new"})
    assert response.status_code == 201
    data = response.json()
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
    assert res.json()["name"] == "Updated"
    assert res.json()["status"] == "new"

def test_delete_submission(client: TestClient, session: Session):
    sub = Submission(name="To Delete", status="new")
    session.add(sub)
    session.commit()
    session.refresh(sub)

    res = client.delete(f"/submissions/{sub.id}")
    assert res.status_code == 204

    res2 = client.get(f"/submissions/{sub.id}")
    assert res2.status_code == 404
