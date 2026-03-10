import os

import httpx
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    retry_if_result,
    stop_after_attempt,
    wait_exponential,
)

from logger import build_logger

log = build_logger("api.bind_client")

BIND_SERVICE_URL = os.getenv("BIND_SERVICE_URL", "http://localhost:8001/bind")
REQUEST_TIMEOUT_SECONDS = 5.0


def _is_server_error(response: httpx.Response) -> bool:
    return response.status_code >= 500


def _log_retry_attempt(retry_state) -> None:
    attempt = retry_state.attempt_number
    outcome = retry_state.outcome
    exc = outcome.exception() if outcome and not outcome.cancelled() else None

    if exc:
        log.warning("Bind attempt %d failed with exception: %s", attempt, exc)
    else:
        result = outcome.result() if outcome else None
        status = result.status_code if result else "unknown"
        log.warning("Bind attempt %d failed with HTTP status %s", attempt, status)


@retry(
    retry=(
        retry_if_exception_type((httpx.TimeoutException, httpx.ConnectError))
        | retry_if_result(_is_server_error)
    ),
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
    before_sleep=_log_retry_attempt,
)
async def _post_bind(client: httpx.AsyncClient) -> httpx.Response:
    return await client.post(BIND_SERVICE_URL, timeout=REQUEST_TIMEOUT_SECONDS)


async def call_bind_service() -> tuple[bool, int]:
    log.info("Calling bind service at %s", BIND_SERVICE_URL)

    async with httpx.AsyncClient() as client:
        try:
            response = await _post_bind(client)
            attempts = _post_bind.statistics.get("attempt_number", 1)
            success = response.status_code == 200
            log.info(
                "Bind service responded — success=%s, attempts=%d, status=%d",
                success,
                attempts,
                response.status_code,
            )
            return success, attempts
        except (RetryError, httpx.TimeoutException, httpx.ConnectError) as exc:
            attempts = _post_bind.statistics.get("attempt_number", 5)
            log.error(
                "Bind service exhausted all %d attempts: %s",
                attempts,
                exc,
            )
            return False, attempts
