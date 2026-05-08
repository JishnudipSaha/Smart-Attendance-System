from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.student import StudentCreate, StudentResponse, StudentImageResponse
from app.services.student_service import StudentService

router = APIRouter()

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def register_student(student_in: StudentCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new student in the system.
    - Validates metadata.
    - Prevents duplicate roll numbers.
    """
    service = StudentService(db)
    return await service.create_student(student_in)

@router.get("/", response_model=List[StudentResponse])
async def list_students(db: AsyncSession = Depends(get_db)):
    """Retrieve a paginated list of all registered students."""
    service = StudentService(db)
    return await service.list_students()

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve detailed metadata for a specific student."""
    service = StudentService(db)
    student = await service.get_student_response(student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student

@router.post("/{student_id}/upload-images", response_model=List[StudentImageResponse])
async def upload_images(
    student_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload one or more reference images for a student.
    - Validates student existence.
    - Validates image formats (JPEG/PNG).
    - Stores images in organized student-specific folders.
    """
    service = StudentService(db)
    return await service.upload_student_images(student_id, files)

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Completely remove a student from the system.
    - Deletes student metadata.
    - Cascades to remove embeddings and attendance records.
    - Deletes associated images from the filesystem.
    """
    service = StudentService(db)
    await service.delete_student(student_id)
    return None
