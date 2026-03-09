from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.schemas.portfolio import PresignUploadRequest, PresignUploadResponse
from app.services.image_pipeline import enqueue_image_optimization_job
from app.services.storage_service import storage_service

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/presign", response_model=PresignUploadResponse)
def presign_upload(
    payload: PresignUploadRequest,
    current_user: dict = Depends(get_current_user),
):
    if not storage_service.is_allowed_file(payload.content_type, payload.size_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type or file size",
        )

    object_key = storage_service.build_object_key(
        user_id=current_user["user_id"],
        purpose=payload.purpose,
        file_name=payload.file_name,
    )
    upload_url = storage_service.presign_upload(object_key, payload.content_type)

    return PresignUploadResponse(
        upload_url=upload_url,
        object_key=object_key,
        public_cdn_url=storage_service.public_url(object_key),
    )


@router.post("/complete")
def complete_upload(object_key: str, current_user: dict = Depends(get_current_user)):
    _ = current_user
    enqueue_image_optimization_job(object_key)
    return {"ok": True, "object_key": object_key}
