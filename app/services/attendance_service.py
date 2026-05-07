from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date
from app.models.models import Attendance, Student

class AttendanceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def mark_attendance(self, student_id: int, class_name: str, confidence: float):
        """
        Marks a student as present for a specific class on the current date.
        If a record already exists for today, it updates the confidence score if the new one is higher.
        """
        today = date.today()

        # Check for existing attendance record for this student, class, and date
        query = select(Attendance).where(
            Attendance.student_id == student_id,
            Attendance.class_name == class_name,
            func.date(Attendance.attendance_date) == today
        )
        result = await self.db.execute(query)
        existing_record = result.scalar_one_or_none()

        if existing_record:
            # Update confidence if the new one is higher (Duplicate Prevention)
            if confidence > (existing_record.confidence_score or 0.0):
                existing_record.confidence_score = confidence
                existing_record.attendance_time = datetime.now()
                await self.db.commit()
            return existing_record

        # Create new attendance record
        new_record = Attendance(
            student_id=student_id,
            class_name=class_name,
            attendance_date=datetime.now(), # Using datetime for the model's DateTime column
            attendance_time=datetime.now(),
            status="Present",
            confidence_score=confidence
        )
        self.db.add(new_record)
        await self.db.commit()
        await self.db.refresh(new_record)
        return new_record

    async def get_attendance_report(self, class_name: str, report_date: date):
        """
        Generates a report for a specific class on a given date.
        Identifies present and absent students.
        """
        # 1. Get all students registered for this class
        student_query = select(Student).where(Student.class_name == class_name)
        student_result = await self.db.execute(student_query)
        all_students = student_result.scalars().all()

        # 2. Get attendance records for this class and date
        attendance_query = select(Attendance).where(
            Attendance.class_name == class_name,
            func.date(Attendance.attendance_date) == report_date
        )
        attendance_result = await self.db.execute(attendance_query)
        attendance_records = attendance_result.scalars().all()

        # Map student_id to record for quick lookup
        attendance_map = {rec.student_id: rec for rec in attendance_records}

        report = []
        for student in all_students:
            record = attendance_map.get(student.id)
            report.append({
                "student_id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "status": record.status if record else "Absent",
                "confidence": record.confidence_score if record else None,
                "time": record.attendance_time.strftime("%H:%M:%S") if record else None
            })

        return report

    async def get_student_history(self, student_id: int):
        """
        Retrieves all attendance records for a specific student.
        """
        query = select(Attendance).where(Attendance.student_id == student_id).order_by(Attendance.attendance_date.desc())
        result = await self.db.execute(query)
        return result.scalars().all()
