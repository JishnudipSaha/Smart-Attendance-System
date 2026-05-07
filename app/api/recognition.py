from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.classroom_recognition_service import ClassroomRecognitionService

router = APIRouter()

@router.post("/classroom")
async def recognize_classroom(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """
    Upload a classroom image to detect and recognize all present students.
    - Detects multiple faces.
    - Matches against registered student embeddings.
    - Returns recognized students and a debug annotated image.
    """
    # Validate image type
    allowed_types = {"image/jpeg", "image/png", "image/jpg"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Please upload JPEG or PNG."
        )

    service = ClassroomRecognitionService(db)
    result = await service.recognize_classroom(file)

    return result
