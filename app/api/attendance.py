from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
import csv
import io

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
    # 1. Run recognition pipeline directly from uploaded file
    recognition_service = ClassroomRecognitionService(db)
    results = await recognition_service.recognize_classroom(image)
    recognized_students = results.get("recognized_students", [])

    # 2. Mark attendance for recognized students
    similarity_service = SimilarityService()
    attendance_service = AttendanceService(db)

    marked_present = []
    for face in recognized_students:
        # Only mark if confidence is above threshold
        confidence = float(face.get("confidence", 0))
        student_id = face.get("student_id")
        if student_id is None:
            continue

        if confidence >= similarity_service.threshold:
            await attendance_service.mark_attendance(
                student_id=student_id,
                class_name=class_name,
                confidence=confidence
            )

            marked_present.append({
                "student_id": student_id,
                "confidence": confidence
            })

    return {
        "session": {
            "class_name": class_name,
            "date": date.today().isoformat()
        },
        "marked_present": marked_present,
        "total_count": len(marked_present),
        "debug_image_url": results.get("debug_image_url")
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
