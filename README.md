# Smart Attendance System

A professional face recognition-based attendance system built with React, Node.js, and MySQL.

## Features

- **Face Recognition Kiosk** – Mark attendance by scanning faces
- **Student Enrollment** – Enroll students with face capture
- **Attendance Records** – View and manage attendance history
- **Role-based Access** – Admin and Teacher roles
- **Responsive UI** – Modern, professional design

## Tech Stack

- **Frontend:** React, face-api.js
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** JWT

## Setup

### 1. Database

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
node scripts/seedUsers.js   # Create default admin & teacher
npm run dev
```

**Default login credentials** (after running seed):
| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Teacher | teacher  | teacher123 |

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Optional: set REACT_APP_API_URL if backend runs on different host
npm install
npm start
```

### 4. Face Models

Place face-api.js models in `frontend/public/models/`:

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_tiny_model-weights_manifest.json`
- `face_landmark_68_tiny_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

Download from: [face-api.js models](https://github.com/justadudewhohacks/face-api.js-models)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_DATABASE` | Database name |
| `JWT_SECRET` | Secret for JWT tokens |
| `PORT` | Backend port (default: 5000) |
| `REACT_APP_API_URL` | API URL for frontend (default: http://localhost:5000/api) |

## Usage

1. **Login** – Use admin/teacher credentials at `/login`
2. **Enroll Students** – Add students with face capture at `/add_student`
3. **Mark Attendance** – Use the Kiosk at `/` to scan faces
4. **View Records** – Check attendance at `/attendance-table`

## Project Structure

```
smart-attendance/
├── backend/          # Express API
├── frontend/         # React app
├── database/         # SQL schema
└── README.md
```
