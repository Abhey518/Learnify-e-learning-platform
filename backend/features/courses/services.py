from ...core.supabase_client import get_supabase_client

class CourseService:
    def __init__(self):
        self.supabase = get_supabase_client()

    def get_all_courses(self):
        # Fetch all courses from database
        pass

    def get_course_by_id(self, course_id):
        # Fetch course by ID
        pass

    def create_course(self, course_data):
        # Create new course
        pass

    def update_course(self, course_id, course_data):
        # Update course
        pass

    def delete_course(self, course_id):
        # Delete course
        pass
