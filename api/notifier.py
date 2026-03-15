import asyncio
import json
from typing import Any, Dict, Set

from logger import build_logger

log = build_logger("api.notifier")

class Notifier:
    def __init__(self) -> None:
        self.connections: Set[asyncio.Queue] = set()

    async def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self.connections.add(queue)
        log.debug("New client subscribed. Total clients: %d", len(self.connections))
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        if queue in self.connections:
            self.connections.remove(queue)
            log.debug("Client unsubscribed. Total clients: %d", len(self.connections))

    async def broadcast(self, event_type: str, data: Dict[str, Any]) -> None:
        if not self.connections:
            return

        message = {
            "type": event_type,
            "data": data
        }
        payload = json.dumps(message)
        
        log.debug("Broadcasting event '%s' to %d clients", event_type, len(self.connections))
        
        # Create a copy of the set to avoid modification during iteration
        for queue in list(self.connections):
            await queue.put(payload)

notifier = Notifier()
