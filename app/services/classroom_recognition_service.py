import cv2
import numpy as np
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.models import Student, Embedding
from app.ai.pipeline import RecognitionPipeline
from app.services.similarity_service import SimilarityService
from app.core.config import settings

class ClassroomRecognitionService:
    """
    Orchestrator for multi-face recognition in classroom images.
    """
    def __init__(self, db: AsyncSession):
        self.db = db
        self.pipeline = RecognitionPipeline()
        self.similarity_service = SimilarityService()
        self.debug_dir = Path("static/debug")
        self.debug_dir.mkdir(parents=True, exist_ok=True)

    async def recognize_classroom(self, image_file: UploadFile) -> Dict[str, Any]:
        # 1. Save temporary image for processing
        temp_filename = f"classroom_{uuid.uuid4().hex}.jpg"
        temp_path = Path(f"static/debug/{temp_filename}")

        file_bytes = await image_file.read()
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image is empty or unreadable."
            )

        with temp_path.open("wb") as buffer:
            buffer.write(file_bytes)

        try:
            # 2. Detect and extract all embeddings from the image
            # returns List[Tuple[bbox, embedding]]
            try:
                face_data = self.pipeline.process_classroom_image(str(temp_path))
            except FileNotFoundError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image content. Please upload a valid JPEG or PNG image."
                )

            if not face_data:
                return {"recognized_students": [], "debug_image": None}

            # 3. Fetch all registered embeddings from DB
            # We load all to memory for speed since the student count is relatively small
            emb_result = await self.db.execute(select(Embedding))
            all_embeddings = emb_result.scalars().all()

            # Map: student_id -> list of embeddings (because students can have multiple reference photos)
            registered_map = {}
            for emb in all_embeddings:
                if emb.student_id not in registered_map:
                    registered_map[emb.student_id] = []
                registered_map[emb.student_id].append(np.array(json.loads(emb.embedding_vector)))

            # 4. Match each detected face
            recognized_results = []
            image_bgr = cv2.imread(str(temp_path))

            for bbox, live_embedding in face_data:
                best_student_id = None
                max_conf = -1.0

                # Compare against every registered student's embeddings
                for student_id, ref_embeddings in registered_map.items():
                    for ref_emb in ref_embeddings:
                        conf = self.similarity_service.calculate_cosine_similarity(live_embedding, ref_emb)
                        if conf > max_conf:
                            max_conf = conf
                            best_student_id = student_id

                # Threshold check
                if best_student_id and max_conf >= self.similarity_service.threshold:
                    # Fetch student name for the response
                    student_res = await self.db.execute(select(Student).where(Student.id == best_student_id))
                    student = student_res.scalar_one_or_none()

                    recognized_results.append({
                        "student_id": best_student_id,
                        "name": student.name if student else "Unknown",
                        "confidence": round(float(max_conf), 2),
                        "bbox": bbox.tolist()
                    })

                    # Draw on image
                    cv2.rectangle(image_bgr, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
                    cv2.putText(image_bgr, f"{student.name if student else 'Unknown'} {max_conf:.2f}",
                                (bbox[0], bbox[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                else:
                    # Label as Unknown
                    cv2.rectangle(image_bgr, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 0, 255), 2)
                    cv2.putText(image_bgr, "Unknown", (bbox[0], bbox[1]-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            # 5. Deduplicate: If a student is detected multiple times, keep highest confidence
            final_results = {}
            for res in recognized_results:
                s_id = res["student_id"]
                if s_id not in final_results or res["confidence"] > final_results[s_id]["confidence"]:
                    final_results[s_id] = res

            # 6. Save annotated image for debugging
            debug_filename = f"rec_{uuid.uuid4().hex}.jpg"
            cv2.imwrite(str(self.debug_dir / debug_filename), image_bgr)

            return {
                "recognized_students": list(final_results.values()),
                "debug_image_url": f"/static/debug/{debug_filename}"
            }

        finally:
            # Cleanup temporary image if needed, or keep in debug
            pass
