# Great Subs Project

This project is a comprehensive application for managing insurance submissions. It consists of a modern React frontend, a FastAPI backend, and a mock flakey service tailored for testing resilience.

## Architecture Overview

The system is composed of three main services:

1. **[Client](./client/README.md)**: The frontend application built with React 19, Vite, Material UI (MUI v7), and Redux Toolkit. It communicates with the API to display and manage submissions.
2. **[API](./api/README.md)**: The backend service built with FastAPI and SQLModel (SQLite). It serves the frontend, handles business logic, persists data, and orchestrates requests to external services.
3. **[Bind Service](./bind-service/README.md)**: A mock built with FastAPI, simulating a third-party API that processes request "bindings". It intentionally injects failures (500 errors) and timeouts (504 errors) to allow testing the main API's fault tolerance and retry mechanisms (handled via `tenacity`).

## Prerequisites

- For local development without Docker: **Python 3.8+** and **Node.js (npm)**.
- For Docker execution: **Docker Desktop** or **Docker Compose**.

---

## How to Run Locally (Without Docker)

A convenience script `run.sh` is provided in the root directory to orchestrate running all three services simultaneously.

1. Ensure the script is executable:
   ```bash
   chmod +x run.sh
   ```

2. Execute the script:
   ```bash
   ./run.sh
   ```

This script will automatically:
- Create virtual environments (`venv`) and install Python dependencies for both the API and Bind Service.
- Install `node_modules` for the Client using `npm install`.
- Boot up all three services in the background and tail the logs.

**Local Access Points:**
- **Client**: `http://localhost:5173`
- **API**: `http://localhost:8000`
- **Bind Service**: `http://localhost:8001`

To stop the services, simply press `Ctrl+C` in the terminal running the script.

---

## How to Run Using Docker

The project includes a `docker-compose.yml` file, which orchestrates building and running all services within isolated containers.

1. Build and start the containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```

**Docker Access Points:**
- **Client**: `http://localhost:3000` *(Note the port difference from local Vite dev)*
- **API**: `http://localhost:8000`
- **Bind Service**: `http://localhost:8001`

The `docker-compose.yml` is configured with health checks to ensure dependent services (like the API) wait for their prerequisites (like the Bind Service) to be ready before fully initializing. Data from the SQLite database is persisted in a Docker volume `api-data`.

To stop the containers:
```bash
docker-compose down
```
