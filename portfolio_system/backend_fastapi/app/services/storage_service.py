import uuid

import boto3
from botocore.client import Config

from app.core.config import settings


class StorageService:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            config=Config(signature_version="s3v4"),
        )

    def build_object_key(self, user_id: int, purpose: str, file_name: str) -> str:
        extension = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "bin"
        return f"portfolio/{user_id}/{purpose}/{uuid.uuid4().hex}.{extension}"

    def presign_upload(self, object_key: str, content_type: str, expires_seconds: int = 600) -> str:
        return self.client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.s3_bucket,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_seconds,
        )

    def public_url(self, object_key: str) -> str:
        return f"{settings.cdn_base_url.rstrip('/')}/{object_key}"

    @staticmethod
    def is_allowed_file(content_type: str, size_bytes: int) -> bool:
        allowed_types = {"image/jpeg", "image/png", "image/webp", "image/avif"}
        return content_type in allowed_types and size_bytes <= settings.max_upload_bytes


storage_service = StorageService()
