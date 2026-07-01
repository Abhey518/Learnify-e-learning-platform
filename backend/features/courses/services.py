from core.supabase_client import get_supabase_client

class CourseService:
    def __init__(self):
        self.supabase = get_supabase_client()

    # Fetch all courses
    def get_all_courses(self, instructor_id=None):
        
        # Initialize base query
        query = self.supabase.table("courses").select("*")

        # Apply filters based on request context
        # For Instructor -> Get all courses (draft or published)
        if instructor_id:
            query = query.eq("instructor_id", instructor_id)

        # For Student -> Get only published courses
        else:
            query = query.eq("is_published", True)

        response = query.execute()
        return response.data


    # Fetch course by ID
    def get_course_by_id(self, course_id):
       
       # Run a select query filtered by course ID
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
