# Learnify 🎓

A comprehensive learning management system built with React (Vite) and Flask.

## 🚀 Quick Start

### For First-Time Setup:
👉 **Read this first:** [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)

### Quick Commands:

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows or: source venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

- **`frontend/`** - React + Vite application
- **`backend/`** - Flask REST API
- **`docs/`** - Documentation & setup guides

## 🎯 Features

- **Courses** - Course management and browsing
- **Enrollment** - Student course registration
- **Quiz** - Quiz creation and taking with auto-grading
- **Forum** - Discussion threads and community engagement
- **Analytics** - Student progress tracking and dashboards

## 📝 Setup Requirements

✅ Node.js (v16+)
✅ Python (v3.8+)
✅ npm/yarn
✅ Git

## 📖 For Team Members

### First Time?
1. Clone the repository
2. Read [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
3. Set up both frontend and backend
4. Check your feature assignment

### Need Help?
Check the **Common Issues & Solutions** section in [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)

## 🔗 Useful Links

- [Setup Guide](./docs/SETUP_GUIDE.md) - Complete setup instructions
- [Frontend README](./frontend/README.md) - Frontend-specific info
- [Backend Documentation](./backend/app.py) - API documentation

## 💡 Development Tips

- Start both backend and frontend servers for development
- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:5000`
- Don't commit `.env` files to the repository

## 📋 Team Assignments

Each team member is assigned to one feature module:

| Module | Location | Responsibilities |
|--------|----------|------------------|
| Courses | `frontend/src/features/courses/` + `backend/features/courses/` | Course management |
| Enrollment | `frontend/src/features/enrollment/` + `backend/features/enrollment/` | Course registration |
| Quiz | `frontend/src/features/quiz/` + `backend/features/quiz/` | Quiz system |
| Forum | `frontend/src/features/forum/` + `backend/features/forum/` | Discussion boards |
| Analytics | `frontend/src/features/analytics/` + `backend/features/analytics/` | Progress tracking |

See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for detailed feature assignments.

## 🤝 Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Push: `git push origin feature/your-feature`
5. Create a Pull Request

## 📚 Documentation

- [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) - Complete setup and development guide
- Environment variables setup
- Feature assignments
- Development workflow
- Troubleshooting guide

---

**Last Updated:** 2026-06-24
