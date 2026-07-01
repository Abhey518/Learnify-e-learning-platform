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
