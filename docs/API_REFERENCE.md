# API Documentation & Database Schema

## API Base URL

```
http://localhost:5000/api
```

## Authentication

All requests (except login) require the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are stored in `localStorage` as `auth_token` on the frontend.

---

## API Endpoints Overview

### Authentication Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout user

### Courses Routes
```
GET     /api/courses              - Get all courses
GET     /api/courses/<id>         - Get specific course
POST    /api/courses              - Create course (admin)
PUT     /api/courses/<id>         - Update course (admin)
DELETE  /api/courses/<id>         - Delete course (admin)
```

### Enrollment Routes
```
GET     /api/enrollment           - Get user's enrollments
POST    /api/enrollment           - Enroll in course
DELETE  /api/enrollment/<id>      - Unenroll from course
```

### Quiz Routes
```
GET     /api/quizzes              - Get all quizzes
GET     /api/quizzes/<id>         - Get specific quiz
POST    /api/quizzes/<id>/submit  - Submit quiz answers
GET     /api/quizzes/<id>/results - Get quiz results
```

### Forum Routes
```
GET     /api/forum/threads        - Get all forum threads
POST    /api/forum/threads        - Create thread
GET     /api/forum/threads/<id>/posts - Get posts in thread
POST    /api/forum/threads/<id>/posts - Create post in thread
```

### Analytics Routes
```
GET     /api/analytics/dashboard  - Get dashboard data
GET     /api/analytics/course/<id> - Get course analytics
GET     /api/analytics/user/<id>  - Get user analytics
```

---

## Data Models

### User Model
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student|instructor|admin",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Course Model
```json
{
  "id": "uuid",
  "title": "Introduction to Python",
  "description": "Learn Python basics",
  "instructor_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Enrollment Model
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "course_id": "uuid",
  "enrolled_at": "2024-01-01T00:00:00Z",
  "status": "active|completed|dropped"
}
```

### Quiz Model
```json
{
  "id": "uuid",
  "course_id": "uuid",
  "title": "Week 1 Quiz",
  "description": "Quiz about basic concepts",
  "questions": [
    {
      "id": "uuid",
      "type": "multiple_choice|short_answer|essay",
      "question": "What is Python?",
      "options": ["Option 1", "Option 2"],
      "correct_answer": "Option 1"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Progress Model
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "course_id": "uuid",
  "completion_percentage": 75,
  "lessons_completed": 15,
  "lessons_total": 20,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Forum Thread Model
```json
{
  "id": "uuid",
  "course_id": "uuid",
  "user_id": "uuid",
  "title": "How to solve problem X?",
  "content": "I'm stuck on...",
  "created_at": "2024-01-01T00:00:00Z",
  "posts_count": 5
}
```

### Forum Post Model
```json
{
  "id": "uuid",
  "thread_id": "uuid",
  "user_id": "uuid",
  "content": "Here's how you solve it...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Request/Response Examples

### Login
**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

### Get All Courses
**Request:**
```bash
GET /api/courses
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "title": "Python Basics",
      "description": "Learn Python",
      "instructor_id": "uuid"
    }
  ]
}
```

### Create Course
**Request:**
```bash
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Python",
  "description": "Advanced Python concepts",
  "instructor_id": "uuid"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Course created",
  "data": {
    "id": "new-uuid",
    "title": "Advanced Python",
    "description": "Advanced Python concepts",
    "instructor_id": "uuid"
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "status": 400,
  "message": "Validation error",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

### 401 - Unauthorized
```json
{
  "status": 401,
  "message": "Unauthorized",
  "data": null
}
```

### 403 - Forbidden
```json
{
  "status": 403,
  "message": "You don't have permission to perform this action",
  "data": null
}
```

### 404 - Not Found
```json
{
  "status": 404,
  "message": "Resource not found",
  "data": null
}
```

### 500 - Server Error
```json
{
  "status": 500,
  "message": "Internal server error",
  "data": null
}
```

---

## Database Schema (Supabase/PostgreSQL)

### Tables Structure

**users**
```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- name (VARCHAR)
- password_hash (VARCHAR)
- role (ENUM: admin, instructor, student)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**courses**
```sql
- id (UUID, Primary Key)
- title (VARCHAR)
- description (TEXT)
- instructor_id (UUID, Foreign Key → users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**enrollments**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- course_id (UUID, Foreign Key → courses)
- status (ENUM: active, completed, dropped)
- enrolled_at (TIMESTAMP)
- completed_at (TIMESTAMP)
```

**quizzes**
```sql
- id (UUID, Primary Key)
- course_id (UUID, Foreign Key → courses)
- title (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
```

**quiz_questions**
```sql
- id (UUID, Primary Key)
- quiz_id (UUID, Foreign Key → quizzes)
- question_text (TEXT)
- question_type (ENUM: multiple_choice, short_answer, essay)
- options (JSONB)
- correct_answer (JSONB)
- points (INTEGER)
```

**forum_threads**
```sql
- id (UUID, Primary Key)
- course_id (UUID, Foreign Key → courses)
- user_id (UUID, Foreign Key → users)
- title (VARCHAR)
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**forum_posts**
```sql
- id (UUID, Primary Key)
- thread_id (UUID, Foreign Key → forum_threads)
- user_id (UUID, Foreign Key → users)
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**progress**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- course_id (UUID, Foreign Key → courses)
- completion_percentage (INTEGER)
- lessons_completed (INTEGER)
- updated_at (TIMESTAMP)
```

---

## Validation Rules

### User Registration
- Email: Valid email format, unique
- Password: Min 8 characters, contains uppercase, lowercase, and numbers
- Name: Min 2 characters, max 100 characters

### Course Creation
- Title: Required, min 3 characters, max 200 characters
- Description: Required, min 10 characters
- Instructor ID: Must be valid user with instructor role

### Quiz Submission
- All questions must be answered (for short_answer and essay)
- Multiple choice must select one option
- Answers must match question types

### Forum Post
- Content: Required, min 2 characters, max 5000 characters
- Cannot post to non-existent thread

---

## Common API Patterns

### Pagination
```bash
GET /api/courses?page=1&limit=10
```

### Filtering
```bash
GET /api/courses?instructor_id=uuid&status=active
```

### Sorting
```bash
GET /api/courses?sort=created_at&order=desc
```

### Search
```bash
GET /api/courses?search=python
```

---

## Frontend Integration Pattern

```javascript
// 1. Import API service
import api from '@/core/api'

// 2. Use in component
const [courses, setCourses] = useState([])

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses')
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }
  fetchCourses()
}, [])

// 3. Display data
return (
  <div>
    {courses.map(course => (
      <div key={course.id}>{course.title}</div>
    ))}
  </div>
)
```

---

## Testing Endpoints

### Using Postman/Insomnia
1. Set base URL: `http://localhost:5000/api`
2. Add header: `Authorization: Bearer <token>`
3. Set method and endpoint
4. Add JSON body if needed
5. Send request

### Using cURL
```bash
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

---

**Last Updated:** 2026-06-24
