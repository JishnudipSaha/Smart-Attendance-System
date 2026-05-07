# 🎓 Smart Attendance System

An AI-powered automated attendance solution that detects and recognizes students from classroom images and automatically marks their attendance.

## 🌟 Key Features
- **Multi-Face Recognition**: Detects and recognizes multiple students in a single classroom image.
- **High Accuracy AI**: Uses RetinaFace for robust face detection and ArcFace (InsightFace) for high-precision embeddings.
- **Production-Grade Backend**: Built with FastAPI, SQLAlchemy (Async), and PostgreSQL.
- **Automatic Cleanup**: Comprehensive student deletion pipeline that removes metadata, embeddings, and images.
- **Debug Visualization**: Generates annotated images with bounding boxes and confidence scores for AI verification.
- **Dockerized Deployment**: Easy setup with Docker Compose for consistent environments.

## 🛠️ Tech Stack
- **Backend**: FastAPI, Python 3.11
- **Database**: PostgreSQL, SQLAlchemy 2.0, Alembic
- **AI/ML**: InsightFace (RetinaFace & ArcFace), OpenCV, NumPy, ONNX Runtime
- **Infrastructure**: Docker, Docker Compose
- **Validation**: Pydantic

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed
- Git cloned to local machine

### Installation & Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/JishnudipSaha/Smart-Attendance-System.git
   cd Smart-Attendance-System
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   APP_NAME="Smart Attendance System"
   DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/attendance_db
   SECRET_KEY=your-secret-key
   ```

3. **Launch with Docker**:
   ```bash
   docker-compose up -d --build
   ```

4. **Initialize Database**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

### API Documentation
Once the system is running, access the interactive Swagger documentation at:
`http://localhost:8000/docs`

## 📁 Project Architecture
```text
app/
├── api/          # Route handlers (Thin layer)
├── services/     # Business logic & AI orchestration
├── ai/           # Low-level AI wrappers (Detector, Recognizer, Pipeline)
├── models/       # SQLAlchemy database models
├── schemas/      # Pydantic validation models
├── core/         # Global configuration and security
└── main.py       # Application entry point
```

## 📈 Roadmap
- [x] Phase 1: Backend Foundation
- [x] Phase 2: Student Registration & Image Uploads
- [x] Phase 3: AI Embedding Generation
- [x] Phase 4: Multi-Face Classroom Recognition
- [ ] Phase 5: Attendance Marking Engine
- [ ] Phase 6: Admin Dashboard & Analytics Reports
