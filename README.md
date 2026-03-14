# Great Subs Project

This project is a resilient insurance submission management system. It features a modern React frontend, a robust FastAPI backend, and a specialized mock service designed to simulate real-world API instability.

## System Architecture

The application is built using a microservices-inspired architecture to demonstrate resilience and concurrent processing:

### 1. [Frontend Client](./client/README.md)
- **Tech Stack**: React 19, Vite, TypeScript, MUI v7, Redux Toolkit.
- **Role**: Provides a high-performance UI for users to create, view, and "bind" insurance submissions.
- **Communication**: Interacts with the API through RTK Query, handling loading states and displaying success/error notifications via a global middleware.

### 2. [Backend API](./api/README.md)
- **Tech Stack**: FastAPI, SQLModel (SQLite), HTTPX, Tenacity.
- **Role**: The central orchestrator. It manages the submission lifecycle, persistence, and external service integrations.
- **Resilience Strategy**: Uses the `tenacity` library to implement sophisticated retry logic when communicating with the flaky `bind-service`.

### 3. [Mock Bind Service](./bind-service/README.md)
- **Tech Stack**: FastAPI.
- **Role**: Simulates a modern "flakey" external provider. It randomly executes one of three scenarios:
    - **Success (50%)**: Immediate successful response.
    - **Transient Failure (30%)**: Returns a 500 error.
    - **Network Timeout (20%)**: Sleeps for 15 seconds before returning a 504 error.

---

## Resilience & Concurrency: The Bind Flow

One of the core technical highlights of this project is how it handles the "bind" action concurrently and resiliently.

### The `claimed_at` Distributed Lock
When a user clicks "Bind", the system must ensure that a submission isn't sent to the external provider multiple times simultaneously (e.g., if two users click the same button at the same time).

1. **Atomic Claim**: Within `api/routers/submissions.py`, the API performs an atomic SQL update using the `claimed_at` column.
2. **Lease Mechanism**: A submission can only be claimed if:
    - `claimed_at` is `NULL`.
    - **OR** `claimed_at` is older than 45 seconds (a safety lease if a previous process crashed).
3. **Locking**: If the update affects 0 rows, the API returns a `409 Conflict`, informing the user that the submission is already being processed.

### Integration with `bind-service`
Once a claim is secured:
1. The `bind_client.py` makes an asynchronous call to the flakey service.
2. **Retries**: If the service fails or times out, `tenacity` automatically retries the request according to the configured policy.
3. **Completion**: Upon final success or permanent failure, the `status` is updated (`bound` or `bind_failed`), and `claimed_at` is reset to `NULL` to release the lock.

---

## Getting Started

### Prerequisites
- **Local**: Python 3.8+ and Node.js (npm).
- **Containerized**: Docker and Docker Compose.

### Option 1: Run Locally (Fastest)
A convenience script `run.sh` automates the environment setup and execution of all services.

```bash
chmod +x run.sh
./run.sh
```

**Access Points:**
- **UI**: [http://localhost:5173](http://localhost:5173)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Bind Service Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

### Option 2: Run with Docker
Ideal for consistent environment testing.

```bash
docker-compose up -d --build
```

**Access Points:**
- **UI**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:8000](http://localhost:8000)
- **Bind Service**: [http://localhost:8001](http://localhost:8001)

Data is persisted in the `api-data` Docker volume. Use `docker-compose down` to stop the services.
