from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables
from logger import build_logger
from routers.submissions import router as submissions_router

log = build_logger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting up — initialising database tables")
    create_db_and_tables()
    log.info("Database ready")
    yield
    log.info("Shutting down")


app = FastAPI(
    title="Great Subs API",
    description="RESTful API for managing application submissions",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions_router, prefix="/submissions", tags=["submissions"])
