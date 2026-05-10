# Smart Attendance System

AI-powered attendance platform for classrooms. The system detects faces from classroom photos, recognizes registered students, and stores attendance records with reports and analytics.

## Features

- Multi-face classroom recognition with InsightFace (RetinaFace + ArcFace)
- Student lifecycle management (create, upload photos, generate embeddings, delete with cleanup)
- Attendance marking, daily reports, and CSV export
- Modern React dashboard with dark mode and analytics views
- Debug image support for recognition result verification

## Recent Improvements

- Refined dashboard layout and spacing across core pages (Students, Reports, Analytics, Mark Attendance)
- Updated dark/light theme behavior for better readability and visual consistency
- Improved global frontend styling in `frontend/src/index.css` for cleaner UI presentation

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | FastAPI, SQLAlchemy (async), Alembic, PostgreSQL |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query |
| AI/ML | InsightFace, OpenCV, NumPy, ONNX Runtime |
| Infra | Docker, Docker Compose |

## Project Structure

```text
app/
├── api/         # FastAPI routes
├── services/    # Business logic and orchestration
├── ai/          # Detection/recognition pipeline wrappers
├── models/      # SQLAlchemy models
├── schemas/     # Pydantic schemas
├── core/        # Config and app settings
└── main.py      # FastAPI entrypoint

frontend/
└── src/
   ├── api/
   ├── components/
   ├── pages/
   └── store/
```

## Prerequisites

- Docker Desktop
- Node.js 20+ and npm
- Git

## Quick Start (Recommended: Docker + local frontend)

1. Clone repository:
   ```bash
   git clone https://github.com/JishnudipSaha/Smart-Attendance-System.git
   cd Smart-Attendance-System
   ```
2. Create `.env` (you can copy from `.env.example`):
   ```env
   APP_NAME="Smart Attendance System"
   DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/attendance_db
   SECRET_KEY=change-this-secret
   ```
3. Start backend and database:
   ```bash
   docker-compose up -d --build
   docker-compose exec backend alembic upgrade head
   ```
4. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Core API Endpoints

| Purpose | Method | Endpoint |
| --- | --- | --- |
| Register student | `POST` | `/students/` |
| Upload student photos | `POST` | `/students/{id}/upload-images` |
| Generate embeddings | `POST` | `/ai/students/{id}/generate-embeddings` |
| Recognize classroom | `POST` | `/recognition/classroom` |
| Mark attendance | `POST` | `/attendance/mark` |
| Attendance report | `GET` | `/attendance/report` |
| Export report CSV | `GET` | `/attendance/export/csv` |

## Frontend Commands

Run from `frontend/`:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Notes

- Student images and debug outputs are served under `/static`.
- `test_api.py` and `test_classroom.jpg` are available in repo root for quick API smoke tests.

## License

This project is intended for educational and personal use.
