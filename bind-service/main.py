import asyncio
import random

from fastapi import FastAPI, HTTPException

app = FastAPI(
    title="Flaky Bind Service",
    description="Simulates a flaky external bind service for testing retry logic",
    version="1.0.0",
)

SUCCESS_THRESHOLD = 0.60
ERROR_THRESHOLD = 0.80
TIMEOUT_DELAY_SECONDS = 15


@app.post("/bind")
async def bind():
    roll = random.random()

    if roll < SUCCESS_THRESHOLD:
        return {"status": "success"}

    if roll < ERROR_THRESHOLD:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    await asyncio.sleep(TIMEOUT_DELAY_SECONDS)
    raise HTTPException(status_code=504, detail="Gateway Timeout")
