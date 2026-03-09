import json
from typing import Any

import redis

from app.core.config import settings


class CacheService:
    def __init__(self) -> None:
        self.client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

    def get_json(self, key: str) -> dict[str, Any] | None:
        payload = self.client.get(key)
        if not payload:
            return None
        return json.loads(payload)

    def set_json(self, key: str, value: dict[str, Any], ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds or settings.public_cache_ttl_seconds
        self.client.setex(key, ttl, json.dumps(value))

    def delete(self, key: str) -> None:
        self.client.delete(key)


cache_service = CacheService()
