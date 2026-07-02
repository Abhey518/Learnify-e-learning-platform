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