import asyncio
import logging
import random
import sys

from fastapi import FastAPI, HTTPException

log = logging.getLogger("bind_service")
log.setLevel(logging.DEBUG)
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(
    logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
)
log.addHandler(_handler)
log.propagate = False

app = FastAPI(
    title="Flaky Bind Service",
    description="Simulates a flaky external bind service for testing retry logic",
    version="1.0.0",
)

SUCCESS_THRESHOLD = 0.1
ERROR_THRESHOLD = 0.80
TIMEOUT_DELAY_SECONDS = 15


@app.post("/bind")
async def bind():
    roll = random.random()

    log.debug("Incoming bind request — roll=%.4f", roll)

    if roll < SUCCESS_THRESHOLD:
        log.info("Bind succeeded — roll=%.4f (threshold=%.2f)", roll, SUCCESS_THRESHOLD)
        return {"status": "success"}

    if roll < ERROR_THRESHOLD:
        log.warning(
            "Bind returning 500 — roll=%.4f (error_threshold=%.2f)",
            roll,
            ERROR_THRESHOLD,
        )
        raise HTTPException(status_code=500, detail="Internal Server Error")

    log.warning(
        "Bind simulating timeout — roll=%.4f, sleeping %ds then returning 504",
        roll,
        TIMEOUT_DELAY_SECONDS,
    )
    await asyncio.sleep(TIMEOUT_DELAY_SECONDS)
    raise HTTPException(status_code=504, detail="Gateway Timeout")
