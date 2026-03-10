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

BIND_SERVICE_URL = os.getenv("BIND_SERVICE_URL", "http://localhost:8001/bind")
REQUEST_TIMEOUT_SECONDS = 5.0


def _is_server_error(response: httpx.Response) -> bool:
    return response.status_code >= 500


@retry(
    retry=(
        retry_if_exception_type((httpx.TimeoutException, httpx.ConnectError))
        | retry_if_result(_is_server_error)
    ),
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def _post_bind(client: httpx.AsyncClient) -> httpx.Response:
    return await client.post(BIND_SERVICE_URL, timeout=REQUEST_TIMEOUT_SECONDS)


async def call_bind_service() -> tuple[bool, int]:
    async with httpx.AsyncClient() as client:
        try:
            response = await _post_bind(client)
            attempts = _post_bind.statistics.get("attempt_number", 1)
            return response.status_code == 200, attempts
        except (RetryError, httpx.TimeoutException, httpx.ConnectError):
            attempts = _post_bind.statistics.get("attempt_number", 5)
            return False, attempts
