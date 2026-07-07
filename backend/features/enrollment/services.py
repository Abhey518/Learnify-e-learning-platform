from core.supabase_client import supabase

class EnrollmentService:
    def __init__(self):
        self.supabase = supabase

    

    def get_catalog_with_status(self, student_id=None):
        # Fetch all available courses
        courses_res = self.supabase.table("courses").select("*").eq("is_published", True).execute()
        courses = courses_res.data or []
        
        # If no student session is active, default all status checks to False
        if not student_id:
            for course in courses:
                course["is_enrolled"] = False
            return courses

        # Fetch all current student enrollments
        enroll_res = self.supabase.table("enrollments") \
            .select("course_id") \
            .eq("student_id", student_id) \
            .execute()
        
        enrolled_ids = {row["course_id"] for row in (enroll_res.data or [])}
        
        # Map the is_enrolled boolean flag dynamically into each catalog card object
        for course in courses:
            course["is_enrolled"] = course["id"] in enrolled_ids
            
        return courses
    
    # FR-2.2: Enroll student in a course
    def enroll_user(self, student_id, course_id):
        # Check if already enrolled (fixed: user_id -> student_id)
        existing = self.supabase.table("enrollments") \
            .select("*") \
            .eq("student_id", student_id) \
            .eq("course_id", course_id) \
            .execute()

        if existing.data:
            raise ValueError("Already enrolled in this course")
        
        # Insert new enrollment (fixed: user_id -> student_id, removed 'status')
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
        # Look up the lesson to get its parent module (avoiding .single() crash)
        lesson_res = self.supabase.table("lessons").select("*").eq("id", lesson_id).execute()
        if not lesson_res.data:
            return None
        
        lesson = lesson_res.data[0]
        module_id = lesson["module_id"]
        
        # Look up the module to get the target course_id
        module_res = self.supabase.table("modules").select("course_id").eq("id", module_id).execute()
        if not module_res.data:
            return None
            
        course_id = module_res.data[0]["course_id"]

        # Verify enrollment authorization
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
        try:
            student_id_str = str(student_id)

            # Fetch all modules in this course
            modules_res = self.supabase.table("modules") \
                .select("id, title") \
                .eq("course_id", course_id) \
                .execute()
            modules = modules_res.data or []
            
            # Fetch all lessons belonging to these modules
            module_ids = [m["id"] for m in modules]
            lessons = []
            if module_ids:
                lessons_res = self.supabase.table("lessons") \
                    .select("id, module_id") \
                    .in_("module_id", module_ids) \
                    .execute()
                lessons = lessons_res.data or []
                
            # Fetch completed lessons for this student
            lesson_ids = [l["id"] for l in lessons]
            completed_lesson_ids = set()
            
            if lesson_ids:
                progress_res = self.supabase.table("student_progress") \
                    .select("lesson_id") \
                    .eq("student_id", student_id_str) \
                    .eq("is_completed", True) \
                    .in_("lesson_id", lesson_ids) \
                    .execute()
                completed_lesson_ids = {row["lesson_id"] for row in (progress_res.data or [])}

            # Fetch all quizzes in this course
            quizzes_res = self.supabase.table("quizzes") \
                .select("id, module_id") \
                .eq("course_id", course_id) \
                .execute()
            quizzes = quizzes_res.data or []
            
            # Fetch unique quizzes the student has a score for
            quiz_ids = [q["id"] for q in quizzes]
            completed_quiz_ids = set()
            

            if quiz_ids:
                scores_res = self.supabase.table("quiz_scores") \
                    .select("quiz_id, score") \
                    .eq("student_id", student_id_str) \
                    .in_("quiz_id", quiz_ids) \
                    .execute()
                completed_quiz_ids = {row["quiz_id"] for row in (scores_res.data or []) if row.get("score") is not None}
                
            # Calculate module completion breakdown
            module_progress = []
            for module in modules:
                module_lessons = [l for l in lessons if l["module_id"] == module["id"]]
                module_quizzes = [q for q in quizzes if q["module_id"] == module["id"]]
                
                total_items = len(module_lessons) + len(module_quizzes)
                completed_items = (
                    sum(1 for l in module_lessons if l["id"] in completed_lesson_ids) +
                    sum(1 for q in module_quizzes if q["id"] in completed_quiz_ids)
                )
                
                progress_percentage = (completed_items / total_items * 100) if total_items > 0 else 0
                is_completed = (completed_items == total_items) if total_items > 0 else False
                
                module_progress.append({
                    "module_id": module["id"],
                    "module_title": module["title"],
                    "completed_lessons": sum(1 for l in module_lessons if l["id"] in completed_lesson_ids),
                    "total_lessons": len(module_lessons),
                    "completed_quizzes": sum(1 for q in module_quizzes if q["id"] in completed_quiz_ids),
                    "total_quizzes": len(module_quizzes),
                    "progress_percentage": round(progress_percentage, 2),
                    "is_completed": is_completed
                })
                
            # Overall calculations
            total_lessons = len(lessons)
            completed_lessons = len(completed_lesson_ids)
            total_quizzes = len(quizzes)
            completed_quizzes_count = len(completed_quiz_ids)
            
            total_course_items = total_lessons + total_quizzes
            completed_course_items = completed_lessons + completed_quizzes_count
            
            overall_progress = (completed_course_items / total_course_items * 100) if total_course_items > 0 else 0
            course_completed = (completed_course_items == total_course_items) if total_course_items > 0 else False
            
            return {
                "overall_progress_percentage": round(overall_progress, 2),
                "course_completed": course_completed,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "completed_lesson_ids": list(completed_lesson_ids), 
                "total_quizzes": total_quizzes,
                "completed_quizzes": completed_quizzes_count,
                "completed_quiz_ids": list(completed_quiz_ids),
                "modules": module_progress
            }
        except Exception as e:
            import traceback
            print(f"Server error captured inside calculation service:\n{traceback.format_exc()}")
            return {
                "overall_progress_percentage": 0,
                "course_completed": False,
                "total_lessons": 0,
                "completed_lessons": 0,
                "total_quizzes": 0,
                "completed_quizzes": 0,
                "modules": []
            }
