# Sayata Submissions API

This is the backend service for managing insurance submissions. It provides a RESTful API built with **FastAPI** and uses **SQLModel** (backed by **SQLite**) for data persistence.

## Core Technologies

- **[FastAPI](https://fastapi.tiangolo.com/)**: A modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.
- **[SQLModel](https://sqlmodel.tiangolo.com/)**: SQL databases in Python, designed for simplicity, compatibility, and robustness. Combines SQLAlchemy and Pydantic.
- **[SQLite](https://www.sqlite.org/)**: A C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.
- **[Tenacity](https://tenacity.readthedocs.io/)**: A general-purpose retrying library to simplify the task of adding retry behavior to just about anything (used here for integrating with the flaky external `bind-service`).
- **[HTTPX](https://www.python-httpx.org/)**: A fully featured HTTP client for Python 3, which provides sync and async APIs. Used for making requests to the `bind-service`.

## Setup and Running

1. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   # Ensure you set the necessary environment variables if running standalone
   export BIND_SERVICE_URL="http://localhost:8001/bind"
   export DATABASE_URL="sqlite:///./database.db"
   
   uvicorn main:app --port 8000 --host 0.0.0.0 --reload
   ```

Alternatively, you can run all services together from the root of the project using the provided `run.sh` script.

## Project Structure

- `main.py`: The FastAPI application entrypoint and middleware configuration.
- `database.py`: Database connection and session management.
- `models.py`: SQLModel entity definitions.
- `crud.py`: Create, Read, Update, and Delete operations for database entities.
- `routers/`: API route definitions (e.g., `submissions.py`).
- `bind_client.py`: Client for interacting with the external `bind-service`, utilizing `tenacity` for resilience against failures and timeouts.
