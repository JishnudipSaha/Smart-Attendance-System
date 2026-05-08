# 🎓 Smart Attendance System

An AI-powered automated attendance solution that detects and recognizes students from classroom images and automatically marks their attendance.

## 🌟 Key Features
- **Multi-Face Recognition**: Detects and recognizes multiple students in a single classroom image.
- **High Accuracy AI**: Uses RetinaFace for robust face detection and ArcFace (InsightFace) for high-precision embeddings.
- **Production-Grade Backend**: Built with FastAPI, SQLAlchemy (Async), and PostgreSQL.
- **Automatic Attendance Engine**: Converts AI recognition results into persistent attendance records with duplicate prevention.
- **Modern Admin Dashboard**: Fully responsive React frontend with Light/Dark mode, student management, and real-time attendance marking.
- **Attendance Analytics**: Visual trends and presence distribution charts.
- **Automatic Cleanup**: Comprehensive student deletion pipeline that removes metadata, embeddings, and images.
- **Debug Visualization**: Generates annotated images with bounding boxes and confidence scores for AI verification.
- **Dockerized Deployment**: Easy setup with Docker Compose for consistent environments.

## 🛠️ Tech Stack
- **Backend**: FastAPI, Python 3.11
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, TanStack Query
- **Database**: PostgreSQL, SQLAlchemy 2.0, Alembic
- **AI/ML**: InsightFace (RetinaFace & ArcFace), OpenCV, NumPy, ONNX Runtime
- **Infrastructure**: Docker, Docker Compose
- **Validation**: Pydantic

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed
- Git cloned to local machine
- Node.js and npm installed (for frontend)

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

3. **Launch Backend with Docker**:
   ```bash
   docker-compose up -d --build
   ```

4. **Initialize Database**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Launch Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   > If you are in the project root, run: `npm --prefix ./frontend run dev`

### 🖥️ Accessing the System
- **Admin Dashboard**: `http://localhost:5173`
- **API Documentation**: `http://localhost:8000/docs`

### 🧪 Testing the System
You can use the Dashboard or the following API endpoints:

| Action | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health Check** | `GET` | `/health` | Verify API and DB connectivity |
| **Register Student** | `POST` | `/students/` | Create student metadata |
| **Upload Photos** | `POST` | `/students/{id}/upload-images` | Upload reference images |
| **Generate AI** | `POST` | `/ai/students/{id}/generate-embeddings` | Create facial embeddings |
| **Recognize Class** | `POST` | `/recognition/classroom` | Detect & recognize multiple students |
| **Mark Attendance** | `POST` | `/attendance/mark` | Recognize and mark attendance |
| **Get Report** | `GET` | `/attendance/report` | Get daily attendance status |
| **Export CSV** | `GET` | `/attendance/export/csv` | Download attendance as CSV |

**Visualizing Results:**
- **Student Images**: `http://localhost:8000/static/students/{roll_number}/{filename}`
- **AI Debug Images**: `http://localhost:8000/static/debug/{debug_filename}`

## ✅ Recent Updates
- Fixed frontend lint/type issues across Students, Mark Attendance, Reports, and Analytics pages.
- Fixed Tailwind CSS v4 setup so UI styling renders correctly in the web app.
- Added real student image upload flow in the Students page (replacing placeholder popup).
- Fixed `/attendance/mark` to use the same recognition path as `/recognition/classroom`.
- Improved attendance recognition error handling for invalid or unreadable image uploads.
- Added frontend student deletion with confirmation and backend cascade cleanup support.
- Added per-student status tracking in UI: uploaded photo count, embedding count, and generated/pending badges.
- Added student ID visibility in student cards and delete confirmation for safer operations.
- Added class-name dropdown in Attendance Reports populated from registered classes.
- Fixed dropdown option contrast/readability in dark mode.

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

frontend/
├── src/
│   ├── api/      # API service layer
│   ├── components/ # Reusable UI components
│   ├── pages/      # Page-level views
│   └── store/      # Global state (Theme, etc.)
```

## 📈 Roadmap
- [x] Phase 1: Backend Foundation
- [x] Phase 2: Student Registration & Image Uploads
- [x] Phase 3: AI Embedding Generation
- [x] Phase 4: Multi-Face Classroom Recognition
- [x] Phase 5: Attendance Marking Engine
- [x] Phase 6: Admin Dashboard & Analytics Reports
