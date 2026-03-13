# Flaky Bind Service

This is a mock external service used by the main API to test resilience, retry logic, and error handling. It is built with **FastAPI**.

## Core Technologies

- **[FastAPI](https://fastapi.tiangolo.com/)**: A robust and fast web framework for building APIs with Python.
- **[Uvicorn](https://www.uvicorn.org/)**: An ASGI web server implementation for Python.

## Purpose & Behavior

The purpose of this service is to simulate an unreliable third-party API that manages the "binding" of an insurance submission.

The single exposed endpoint `POST /bind` behaves randomly based on predefined thresholds:
- **Success (~50% chance)**: Returns a `200 OK` with `{"status": "success"}`.
- **Error (~30% chance)**: Raises a `500 Internal Server Error`.
- **Timeout (~20% chance)**: Sleeps for 15 seconds and then raises a `504 Gateway Timeout`.

This behavior ensures that the main API's integration logic (using `tenacity` for retries) is thoroughly exercised in development.

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

3. Run the service:
   ```bash
   uvicorn main:app --port 8001 --host 0.0.0.0
   ```

Alternatively, you can run all services together from the root of the project using the provided `run.sh` script.
