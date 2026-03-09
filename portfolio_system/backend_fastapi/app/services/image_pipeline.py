def enqueue_image_optimization_job(object_key: str) -> None:
    """
    Placeholder for async image optimization.
    Production:
    - push event to queue
    - worker generates responsive variants (320/640/1024/1600)
    - convert to webp/avif
    - update metadata
    """
    _ = object_key
