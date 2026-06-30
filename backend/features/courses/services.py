from core.supabase_client import get_supabase_client

class CourseService:
    def __init__(self):
        self.supabase = get_supabase_client()

    # Fetch all courses from the "courses" table in Supabase
    def get_all_courses(self):
        
        response = self.supabase.table('courses').select('*').execute()
        return response.data

    # Fetch course by ID
    def get_course_by_id(self, course_id):
       
       response = self.supabase.table('courses').select('*').eq('id', course_id).execute()
       return response.data

    # Create new course
    def create_course(self, course_data):
        
        response = self.supabase.table('courses').insert(course_data).execute()
        return response.data

    # Update course
    def update_course(self, course_id, course_data):
        
        response = self.supabase.table("courses").update(course_data).eq("id", course_id).execute()
        return response.data

    def delete_course(self, course_id):
        # Delete course
        pass
