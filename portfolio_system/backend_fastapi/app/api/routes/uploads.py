from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.deps import get_current_user
from app.schemas.portfolio import UploadImageResponse
from app.services.upload_service import upload_service

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/image", response_model=UploadImageResponse)
def upload_image(
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    _ = current_user
    return upload_service.save_image(file=file, category=category)
