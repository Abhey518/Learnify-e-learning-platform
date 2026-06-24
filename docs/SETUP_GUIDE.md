# Learnify - Team Setup Guide

Welcome to the Learnify project! This guide will help you get the project running on your local machine after cloning it from the repository.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Environment Configuration](#environment-configuration)
5. [Feature Assignments](#feature-assignments)
6. [Development Workflow](#development-workflow)
7. [Running the Project](#running-the-project)
8. [Common Issues](#common-issues)

---

## Prerequisites

Make sure you have the following installed on your machine:

### For Both Frontend & Backend:
- **Git** (v2.0 or higher) - [Download](https://git-scm.com/)
- **Node.js** (v16+ for frontend) - [Download](https://nodejs.org/)
- **Python** (v3.8+ for backend) - [Download](https://www.python.org/)
- **npm** (comes with Node.js) or **yarn**

### Verify Installation:
```bash
node --version
npm --version
python --version
git --version
```

---

## Project Structure

```
Learnify/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── core/            # Shared app logic, routes, API config
│   │   ├── shared/          # Reusable components, hooks, utilities
│   │   ├── features/        # Feature-based modules
│   │   │   ├── courses/
│   │   │   ├── enrollment/
│   │   │   ├── quiz/
│   │   │   ├── forum/
│   │   │   └── analytics/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env                 # Environment variables (CREATE THIS)
│
├── backend/                  # Flask application
│   ├── app.py               # Main application file
│   ├── config.py            # Configuration
│   ├── core/                # Core utilities (middleware, decorators)
│   ├── shared/              # Shared models and utilities
│   ├── features/            # Feature-based modules
│   │   ├── courses/
│   │   ├── enrollment/
│   │   ├── quiz/
│   │   ├── forum/
│   │   └── analytics/
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (CREATE THIS)
│
└── docs/                    # Documentation
    └── SETUP_GUIDE.md       # This file
```

---

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Learnify
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment (Python)
**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Create .env File
In `backend/` directory, create a `.env` file:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Database
DATABASE_URL=your_database_url_here

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production
JWT_ALGORITHM=HS256
```

#### 2.5 Run Backend Server
```bash
python app.py
```

The backend will run on `http://localhost:5000`

---

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd ../frontend
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

#### 3.3 Create .env File
In `frontend/` directory, create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Learnify
```

#### 3.4 Run Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## Environment Configuration

### Backend Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_ENV` | Environment mode | `development` or `production` |
| `FLASK_APP` | Entry point | `app.py` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase API key | `eyJhbGc...` |
| `DATABASE_URL` | Database connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |

### Frontend Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Application name | `Learnify` |

---

## Feature Assignments

Each team member will work on specific features. Here's how they're organized:

### 1. **Courses Module**
- **Lead Developer**: [Name]
- **Responsibilities**:
  - Frontend: `frontend/src/features/courses/`
  - Backend: `backend/features/courses/`
  - List all courses
  - View course details
  - Create/Edit/Delete courses (admin only)
- **Key Files**:
  - Frontend: `pages/`, `components/`, `services/`, `routes.jsx`
  - Backend: `routes.py`, `services.py`, `validators.py`

### 2. **Enrollment Module**
- **Lead Developer**: [Name]
- **Responsibilities**:
  - Frontend: `frontend/src/features/enrollment/`
  - Backend: `backend/features/enrollment/`
  - Enroll students in courses
  - View enrollments
  - Manage enrollment status
- **Key Files**:
  - Frontend: `pages/`, `components/`, `services/`, `routes.jsx`
  - Backend: `routes.py`, `services.py`, `validators.py`

### 3. **Quiz Module**
- **Lead Developer**: [Name]
- **Responsibilities**:
  - Frontend: `frontend/src/features/quiz/`
  - Backend: `backend/features/quiz/`
  - Create quizzes
  - Take quizzes
  - View quiz results/grades
  - Automatic grading logic
- **Key Files**:
  - Frontend: `pages/`, `components/`, `services/`, `routes.jsx`
  - Backend: `routes.py`, `services.py`, `validators.py`

### 4. **Forum Module**
- **Lead Developer**: [Name]
- **Responsibilities**:
  - Frontend: `frontend/src/features/forum/`
  - Backend: `backend/features/forum/`
  - Create discussion threads
  - Post replies
  - Moderate posts
- **Key Files**:
  - Frontend: `pages/`, `components/`, `services/`, `routes.jsx`
  - Backend: `routes.py`, `services.py`, `validators.py`

### 5. **Analytics Module**
- **Lead Developer**: [Name]
- **Responsibilities**:
  - Frontend: `frontend/src/features/analytics/`
  - Backend: `backend/features/analytics/`
  - Dashboard with course statistics
  - User progress tracking
  - Generate reports
- **Key Files**:
  - Frontend: `pages/`, `components/`, `services/`, `routes.jsx` (uses Recharts)
  - Backend: `routes.py`, `services.py`, `validators.py`

### 6. **Shared Components & Utilities (Team Effort)**
- **Responsibilities**:
  - Frontend: `frontend/src/shared/`
  - Backend: `backend/shared/`
  - Reusable UI components
  - Custom hooks
  - Common utilities and validators
  - Data models

---

## Development Workflow

### 1. **Before Starting Work**
```bash
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. **Working on Your Feature**

**Frontend Development:**
```bash
cd frontend
npm run dev
# Your changes will hot-reload automatically
```

**Backend Development:**
```bash
cd backend
python app.py
# Restart server when you make changes
```

### 3. **Testing Your Changes**

**Frontend:**
```bash
# Run linter (if configured)
npm run lint

# Build for production (to check for errors)
npm run build
```

**Backend:**
```bash
# No specific test command yet - implement as needed
```

### 4. **Commit Your Changes**
```bash
git add .
git commit -m "feat: add feature description"
git push origin feature/your-feature-name
```

### 5. **Create a Pull Request**
- Go to the repository on GitHub/GitLab
- Create a pull request against `main` branch
- Request review from team members
- Address feedback and make necessary changes

### 6. **Merge to Main**
Once approved and tests pass:
```bash
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

---

## Running the Project

### Option 1: Run Both Simultaneously (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows: or use `source venv/bin/activate` on macOS/Linux
python app.py
# Running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

### Option 2: Run Backend Only
```bash
cd backend
python app.py
# API available at http://localhost:5000/api
```

### Option 3: Build for Production

**Frontend:**
```bash
cd frontend
npm run build
# Creates optimized build in dist/ folder
```

**Backend:**
```bash
# Update config.py to production settings
# Deploy as needed
```

---

## Common Issues & Solutions

### Issue 1: Python Virtual Environment Not Activating

**Windows:**
```bash
# If venv\Scripts\activate doesn't work, try:
venv\Scripts\Activate.ps1
# If that fails, run PowerShell as Administrator first
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### Issue 2: npm Modules Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue 3: Port Already in Use

**For Backend (Port 5000):**
```bash
# Windows: Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

**For Frontend (Port 5173):**
- The Vite dev server will automatically use a different port if 5173 is in use

### Issue 4: API Connection Refused

- Verify backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `frontend/.env`
- Check for CORS issues in Flask backend

### Issue 5: Database Connection Error

- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`
- Ensure you have internet connection
- Check Supabase dashboard for service status

---

## Quick Reference Commands

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm install        # Install dependencies
npm list           # List installed packages
```

### Backend
```bash
python app.py      # Run development server
pip install -r requirements.txt  # Install dependencies
pip freeze         # List installed packages
deactivate         # Deactivate virtual environment
```

### Git
```bash
git status         # Check status
git pull           # Fetch and merge latest changes
git push           # Push your commits
git branch -a      # List all branches
git log --oneline  # View commit history
```

---

## Additional Notes

- **Do NOT commit `.env` files** - They contain sensitive information
- **Always pull before pushing** to avoid merge conflicts
- **Test your changes** before creating a pull request
- **Keep commits small and descriptive** for better code review
- **Use meaningful branch names** like `feature/course-list`, `bug/login-error`
- **Document your code** with comments for complex logic

---

## Contact & Support

If you encounter any issues or have questions:
1. Check the "Common Issues" section above
2. Ask your team lead
3. Create an issue in the repository with details

Happy coding! 🚀
