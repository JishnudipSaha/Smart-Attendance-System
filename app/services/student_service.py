import os
import shutil
import uuid
from typing import List, Optional
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

from app.models.models import Student, Embedding
from app.schemas.student import StudentCreate, StudentResponse, StudentImageResponse
from app.core.config import settings

class StudentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.upload_dir = Path(settings.UPLOAD_DIR)

    def _count_uploaded_images(self, roll_number: str) -> int:
        student_folder = self.upload_dir / roll_number
        if not student_folder.exists() or not student_folder.is_dir():
            return 0

        valid_extensions = {".jpg", ".jpeg", ".png"}
        return sum(
            1
            for path in student_folder.iterdir()
            if path.is_file() and path.suffix.lower() in valid_extensions
        )

    async def _count_embeddings(self, student_id: int) -> int:
        query = select(func.count(Embedding.id)).where(Embedding.student_id == student_id)
        result = await self.db.execute(query)
        return int(result.scalar_one() or 0)

    async def _build_student_response(self, student: Student) -> StudentResponse:
        uploaded_images_count = self._count_uploaded_images(student.roll_number)
        embeddings_count = await self._count_embeddings(student.id)

        return StudentResponse(
            id=student.id,
            name=student.name,
            roll_number=student.roll_number,
            class_name=student.class_name,
            section=student.section,
            created_at=student.created_at,
            uploaded_images_count=uploaded_images_count,
            embeddings_count=embeddings_count,
            has_uploaded_images=uploaded_images_count > 0,
            has_embeddings=embeddings_count > 0,
        )

    async def create_student(self, student_data: StudentCreate) -> StudentResponse:
        # Check for duplicate roll number
        query = select(Student).where(Student.roll_number == student_data.roll_number)
        result = await self.db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Student with roll number {student_data.roll_number} already exists"
            )

        new_student = Student(**student_data.model_dump())
        self.db.add(new_student)
        try:
            await self.db.commit()
            await self.db.refresh(new_student)
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database integrity error occurred during student creation"
            )

        return await self._build_student_response(new_student)

    async def get_student(self, student_id: int) -> Optional[Student]:
        result = await self.db.execute(select(Student).where(Student.id == student_id))
        return result.scalar_one_or_none()

    async def list_students(self) -> List[StudentResponse]:
        result = await self.db.execute(select(Student).order_by(Student.id))
        students = result.scalars().all()
        return [await self._build_student_response(student) for student in students]

    async def get_student_response(self, student_id: int) -> Optional[StudentResponse]:
        student = await self.get_student(student_id)
        if not student:
            return None
        return await self._build_student_response(student)

    async def upload_student_images(self, student_id: int, files: List[UploadFile]) -> List[StudentImageResponse]:
        # 1. Verify student exists
        student = await self.get_student(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        # Create student-specific directory for organization
        student_folder = self.upload_dir / student.roll_number
        student_folder.mkdir(parents=True, exist_ok=True)

        uploaded_images = []
        allowed_mime_types = {"image/jpeg", "image/png", "image/jpg"}

        for file in files:
            # 2. Validate MIME type
            if file.content_type not in allowed_mime_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type for {file.filename}. Only JPEG and PNG are allowed."
                )

            # 3. Generate unique filename: roll_number_uuid.ext
            ext = os.path.splitext(file.filename)[1].lower()
            if not ext:
                ext = ".jpg" # Fallback

            unique_id = uuid.uuid4().hex[:8]
            filename = f"{student.roll_number}_{unique_id}{ext}"
            file_path = student_folder / filename

            # 4. Save file atomically
            try:
                with file_path.open("wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
            except Exception as e:
                # Cleanup previously uploaded files in this batch if one fails
                for img in uploaded_images:
                    path = student_folder / img.filename
                    if path.exists(): path.unlink()

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"File upload failed for {file.filename}: {str(e)}"
                )

            uploaded_images.append(StudentImageResponse(
                filename=filename,
                url=f"/static/students/{student.roll_number}/{filename}"
            ))

        return uploaded_images

    async def delete_student(self, student_id: int) -> bool:
        """
        Completely removes a student, including their embeddings,
        attendance records, and uploaded images.
        """
        # 1. Find student to get roll_number for folder deletion
        student = await self.get_student(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        roll_number = student.roll_number

        # 2. Database deletion - Manual cleanup to avoid ForeignKeyViolation
        try:
            from sqlalchemy import delete

            # Delete related records first to satisfy foreign key constraints
            from app.models.models import Embedding, Attendance

            # Delete Attendance records
            await self.db.execute(delete(Attendance).where(Attendance.student_id == student_id))

            # Delete Embeddings
            await self.db.execute(delete(Embedding).where(Embedding.student_id == student_id))

            # Finally, delete the student
            await self.db.execute(delete(Student).where(Student.id == student_id))

            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database deletion failed: {str(e)}"
            )

        # 3. Filesystem cleanup
        student_folder = self.upload_dir / roll_number
        try:
            if student_folder.exists() and student_folder.is_dir():
                if student_folder.resolve().is_relative_to(self.upload_dir.resolve()):
                    shutil.rmtree(student_folder)
        except Exception as e:
            print(f"Warning: Could not delete image folder for {roll_number}: {e}")

        return True
