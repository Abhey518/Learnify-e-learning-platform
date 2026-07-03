from core.supabase_client import get_supabase_client

class EnrollmentService:
    def __init__(self):
        self.supabase = get_supabase_client()

    # FR-2.1: Get Course Catalog
    def get_catalog(self):
        response = self.supabase.table("courses").select("*").execute()
        return response.data
    
    # FR-2.2: Enroll student in a course
    def enroll_user(self, student_id, course_id):
        # 1. Check if already enrolled (fixed: user_id -> student_id)
        existing = self.supabase.table("enrollments") \
            .select("*") \
            .eq("student_id", student_id) \
            .eq("course_id", course_id) \
            .execute()

        if existing.data:
            raise ValueError("Already enrolled in this course")
        
        # 2. Insert new enrollment (fixed: user_id -> student_id, removed 'status')
        response = self.supabase.table("enrollments") \
            .insert({
                "student_id": student_id,
                "course_id": course_id
            }) \
            .execute()
        return response.data

        
 # FR-2.3: Unenroll student from course
    def unenroll_user(self, enrollment_id):
        response = self.supabase.table("enrollments") \
            .delete() \
            .eq("id", enrollment_id) \
            .execute()
        return response.data

# FR-2.4: Fetch Secure Lesson Contents
    def get_lesson_content(self, student_id, lesson_id):
        # 1. Look up the lesson to get its parent module (avoiding .single() crash)
        lesson_res = self.supabase.table("lessons").select("*").eq("id", lesson_id).execute()
        if not lesson_res.data:
            return None
        
        lesson = lesson_res.data[0]
        module_id = lesson["module_id"]
        
        # 2. Look up the module to get the target course_id
        module_res = self.supabase.table("modules").select("course_id").eq("id", module_id).execute()
        if not module_res.data:
            return None
            
        course_id = module_res.data[0]["course_id"]

        # 3. Verify enrollment authorization
        enroll_check = self.supabase.table("enrollments") \
            .select("id") \
            .eq("student_id", student_id) \
            .eq("course_id", course_id) \
            .execute()

        if not enroll_check.data:
            raise PermissionError("Access Denied. You are not enrolled in this course.")

        return lesson


         # FR-2.5: Progress Tracking State Management (Upsert)
    def track_progress(self, student_id, lesson_id, is_completed):
        # Using upsert matching the database unique constraint
        response = self.supabase.table("student_progress").upsert({
            "student_id": student_id,
            "lesson_id": lesson_id,
            "is_completed": is_completed
        }, on_conflict="student_id, lesson_id").execute()
        return response.data


         # FR-2.6: Calculate overall progress and module-wise progress breakdown
    def calculate_course_progress(self, student_id, course_id):
        # 1. Fetch all modules in this course
        modules_res = self.supabase.table("modules") \
            .select("id, title") \
            .eq("course_id", course_id) \
            .execute()
        modules = modules_res.data or []
        # 2. Fetch all lessons belonging to these modules
        module_ids = [m["id"] for m in modules]
        lessons = []
        if module_ids:
            lessons_res = self.supabase.table("lessons") \
                .select("id, module_id") \
                .in_("module_id", module_ids) \
                .execute()
            lessons = lessons_res.data or []
        # 3. Fetch completed lessons for this student
        lesson_ids = [l["id"] for l in lessons]
        completed_lesson_ids = set()
        if lesson_ids:
            progress_res = self.supabase.table("student_progress") \
                .select("lesson_id") \
                .eq("student_id", student_id) \
                .eq("is_completed", True) \
                .in_("lesson_id", lesson_ids) \
                .execute()
            completed_lesson_ids = {row["lesson_id"] for row in (progress_res.data or [])}
        # 4. Calculate module completion breakdown
        module_progress = []
        for module in modules:
            module_lessons = [l for l in lessons if l["module_id"] == module["id"]]
            total_module_lessons = len(module_lessons)
            completed_module_lessons = sum(1 for l in module_lessons if l["id"] in completed_lesson_ids)
            progress_percentage = (completed_module_lessons / total_module_lessons * 100) if total_module_lessons > 0 else 0
            is_completed = (completed_module_lessons == total_module_lessons) if total_module_lessons > 0 else False
            module_progress.append({
                "module_id": module["id"],
                "module_title": module["title"],
                "completed_lessons": completed_module_lessons,
                "total_lessons": total_module_lessons,
                "progress_percentage": round(progress_percentage, 2),
                "is_completed": is_completed
            })
        # 5. Fetch all quizzes in this course
        quizzes_res = self.supabase.table("quizzes") \
            .select("id") \
            .eq("course_id", course_id) \
            .execute()
        quizzes = quizzes_res.data or []
        # 6. Fetch unique quizzes the student has a score for
        quiz_ids = [q["id"] for q in quizzes]
        completed_quizzes_count = 0
        if quiz_ids:
            scores_res = self.supabase.table("quiz_scores") \
                .select("quiz_id, score") \
                .eq("student_id", student_id) \
                .in_("quiz_id", quiz_ids) \
                .execute()
            completed_quiz_ids = {row["quiz_id"] for row in (scores_res.data or []) if row.get("score") is not None}
            completed_quizzes_count = len(completed_quiz_ids)
        # 7. Overall calculations
        total_lessons = len(lessons)
        completed_lessons = len(completed_lesson_ids)
        total_quizzes = len(quizzes)
        total_course_items = total_lessons + total_quizzes
        completed_course_items = completed_lessons + completed_quizzes_count
        overall_progress = (completed_course_items / total_course_items * 100) if total_course_items > 0 else 0
        course_completed = (completed_course_items == total_course_items) if total_course_items > 0 else False
        return {
            "overall_progress_percentage": round(overall_progress, 2),
            "course_completed": course_completed,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "total_quizzes": total_quizzes,
            "completed_quizzes": completed_quizzes_count,
            "modules": module_progress
        }