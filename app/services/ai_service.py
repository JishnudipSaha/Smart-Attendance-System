import json
import numpy as np
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Embedding, Student
from app.ai.pipeline import RecognitionPipeline
from app.core.config import settings
from pathlib import Path

class AIService:
    """
    Service to handle AI-related operations and coordinate with the database.
    Implements a singleton-like pattern for the RecognitionPipeline to avoid reloading models.
    """
    _pipeline = None

    def __init__(self, db: AsyncSession):
        self.db = db
        if AIService._pipeline is None:
            # Load models once and reuse across requests
            AIService._pipeline = RecognitionPipeline()

    async def process_student_embeddings(self, student_id: int) -> List[str]:
        """
        Finds all images for a student, generates embeddings, and stores them in DB.
        Returns a list of successfully processed filenames.
        """
        # 1. Get student metadata to find their images
        result = await self.db.execute(select(Student).where(Student.id == student_id))
        student = result.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        # 2. Locate student's image directory
        student_folder = Path(settings.UPLOAD_DIR) / student.roll_number
        if not student_folder.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No uploaded images found for this student"
            )

        # 3. Process each image
        image_files = list(student_folder.glob("*.*"))
        processed_files = []

        for img_path in image_files:
            if img_path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                continue

            try:
                # Generate embedding via pipeline
                embedding_vector = self._pipeline.generate_embedding(str(img_path))

                if embedding_vector is None:
                    # No face detected in this specific image, skip it
                    continue

                # Convert numpy array to list for JSON storage in DB
                vector_list = embedding_vector.tolist()

                # Store embedding in database
                new_embedding = Embedding(
                    student_id=student.id,
                    embedding_vector=json.dumps(vector_list)
                )
                self.db.add(new_embedding)
                processed_files.append(img_path.name)

            except Exception as e:
                # Log the error but continue processing other images
                print(f"Error processing image {img_path.name}: {e}")

        try:
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save embeddings to database: {str(e)}"
            )

        return processed_files
