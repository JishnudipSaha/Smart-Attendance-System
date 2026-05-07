from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
import csv
import io
from typing import List, Optional

from app.db.session import get_db
from app.services.attendance_service import AttendanceService
from app.services.classroom_recognition_service import ClassroomRecognitionService
from app.services.similarity_service import SimilarityService

router = APIRouter()

@router.post("/mark")
async def mark_attendance(
    class_name: str = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Recognizes students from a classroom image and marks their attendance.
    """
    # 1. Save uploaded image temporarily for AI processing
    # The recognition service expects a path or bytes.
    # Since ClassroomRecognitionService.recognize_classroom takes an image path, we save it.
    import os
    from app.core.config import settings
    from pathlib import Path

    debug_dir = Path(settings.DEBUG_DIR)
    debug_dir.mkdir(parents=True, exist_ok=True)

    temp_filename = f"attn_{class_name}_{int(date.today().timestamp())}.jpg"
    temp_path = debug_dir / temp_filename

    with open(temp_path, "wb") as buffer:
        buffer.write(await image.read())

    # 2. Run recognition pipeline
    recognition_service = ClassroomRecognitionService(db)
    results = await recognition_service.recognize_classroom(str(temp_path))

    # 3. Mark attendance for recognized students
    similarity_service = SimilarityService()
    attendance_service = AttendanceService(db)

    marked_present = []
    for face in results:
        # Only mark if confidence is above threshold
        if face.confidence >= similarity_service.threshold:
            student_id = face.student_id
            # We need the student name for the response
            # We'll fetch it from the result if available or query DB
            # Since face object usually contains student_id, let's just use a helper

            record = await attendance_service.mark_attendance(
                student_id=student_id,
                class_name=class_name,
                confidence=face.confidence
            )

            # To get the name, we'd ideally have it in the face object.
            # For now, we'll return the ID and confidence.
            marked_present.append({
                "student_id": student_id,
                "confidence": face.confidence
            })

    return {
        "session": {
            "class_name": class_name,
            "date": date.today().isoformat()
        },
        "marked_present": marked_present,
        "total_count": len(marked_present),
        "debug_image_url": f"/static/debug/{temp_filename}"
    }

@router.get("/report")
async def get_report(
    class_name: str = Query(...),
    report_date: date = Query(default=date.today()),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates an attendance report for a specific class and date.
    """
    attendance_service = AttendanceService(db)
    report = await attendance_service.get_attendance_report(class_name, report_date)
    return {
        "class_name": class_name,
        "date": report_date,
        "report": report
    }

@router.get("/student/{student_id}")
async def get_student_history(
    student_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves attendance history for a specific student.
    """
    attendance_service = AttendanceService(db)
    history = await attendance_service.get_student_history(student_id)
    return {
        "student_id": student_id,
        "history": history
    }

@router.get("/export/csv")
async def export_attendance_csv(
    class_name: str = Query(...),
    report_date: date = Query(default=date.today()),
    db: AsyncSession = Depends(get_db)
):
    """
    Exports the attendance report as a CSV file.
    """
    attendance_service = AttendanceService(db)
    report = await attendance_service.get_attendance_report(class_name, report_date)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["Student ID", "Roll Number", "Name", "Status", "Confidence", "Time"])

    # Data
    for row in report:
        writer.writerow([
            row["student_id"],
            row["roll_number"],
            row["name"],
            row["status"],
            row["confidence"],
            row["time"]
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_{class_name}_{report_date}.csv"}
    )
