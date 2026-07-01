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


    # Fetch a single course by its unique ID
    def get_course_by_id(self, course_id, instructor_id=None):
       
        # Initialize base query
        query = self.supabase.table("courses").select("*").eq("id", course_id)

        # Apply filters based on request context
        # For Instructor -> Get course (draft or published)
        if instructor_id:
            query = query.eq("instructor_id", instructor_id)

        # For Student -> Get only published course
        else:
            query = query.eq("is_published", True)

        response = query.execute()
        return response.data

       
    # Create a new course
    def create_course(self, course_data):

        # Insert a new course into the database
        response = self.supabase.table("courses").insert(course_data).execute()
        return response.data
    

    # Update a course by its unique ID
    def update_course(self, course_id, course_data):

        # Update an existing course in the database 
        # Course publication -> Change visibility to student
        # Course update -> Change course metadata
        response = self.supabase.table("courses").update(course_data).eq("id", course_id).execute()
        return response.data


    # Delete a course by ID
    def delete_course(self, course_id):

        # Delete an existing course from the database
        response = self.supabase.table("courses").delete().eq("id", course_id).execute()
        return response.data
    

    # Create a new module
    def create_module(self, module_data):

        # Insert a new module into the database
        # For Instructor
        response = self.supabase.table("modules").insert(module_data).execute()
        return response.data
       

    # Fetch all modules for a course
    def get_modules_by_course(self, course_id):

        # Fetch all modules of a course from the database
        response = self.supabase.table("modules").select("*").eq("course_id", course_id).order("order_no").execute()
        return response.data
    

    # Update a module by ID
    def update_module(self, module_id, module_data):

        # Update an existing module in the database
        # For Instructor
        response = self.supabase.table("modules").update(module_data).eq("id", module_id).execute()
        return response.data
    

    # Delete a module by ID
    def delete_module(self, module_id):

        # Delete an existing module from the database
        # For Instructor
        response = self.supabase.table("modules").delete().eq("id", module_id).execute()
        return response.data
    

    # Create a new lesson
    def create_lesson(self, lesson_data):

        # Insert a new lesson into the database
        # For Instructor
        response = self.supabase.table("lessons").insert(lesson_data).execute()
        return response.data
    

    # Fetch all lessons for a module
    def get_lessons_by_module(self, module_id):
        
        # Fetch lesson metadata only from the database
        # For enrolled students or instructor
        response = self.supabase.table("lessons").select("id, title, module_id, order_no").eq("module_id", module_id).order("order_no").execute()
        return response.data

    
    # Fetch a single module by ID
    def get_module_by_id(self, module_id):

        # Fetch module details from the database
        response = self.supabase.table("modules").select("*").eq("id", module_id).execute()
        return response.data


    # Check student enrollment in a course
    def check_enrollment(self, student_id, course_id):

        # Fetch enrollment record from the database
        response = self.supabase.table("enrollments").select("*").eq("student_id", student_id).eq("course_id", course_id).execute()
        return response.data