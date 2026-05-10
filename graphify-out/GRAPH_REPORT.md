# Graph Report - .  (2026-05-10)

## Corpus Check
- Corpus is ~9,645 words - fits in a single context window. You may not need a graph.

## Summary
- 220 nodes · 310 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `StudentService` - 17 edges
2. `RecognitionPipeline` - 11 edges
3. `AttendanceService` - 11 edges
4. `ClassroomRecognitionService` - 10 edges
5. `AIService` - 8 edges
6. `SimilarityService` - 8 edges
7. `Student` - 7 edges
8. `Embedding` - 7 edges
9. `FaceDetector` - 6 edges
10. `FaceRecognizer` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AIService` --uses--> `RecognitionPipeline`  [INFERRED]
  app/services/ai_service.py → app/ai/pipeline.py
- `ClassroomRecognitionService` --uses--> `RecognitionPipeline`  [INFERRED]
  app/services/classroom_recognition_service.py → app/ai/pipeline.py
- `mark_attendance()` --calls--> `AttendanceService`  [INFERRED]
  app/api/attendance.py → app/services/attendance_service.py
- `Attendance` --uses--> `Base`  [INFERRED]
  app/models/models.py → app/db/session.py
- `AttendanceService` --uses--> `Student`  [INFERRED]
  app/services/attendance_service.py → app/models/models.py

## Hyperedges (group relationships)
- **Attendance Recognition Flow** — attendance_router, ClassroomRecognitionService, RecognitionPipeline, FaceDetector, FaceRecognizer, SimilarityService, AttendanceService, Student, Embedding [INFERRED]
- **AI/ML Service Layer** — AIService, RecognitionPipeline, FaceDetector, FaceRecognizer, SimilarityService, InsightFace [INFERRED]
- **Student Data Management** — StudentService, Student, Embedding, Attendance [INFERRED]
- **Student Authentication Workflow** — students_page, api_client, student_interface, backend_system [INFERRED]
- **Face Recognition Pipeline** — mark_attendance_page, face_recognition, insightface, embedding_generation, backend_system [INFERRED]
- **Attendance Reporting Workflow** — reports_page, analytics_page, attendance_report, api_client, backend_system [INFERRED]
- **Theme Management System** — theme_toggle, theme_store, dark_mode_theme, light_mode_theme, tailwind [INFERRED]

## Communities (17 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (14): AnalyticsEntry, apiClient, Student, StudentCreateInput, studentService, SidebarItemProps, AttendanceMarkResponse, AttendanceSession (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (27): AIService, Admin Model, SQLAlchemy AsyncSession, Attendance Model, AttendanceService, SQLAlchemy DeclarativeBase, ClassroomRecognitionService, Embedding Model (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (24): AnalyticsPage, apiClient, Attendance Marking, Attendance Report, Dark Mode Theme, DashboardLayout, Docker, Embedding Generation (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (10): FaceDetector, Detect faces and return bounding boxes.         Returns: List of (x1, y1, x2, y2, Wrapper for RetinaFace detection using InsightFace., Load image, detect the primary face, and return its embedding., Processes a classroom image to detect all faces and generate embeddings for each, Orchestrates Face Detection and Recognition to generate face embeddings., RecognitionPipeline, FaceRecognizer (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (8): BaseModel, StudentBase, StudentCreate, StudentImageResponse, StudentResponse, StudentUpdate, Completely removes a student, including their embeddings,         attendance re, StudentService

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (11): generate_embeddings(), Trigger the AI pipeline to process all uploaded images for a student     and sto, Base, Base, DeclarativeBase, Admin, Embedding, Student (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (10): mark_attendance(), Recognizes students from a classroom image and marks their attendance., Upload a classroom image to detect and recognize all present students.     - Det, recognize_classroom(), ClassroomRecognitionService, Orchestrator for multi-face recognition in classroom images., Calculate cosine similarity between two vectors.         Formula: (A . B) / (||A, Compare a live embedding against a list of (student_id, embedding) tuples. (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (11): export_attendance_csv(), get_report(), get_student_history(), Exports the attendance report as a CSV file., Generates an attendance report for a specific class and date., Retrieves attendance history for a specific student., Attendance, AttendanceService (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.0
Nodes (8): Backend System, docker-compose.yml, FastAPI, InsightFace, OpenCV, PostgreSQL, requirements.txt, SQLAlchemy

### Community 9 - "Community 9"
Cohesion: 0.0
Nodes (10): delete_student(), get_student(), list_students(), Register a new student in the system.     - Validates metadata.     - Prevents, Retrieve a paginated list of all registered students., Retrieve detailed metadata for a specific student., Upload one or more reference images for a student.     - Validates student exis, Completely remove a student from the system.     - Deletes student metadata. (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.0
Nodes (6): do_run_migrations(), Run migrations in 'offline' mode., Run migrations in 'online' mode., This is the sync function that Alembic uses to run migrations.     The 'connecti, run_migrations_offline(), run_migrations_online()

### Community 11 - "Community 11"
Cohesion: 0.0
Nodes (4): ThemeToggle(), ThemeState, useThemeStore, Zustand

## Knowledge Gaps
- **41 isolated node(s):** `Run migrations in 'offline' mode.`, `Run migrations in 'online' mode.`, `This is the sync function that Alembic uses to run migrations.     The 'connecti`, `Wrapper for RetinaFace detection using InsightFace.`, `Detect faces and return bounding boxes.         Returns: List of (x1, y1, x2, y2` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.