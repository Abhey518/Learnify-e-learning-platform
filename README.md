# Learnify 🎓
### Learning Management System (LMS)
**Subject:** SWST 32043 - Software Architecture and Concepts (3rd Year)

---

## 👥 Group Members & Contributions

| Name | Student ID | Implemented Module / Responsibilities |
| :--- | :--- | :--- |
| **Abeywardhana H H A P** | `CT/2021/072` | **Courses & Lesson Management**  |
| **Srirajitha.S** | `CT/2021/047` | **Student Enrollment & Progress**  |
| **Lathinka R W I** | `CT/2021/066` | **Quiz & Assessment Engine**  |
| **Insifa M.F** | `CT/2021/075` | **Discussion Forum**  |
| **Thennakoon T M B M** | `CT/2021/057` | **Reviews, Ratings & Analytics Dashboard**  |

---

## 📝 System Description
**Learnify** is a comprehensive, full-stack Learning Management System (LMS) designed to facilitate learning for students, course management for instructors, and overall platform administration.

The application offers a hierarchical curriculum builder where instructors can design courses, add modules, and upload lessons. Students can discover and enroll in courses, track their learning progress, test their knowledge with auto-graded quizzes, participate in course-specific discussion forums, and leave ratings/reviews. It provides a robust, role-based user experience built with clean, modern component architectures.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite), Bootstrap 5, Bootstrap Icons, React Router, React Inline Styles
* **Backend:** Flask (Python REST API), Flask-CORS
* **Database & Auth:** Supabase (PostgreSQL), Supabase Authentication
* **Collaboration & Tools:** Git, GitHub, VS Code Live Share (for peer programming), Postman

---

## 🎯 Main Features & Responsibilities

### 1. Course & Lesson Management (Abeywardhana H H A P - CT/2021/072)
* **Course CRUD Operations:** Full creation, reading, updating, and deletion of courses, modules, and lessons.
* **Hierarchical Nesting:** Relational structure managing Courses ➔ Modules ➔ Lessons.
* **Student Dashboard:** View of course catalog, search bar, filters, and access to learning content.
* **Instructor Dashboard:** Dedicated console for instructors to create courses, add modules/lessons, and manage drafts.

### 2. Student Enrollment & Progress (Srirajitha.S - CT/2021/047)
* **Course Registration:** Secure student enrollment and unenrollment endpoints.
* **Progress Tracking:** Interactive marking of lessons as completed/uncompleted.
* **Progress Percentages:** Real-time calculation and visualization of student progress rates per course.

### 3. Quiz & Assessment Engine (Lathinka R W I - CT/2021/066)
* **Auto-Grading Framework:** Assessment interface checking and scoring multiple-choice quizzes dynamically.
* **Interactive Taking View:** Quiz-taking panel equipped with score calculators and submission trackers.
* **Submissions Logging:** History of student performance trends and submission timestamps.

### 4. Discussion Forum (Insifa M.F - CT/2021/075)
* **Course Forums:** Context-sensitive message boards linked directly to courses.
* **Q&A Interaction:** Functionality for students and instructors to open threads and add replies.
* **Moderation:** Post timestamps, user information displays, and delete capabilities for clean boards.

### 5. Reviews, Ratings & Analytics Dashboard (Thennakoon T M B M - CT/2021/057)
* **User Authentication:** Secure signup and signin using Supabase Authentication, including user role allocation (student, instructor, admin).
* **Feedback Systems:** Student ratings (1–5 scale stars) and written course reviews.
* **Admin Dashboard:** Control dashboard displaying platform metrics, user lists, and instructor application approvals.
* **Analytics Dashboards:** Informative dashboards equipped with structured metrics to display total student enrollments, average course ratings, and progress metrics.

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v16 or higher)
* **Python** (v3.8 or higher)
* **npm** or **yarn**

---

### Step 1: Set up the Backend (Flask + Supabase)

1. Navigate to the backend directory:
   
```bash
   cd backend
```

2. Create and activate a Python virtual environment:

```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a *.env* file inside the *backend* directory and add your credentials:

```env
FLASK_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-secret-key
```

5. Initialize the database schema by importing the SQL script located in: 


* **docs/POSTGRES_DATABASE_SCHEMA.sql** into the Supabase SQL editor.

---

### Step 2: Set up the Frontend (React + Vite)

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install npm packages:

```bash
npm install
```

3. Create a *.env* file inside the *frontend* directory and define the backend connection URL:

```env
VITE_API_URL=http://localhost:5000/api
```
---

## 🚀 How to Run the Application

To run the full-stack system, you must start both the backend and frontend servers simultaneously.

### Running Backend:

1. Ensure your virtual environment is active (venv).
2. Run the application script:

```bash
python app.py
```

3. The server starts at http://localhost:5000.

### Running Frontend:

1. From the frontend directory:

```bash
npm run dev
```

2. Open your browser and access the app at http://localhost:5173.

---

## 📊 GitHub Contribution Summary
To view the contribution history and commit records of our group members:

* View the visual timeline of branch activity and merges: [GitHub Network Graph](https://github.com/Abhey518/Learnify-e-learning-platform/network)

* Visit the Contributors summary page: [GitHub Contributors Graph](https://github.com/Abhey518/Learnify-e-learning-platform/graphs/contributors)

* Or execute this command in your terminal to see a summary list of commits by author:

```bash
git shortlog -sn
```
---

Last Updated: July 2026
