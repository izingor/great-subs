import pytest
import httpx
from unittest.mock import AsyncMock, patch
from bind_client import call_bind_service

@pytest.mark.asyncio
async def test_call_bind_service_success():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = httpx.Response(200)
        
        success, attempts = await call_bind_service()
        
        assert success is True
        assert attempts == 1
        mock_post.assert_called_once()

@pytest.mark.asyncio
async def test_call_bind_service_failure_400():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = httpx.Response(400)
        
        success, attempts = await call_bind_service()
        
        assert success is False
        assert attempts == 1
        mock_post.assert_called_once()

@pytest.mark.asyncio
async def test_call_bind_service_retry_then_success():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        # Mock 500 then 200
        mock_post.side_effect = [
            httpx.Response(500),
            httpx.Response(200)
        ]
        
        # Patch sleep to avoid waiting during tests
        with patch("asyncio.sleep", return_value=None):
            success, attempts = await call_bind_service()
            
            assert success is True
            assert attempts == 2
            assert mock_post.call_count == 2

@pytest.mark.asyncio
async def test_call_bind_service_exhaust_retries():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        # 5 times 500 status
        mock_post.return_value = httpx.Response(500)
        
        with patch("asyncio.sleep", return_value=None):
            success, attempts = await call_bind_service()
            
            assert success is False
            assert attempts == 5
            assert mock_post.call_count == 5

@pytest.mark.asyncio
async def test_call_bind_service_timeout_retry():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        # Mock Timeout then 200
        mock_post.side_effect = [
            httpx.TimeoutException("Timeout"),
            httpx.Response(200)
        ]
        
        with patch("asyncio.sleep", return_value=None):
            success, attempts = await call_bind_service()
            
            assert success is True
            assert attempts == 2
            assert mock_post.call_count == 2

@pytest.mark.asyncio
async def test_call_bind_service_connect_error_exhausted():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = httpx.ConnectError("Connection failed")
        
        with patch("asyncio.sleep", return_value=None):
            success, attempts = await call_bind_service()
            
            assert success is False
            assert attempts == 5
            assert mock_post.call_count == 5
