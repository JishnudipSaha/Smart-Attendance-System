# Smart Attendance System

AI-powered attendance platform for classrooms. The system detects faces from classroom photos, recognizes registered students, and stores attendance records with reports and analytics.

## Features

- Multi-face classroom recognition with InsightFace (RetinaFace + ArcFace)
- Student lifecycle management (create, upload photos, generate embeddings, delete with cleanup)
- Attendance marking, daily reports, and CSV export
- Modern glassmorphism React dashboard with dark mode and analytics views
- Debug image support for recognition result verification

## Frontend UI

The frontend uses a polished glassmorphism design with:

- **Dashboard** — Live stats (total students, active classes, AI readiness), quick-action cards, getting-started checklist
- **Students** — Search/filter, avatar initials, progress indicators for photo/embedding readiness, auto-dismissing toasts, skeleton loading
- **Mark Attendance** — Enhanced upload zone with animations, confidence bar visualizations, step-by-step processing indicators, summary stats
- **Reports** — Summary stat cards (total, present, absent, attendance rate), status dot indicators, skeleton loading, alternating row tints
- **Analytics** — Real data from API, gradient bar charts, donut chart with legend, summary stats (avg attendance, best day, active days)
- **Sidebar** — Active indicator bar, user profile section, page description subtitles, notification bell

### Screenshots

| Dashboard | Students | Mark Attendance |
|-----------|----------|-----------------|
| Live stats, quick actions, checklist | Search, avatars, progress bars | Upload zone, confidence bars |

| Reports | Analytics |
|---------|-----------|
| Summary cards, status dots, export | Gradient charts, legend, real data |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | FastAPI, SQLAlchemy (async), Alembic, PostgreSQL |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand 5, Recharts |
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
   ├── api/            # Axios client + service layer
   ├── components/     # Layout (DashboardLayout) and common (ThemeToggle)
   ├── pages/          # Students, MarkAttendance, Reports, Analytics
   ├── store/          # Zustand theme store
   └── index.css       # Tailwind config + glassmorphism component classes
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
npm run dev        # Start dev server
npm run build      # Production build (tsc + vite)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Notes

- Student images and debug outputs are served under `/static`.
- `test_api.py` and `test_classroom.jpg` are available in repo root for quick API smoke tests.
- The glassmorphism design system uses custom CSS component classes (`.ui-card`, `.glass-panel`, `.ui-button-primary`, etc.) defined in `index.css`.
- Tailwind CSS v4 note: custom component classes cannot be `@apply`'d within `@layer components` — styles must be inlined.

## Knowledge Graph Artifacts (Graphify)

Graphify outputs are available under `graphify-out/`:

- `graphify-out/graph.json` - GraphRAG-ready structured graph data
- `graphify-out/graph.html` - Interactive graph visualization
- `graphify-out/GRAPH_REPORT.md` - Plain-language architecture and dependency report

## License

This project is intended for educational and personal use.
