from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/{student_id}/generate-embeddings")
async def generate_embeddings(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Trigger the AI pipeline to process all uploaded images for a student
    and store their facial embeddings in the database.
    """
    service = AIService(db)
    processed_images = await service.process_student_embeddings(student_id)

    if not processed_images:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No faces were detected in the uploaded images. Please upload clearer photos."
        )

    return {
        "message": "Embeddings generated successfully",
        "processed_images": processed_images,
        "count": len(processed_images)
    }
