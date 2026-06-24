# Quick Reference Guide

## Daily Development Checklist

### Start of Day
```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch (if needed)
git checkout -b feature/your-feature-name

# 3. Start backend server
cd backend
python app.py

# 4. In another terminal, start frontend server
cd frontend
npm run dev
```

### During Development

#### Frontend Development
- Edit files in `frontend/src/features/your-module/`
- Hot reload automatically updates changes
- Check browser console for errors
- Test API integration with backend

#### Backend Development
- Edit files in `backend/features/your-module/`
- Restart server after changes (Ctrl+C and `python app.py`)
- Check terminal for errors
- Use Flask debugger for troubleshooting

### End of Day
```bash
# 1. Commit your changes
git add .
git commit -m "feat: describe what you did"

# 2. Push to your branch
git push origin feature/your-feature-name

# 3. Create PR if work is complete
# Go to GitHub/GitLab and create a pull request
```

---

## File Structure Reference

### Working on a Feature?

**Frontend Structure:**
```
frontend/src/features/[your-module]/
├── pages/           ← Create page components here
├── components/      ← Create reusable components here
├── services/        ← API calls go here
├── routes.jsx       ← Route definitions
└── [module-name].css  ← Styles
```

**Backend Structure:**
```
backend/features/[your-module]/
├── routes.py        ← API endpoints
├── services.py      ← Business logic
└── validators.py    ← Data validation
```

---

## Common Tasks

### Create a New API Endpoint

**1. Backend Route** (`backend/features/[module]/routes.py`):
```python
@module_bp.route('/endpoint', methods=['GET'])
def get_data():
    # Your logic here
    pass
```

**2. Backend Service** (`backend/features/[module]/services.py`):
```python
def get_data():
    # Business logic here
    return data
```

**3. Frontend Service** (`frontend/src/features/[module]/services/`):
```javascript
export const getDataService = async () => {
  const response = await api.get('/endpoint')
  return response.data
}
```

**4. Frontend Hook** (`frontend/src/features/[module]/pages/`):
```javascript
const [data, setData] = useState([])
useEffect(() => {
  getDataService().then(setData)
}, [])
```

### Create a New Component

**Frontend:**
1. Create file in `frontend/src/features/[module]/components/MyComponent.jsx`
2. Add CSS in `frontend/src/features/[module]/MyComponent.css`
3. Import and use in pages

```javascript
import MyComponent from '../components/MyComponent'

export default function MyPage() {
  return <MyComponent />
}
```

### Add Dependencies

**Frontend:**
```bash
cd frontend
npm install package-name
```

**Backend:**
```bash
cd backend
pip install package-name
# Update requirements.txt:
pip freeze > requirements.txt
```

---

## Git Commands You'll Need

```bash
# Check status
git status

# See your changes
git diff

# Commit changes
git commit -m "feat: description"

# Push to your branch
git push origin feature/your-feature

# Update your branch with latest main
git pull origin main

# See commit history
git log --oneline -10

# Undo last commit (hasn't been pushed)
git reset --soft HEAD~1
```

---

## Environment Variables Reminder

### Backend `.env`
```env
FLASK_ENV=development
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=dev-secret-key
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

⚠️ **NEVER commit .env files!**

---

## Testing Your Work

### Frontend
- Check browser at `http://localhost:5173`
- Open DevTools (F12) for console errors
- Test with backend running
- Check mobile view responsiveness

### Backend
- Check console output for errors
- Test endpoints with Postman/Thunder Client
- Verify database changes in Supabase dashboard
- Check for CORS issues in browser console

---

## Need Help?

1. **Setup Issues?** → See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Port in use?** → Change port in config
3. **Dependencies error?** → Reinstall: `pip/npm install -r requirements.txt`
4. **API not connecting?** → Check `VITE_API_URL` in frontend `.env`
5. **Database error?** → Verify credentials in backend `.env`

---

## Code Style Tips

### Frontend (JavaScript/React)
- Use camelCase for variables and functions
- Use PascalCase for component names
- Use arrow functions
- Add PropTypes or TypeScript types

### Backend (Python)
- Use snake_case for variables and functions
- Use PascalCase for classes
- Add docstrings to functions
- Follow PEP 8 guidelines

---

## Before Creating a Pull Request

- [ ] Code works locally
- [ ] No console errors
- [ ] No hardcoded values (use env vars)
- [ ] .env file is NOT committed
- [ ] Commit messages are descriptive
- [ ] Your branch is up to date with main
- [ ] Tests pass (if applicable)

---

**Last Updated:** 2026-06-24
