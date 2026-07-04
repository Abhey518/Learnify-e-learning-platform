# Team Assignments & Responsibilities

## Project Overview

Learnify is a full-stack learning management system with two main components:
- **Frontend**: React + Vite (handles UI and user interactions)
- **Backend**: Flask + Supabase (handles data and business logic)

Each feature is split between frontend and backend. Team members will work on both parts.

---

## Team Structure

### 1️⃣ Courses Module Lead
**Primary Focus:** Course management and catalog

#### Frontend Responsibilities (`frontend/src/features/courses/`)
- [ ] Create course listing page with filters and search
- [ ] Build course detail page
- [ ] Create course creation form (admin only)
- [ ] Build course editing interface
- [ ] Implement delete functionality
- [ ] Add course enrollment button
- [ ] Display instructor information
- [ ] Show course metadata (duration, difficulty, etc.)

**Files to Create:**
- `pages/CoursesListPage.jsx` - List all courses
- `pages/CourseDetailPage.jsx` - Course details
- `pages/CourseCreatePage.jsx` - Create course (admin)
- `components/CourseCard.jsx` - Reusable course card
- `components/CourseFilter.jsx` - Filter/search component
- `services/courseService.js` - API calls to backend
- Update `routes.jsx` - Add course routes

#### Backend Responsibilities (`backend/features/courses/`)
- [ ] Implement `GET /courses` - Fetch all courses
- [ ] Implement `GET /courses/<id>` - Fetch single course
- [ ] Implement `POST /courses` - Create course (admin only)
- [ ] Implement `PUT /courses/<id>` - Update course
- [ ] Implement `DELETE /courses/<id>` - Delete course
- [ ] Add filtering logic (by instructor, category, etc.)
- [ ] Add search functionality
- [ ] Implement pagination
- [ ] Add validation for course data
- [ ] Implement authorization checks

**Files to Create:**
- Complete `routes.py` - All endpoint implementations
- Complete `services.py` - Business logic
- Complete `validators.py` - Input validation
- Create database queries for course operations

**Database Table to Use:**
- `courses` table in Supabase

---

### 2️⃣ Enrollment Module Lead
**Primary Focus:** Student course registration and enrollment management

#### Frontend Responsibilities (`frontend/src/features/enrollment/`)
- [ ] Create enrollment list page for users
- [ ] Build "My Courses" dashboard
- [ ] Implement course enrollment button
- [ ] Add unenroll confirmation dialog
- [ ] Show enrollment status (active, completed, dropped)
- [ ] Display enrollment date and progress
- [ ] Add quick links to enrolled courses

**Files to Create:**
- `pages/MyCoursesPage.jsx` - List enrolled courses
- `pages/EnrollmentPage.jsx` - Enrollment management
- `components/EnrollmentCard.jsx` - Enrollment item card
- `components/EnrollButton.jsx` - Enroll/Unenroll button
- `services/enrollmentService.js` - API calls
- Update `routes.jsx` - Add enrollment routes

#### Backend Responsibilities (`backend/features/enrollment/`)
- [ ] Implement `GET /enrollment` - Get user's enrollments
- [ ] Implement `POST /enrollment` - Enroll in course
- [ ] Implement `DELETE /enrollment/<id>` - Unenroll
- [ ] Validate enrollment doesn't already exist
- [ ] Prevent duplicate enrollments
- [ ] Check if course exists before enrolling
- [ ] Check if user exists before enrolling
- [ ] Add enrollment status management
- [ ] Implement enrollment history tracking

**Files to Create:**
- Complete `routes.py` - Enrollment endpoints
- Complete `services.py` - Enrollment logic
- Complete `validators.py` - Input validation
- Create database queries

**Database Tables to Use:**
- `enrollments` table in Supabase

---

### 3️⃣ Quiz Module Lead
**Primary Focus:** Quiz creation, taking, and grading

#### Frontend Responsibilities (`frontend/src/features/quiz/`)
- [ ] Create quiz list page
- [ ] Build quiz-taking interface
- [ ] Implement question display (multiple choice, short answer, essay)
- [ ] Create answer submission form
- [ ] Build quiz results/scoring page
- [ ] Show user performance metrics
- [ ] Add timer for timed quizzes
- [ ] Implement answer validation before submission
- [ ] Show correct answers after submission

**Files to Create:**
- `pages/QuizListPage.jsx` - Available quizzes
- `pages/QuizPage.jsx` - Quiz taking interface
- `pages/QuizResultsPage.jsx` - Results and scores
- `components/QuestionDisplay.jsx` - Display question
- `components/QuestionInput.jsx` - Answer input
- `components/QuizTimer.jsx` - Timer component
- `services/quizService.js` - API calls
- Update `routes.jsx` - Add quiz routes

#### Backend Responsibilities (`backend/features/quiz/`)
- [ ] Implement `GET /quizzes` - Get all quizzes
- [ ] Implement `GET /quizzes/<id>` - Get specific quiz
- [ ] Implement `POST /quizzes/<id>/submit` - Submit answers
- [ ] Implement automatic grading for multiple choice
- [ ] Implement `GET /quizzes/<id>/results` - Get results
- [ ] Calculate quiz scores
- [ ] Store quiz submissions
- [ ] Compare answers with correct answers
- [ ] Handle partial credit scenarios
- [ ] Validate quiz submissions

**Files to Create:**
- Complete `routes.py` - Quiz endpoints
- Complete `services.py` - Grading and scoring logic
- Complete `validators.py` - Answer validation
- Create database queries

**Database Tables to Use:**
- `quizzes` table
- `quiz_questions` table
- New `quiz_submissions` table (create this)

---

### 4️⃣ Forum Module Lead
**Primary Focus:** Discussion threads and community engagement

#### Frontend Responsibilities (`frontend/src/features/forum/`)
- [ ] Create forum thread list page
- [ ] Build thread detail page with posts
- [ ] Implement thread creation form
- [ ] Create post reply interface
- [ ] Add post editing functionality (own posts)
- [ ] Implement delete post (own posts)
- [ ] Show user info and post count
- [ ] Add upvote/downvote or like system
- [ ] Display post timestamps
- [ ] Add pagination for posts

**Files to Create:**
- `pages/ForumListPage.jsx` - List threads
- `pages/ForumThreadPage.jsx` - Thread details and posts
- `components/ThreadCard.jsx` - Thread item
- `components/PostCard.jsx` - Post item
- `components/CreateThreadForm.jsx` - New thread
- `components/CreatePostForm.jsx` - New post
- `services/forumService.js` - API calls
- Update `routes.jsx` - Add forum routes

#### Backend Responsibilities (`backend/features/forum/`)
- [ ] Implement `GET /forum/threads` - Get all threads
- [ ] Implement `POST /forum/threads` - Create thread
- [ ] Implement `GET /forum/threads/<id>/posts` - Get posts
- [ ] Implement `POST /forum/threads/<id>/posts` - Create post
- [ ] Implement `PUT /forum/posts/<id>` - Edit post
- [ ] Implement `DELETE /forum/posts/<id>` - Delete post
- [ ] Add post count tracking
- [ ] Add thread activity tracking
- [ ] Implement moderation (delete inappropriate posts)
- [ ] Add timestamps for all posts

**Files to Create:**
- Complete `routes.py` - Forum endpoints
- Complete `services.py` - Thread and post logic
- Complete `validators.py` - Input validation
- Create database queries

**Database Tables to Use:**
- `forum_threads` table
- `forum_posts` table

---

### 5️⃣ Analytics Module Lead
**Primary Focus:** Student progress tracking and performance dashboards

#### Frontend Responsibilities (`frontend/src/features/analytics/`)
- [ ] Create analytics dashboard page
- [ ] Build course progress charts (using Recharts)
- [ ] Implement student performance metrics
- [ ] Create progress visualization
- [ ] Add user analytics page (for students)
- [ ] Build admin analytics page
- [ ] Display completion rates
- [ ] Show quiz performance trends
- [ ] Add exportable reports
- [ ] Create pie charts and bar charts

**Files to Create:**
- `pages/AnalyticsDashboardPage.jsx` - Main dashboard
- `pages/CourseAnalyticsPage.jsx` - Course-specific
- `pages/UserAnalyticsPage.jsx` - User progress
- `components/ProgressChart.jsx` - Chart components
- `components/StatCard.jsx` - Stat display
- `services/analyticsService.js` - API calls
- Update `routes.jsx` - Add analytics routes
- Use Recharts for visualizations (already installed)

#### Backend Responsibilities (`backend/features/analytics/`)
- [ ] Implement `GET /analytics/dashboard` - Dashboard data
- [ ] Implement `GET /analytics/course/<id>` - Course stats
- [ ] Implement `GET /analytics/user/<id>` - User progress
- [ ] Calculate completion percentages
- [ ] Calculate average scores
- [ ] Generate progress trends
- [ ] Aggregate enrollment data
- [ ] Calculate course participation stats
- [ ] Generate performance reports
- [ ] Implement data aggregation and caching

**Files to Create:**
- Complete `routes.py` - Analytics endpoints
- Complete `services.py` - Data aggregation and calculations
- Complete `validators.py` - Input validation
- Create complex database queries

**Database Tables to Use:**
- `courses` table
- `enrollments` table
- `progress` table
- `quiz_submissions` table (after quiz module)

---

### 👥 Shared Components & Utilities Team (All)
**Primary Focus:** Reusable components and utility functions

#### Frontend Shared (`frontend/src/shared/`)
- [ ] Create reusable UI components (Button, Modal, Form, etc.)
- [ ] Implement custom hooks (useAuth, useFetch, etc.)
- [ ] Create utility functions (date formatting, validation, etc.)
- [ ] Build navigation components
- [ ] Create layout components
- [ ] Implement theme/styling system

#### Backend Shared (`backend/shared/`)
- [ ] Complete user model implementation
- [ ] Complete course model implementation
- [ ] Implement progress model
- [ ] Create utility validators
- [ ] Implement helper functions
- [ ] Create database query helpers

---

## Setup Tasks (Everyone)

### First Day Tasks:
1. ✅ Clone repository
2. ✅ Read SETUP_GUIDE.md
3. ✅ Install backend dependencies
4. ✅ Install frontend dependencies
5. ✅ Create .env files (both frontend and backend)
6. ✅ Run both servers
7. ✅ Verify they work
8. ✅ Create your feature branch

### Before Each Coding Session:
1. Pull latest changes: `git pull origin main`
2. Update feature branch: `git merge main`
3. Start both servers
4. Begin development

---

## Development Timeline Suggestion

### Week 1: Setup & Courses Module
- Complete environment setup
- Build courses module (both frontend & backend)
- Create basic UI
- Implement API endpoints

### Week 2: Enrollment & Quiz Modules
- Build enrollment system
- Start quiz module
- Implement auto-grading logic
- Build quiz UI

### Week 3: Forum & Analytics
- Complete forum system
- Build analytics dashboard
- Add charts and visualizations
- Implement progress tracking

### Week 4: Integration & Testing
- Integration testing
- Bug fixes
- Performance optimization
- Final refinements

---

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project style
- [ ] No console errors or warnings
- [ ] All functions have comments
- [ ] No hardcoded values (use constants)
- [ ] No .env files committed
- [ ] Database queries are optimized
- [ ] Error handling is implemented
- [ ] User inputs are validated
- [ ] API responses are properly formatted

---

## Communication & Collaboration

### Daily Standup Questions:
1. What did I complete yesterday?
2. What will I complete today?
3. Are there any blockers?

### When You Need Help:
1. Check documentation first
2. Ask in team chat
3. Create an issue on GitHub
4. Schedule a pair programming session

### Code Review Process:
1. Create PR with clear description
2. Link related issues
3. Request review from 1-2 team members
4. Address feedback
5. Merge when approved

---

## Important Reminders

⚠️ **DO NOT:**
- Commit .env files
- Push to main directly
- Use hardcoded URLs or API keys
- Skip input validation
- Leave console.log() statements in production code
- Make huge commits with multiple changes

✅ **DO:**
- Create feature branches
- Write descriptive commit messages
- Test thoroughly before PR
- Document complex logic
- Ask for help when needed
- Review others' code respectfully

---

## Resources

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common tasks
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- Frontend docs: Vite, React, React Router
- Backend docs: Flask, Supabase, Flask-CORS

---

**Last Updated:** 2026-06-24

Good luck! 🚀
