from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    class_name = Column(String, nullable=False)
    section = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    embeddings = relationship("Embedding", back_populates="student", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    embedding_vector = Column(String, nullable=False) # Storing as string/JSON for simplicity;’ Vector type requires pgvector extension
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="embeddings")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    attendance_date = Column(DateTime(timezone=True), nullable=False)
    attendance_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False) # e.g., "Present", "Absent"

    student = relationship("Student", back_populates="attendance")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
