import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


class UploadService:
    _allowed_content_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/avif": ".avif",
    }
    _allowed_categories = {"avatars", "projects", "certificates", "covers"}

    def __init__(self) -> None:
        self.media_root = Path(settings.media_root)

    def ensure_media_directories(self) -> None:
        self.media_root.mkdir(parents=True, exist_ok=True)
        for category in self._allowed_categories:
            (self.media_root / category).mkdir(parents=True, exist_ok=True)

    def save_image(self, file: UploadFile, category: str) -> dict[str, str]:
        normalized_category = category.strip().lower()
        if normalized_category not in self._allowed_categories:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid media category")

        content_type = (file.content_type or "").lower()
        if content_type not in self._allowed_content_types:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

        safe_stem = self._safe_stem(Path(file.filename or "upload").stem)
        extension = Path(file.filename or "").suffix.lower() or self._allowed_content_types[content_type]
        if extension not in self._allowed_content_types.values():
            extension = self._allowed_content_types[content_type]

        filename = f"{uuid4().hex}_{safe_stem}{extension}"
        target_dir = self.media_root / normalized_category
        target_path = target_dir / filename

        self.ensure_media_directories()

        bytes_written = 0
        with target_path.open("wb") as destination:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                bytes_written += len(chunk)
                if bytes_written > settings.max_upload_bytes:
                    destination.close()
                    target_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File exceeds maximum upload size",
                    )
                destination.write(chunk)

        relative_path = f"{settings.media_url_path.rstrip('/')}/{normalized_category}/{filename}"
        public_url = f"{settings.public_api_base_url.rstrip('/')}{relative_path}"

        return {
            "category": normalized_category,
            "file_name": filename,
            "file_path": relative_path,
            "public_url": public_url,
        }

    @staticmethod
    def _safe_stem(stem: str) -> str:
        cleaned = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("_")
        return cleaned[:50] or "file"


upload_service = UploadService()
