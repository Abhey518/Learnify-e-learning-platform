from core.supabase_client import supabase


class EnrollmentService:
    def __init__(self):
        self.supabase = supabase

    def get_user_enrollments(self, user_id):
        # Get all courses user is enrolled in
        pass

    def enroll_user(self, user_id, course_id):
        # Enroll user in a course
        pass

    def unenroll_user(self, enrollment_id):
        # Unenroll user from course
        pass
