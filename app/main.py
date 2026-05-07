from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from app.api.health import router as health_router
from app.api.students import router as student_router
from app.api.ai import router as ai_router
from app.api.recognition import router as recognition_router
from app.api.attendance import router as attendance_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Smart Attendance System Backend",
    version="1.0.0"
)

# Ensure upload directory exists
upload_path = Path(settings.UPLOAD_DIR)
upload_path.mkdir(parents=True, exist_ok=True)

# Mount Static Files for images
app.mount("/static", StaticFiles(directory="static"))

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(student_router, prefix="/students", tags=["Students"])
app.include_router(ai_router, prefix="/ai/students", tags=["AI Recognition"])
app.include_router(recognition_router, prefix="/recognition", tags=["Classroom Recognition"])
app.include_router(attendance_router, prefix="/attendance", tags=["Attendance Engine"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}
