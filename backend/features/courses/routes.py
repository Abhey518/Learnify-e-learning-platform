from flask import Blueprint, request, jsonify
from .services import CourseService

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')
course_service = CourseService() #initialize the service class

# Retrieve all courses (Public)
@courses_bp.route('', methods=['GET'])
def get_courses():
    try:
        # Get optional instructor ID query parameter
        instructor_id = request.args.get('instructor_id')

        # Fetch courses from service
        courses = course_service.get_all_courses(instructor_id=instructor_id)

        # Return list of courses
        return jsonify(courses), 200

    except Exception as e:
        return jsonify({"error":str(e)}), 500


# Retrieve a specific course by ID (Public)
@courses_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id):
    try:
        # Get optional instructor ID query parameter
        instructor_id = request.args.get('instructor_id')

        # Fetch course from service
        course = course_service.get_course_by_id(course_id, instructor_id=instructor_id)

        # Handle course not found
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        # Return single course object
        return jsonify(course[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Create a new course (Instructor Only)
@courses_bp.route('', methods=['POST'])
def create_course():
    try:
        # Get JSON request body
        course_data = request.get_json(silent=True)

        # Handle empty request body
        if not course_data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # Validate required fields
        from .validators import validate_course

        if not validate_course(course_data):
            return jsonify({"error": "Missing required fields: title, description, or instructor_id"}), 400
        
        # Create course using service
        course = course_service.create_course(course_data)

        # Return created course object
        if course:
            return jsonify(course[0]), 201
        
        # Handle course creation failure
        return jsonify({"error": "Failed to create course"}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        

# Update course (Instructor Only)
@courses_bp.route('/<course_id>', methods=['PUT'])
def update_course(course_id):
    try:
        # Get JSON request body
        course_data = request.get_json(silent=True)

        # Handle empty request body
        if not course_data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # Validate modification fields
        from .validators import validate_course_update

        if not validate_course_update(course_data):
            return jsonify({"error": "No fields provided to update"}), 400
        
        # Update course using service
        updated_course = course_service.update_course(course_id, course_data)

        # Return updated course object
        if updated_course:
            return jsonify(updated_course[0]), 200
        
        # Handle course not found
        return jsonify({"error": "Failed to update course. Course not found"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Delete course (Instructor Only)
@courses_bp.route('/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        # Delete course using service
        course = course_service.delete_course(course_id)
        
        # Return success message
        if course:
            return jsonify({"message": "Course deleted successfully"}), 200
            
        # Handle course not found
        return jsonify({"error": "Course not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Create a new module (Instructor Only)
@courses_bp.route('/modules', methods=['POST'])
def create_module():
    try:
        # Get JSON request body
        module_data = request.get_json(silent=True)

        # Handle empty request body
        if not module_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate required fields
        from .validators import validate_module

        if not validate_module(module_data):
            return jsonify({"error": "Missing required fields: course_id, title, or order_no"}), 400
        
        # Create module using service
        module = course_service.create_module(module_data)

        # Return created module object
        if module:
            return jsonify(module[0]), 201

        # Handle module creation failure
        return jsonify({"error": "Failed to create module"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Retrieve all modules for a course (Public)
@courses_bp.route('/<course_id>/modules', methods=['GET'])
def get_course_modules(course_id):
    try:
        # Get optional instructor ID query parameter
        instructor_id = request.args.get('instructor_id')

        # Verify course is accessible to the caller
        course = course_service.get_course_by_id(course_id, instructor_id=instructor_id)

        # Handle course not found or not published
        if not course:
            return jsonify({"error": "Course not found"}), 404

        # Fetch modules from service
        modules = course_service.get_modules_by_course(course_id)

        # Return list of modules
        return jsonify(modules), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Modify an existing module by ID (Instructor Only)
@courses_bp.route('/modules/<module_id>', methods=['PUT'])
def update_module(module_id):
    try:
        # Get JSON request body
        module_data = request.get_json(silent=True)

        # Handle empty request body
        if not module_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate modification fields
        from .validators import validate_module_update

        if not validate_module_update(module_data):
            return jsonify({"error": "No fields provided to update"}), 400

        # Update module using service
        module = course_service.update_module(module_id, module_data)

        # Return updated module object
        if module:
            return jsonify(module[0]), 200

        # Handle module not found
        return jsonify({"error": "Module not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Delete a module by ID (Instructor Only)
@courses_bp.route('/modules/<module_id>', methods=['DELETE'])
def delete_module(module_id):
    try:
        # Delete module using service
        module = course_service.delete_module(module_id)

        # Return success message
        if module:
            return jsonify({"message": "Module deleted successfully"}), 200

        # Handle module not found
        return jsonify({"error": "Module not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Create a new lesson (Instructor Only)
@courses_bp.route('/lessons', methods=['POST'])
def create_lesson():
    try:
        # Get JSON request body
        lesson_data = request.get_json(silent=True)

        # Handle empty request body
        if not lesson_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate required fields
        from .validators import validate_lesson

        if not validate_lesson(lesson_data):
            return jsonify({"error": "Missing required fields: module_id, title, or order_no"}), 400

        # Create lesson using service
        lesson = course_service.create_lesson(lesson_data)

        # Return created lesson object
        if lesson:
            return jsonify(lesson[0]), 201

        # Handle lesson creation failure
        return jsonify({"error": "Failed to create lesson"}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Retrieve all lessons for a module (Enrolled Students or Instructor)
@courses_bp.route('/modules/<module_id>/lessons', methods=['GET'])
def get_module_lessons(module_id):
    try:
        # Get optional instructor ID query parameter
        instructor_id = request.args.get('instructor_id')

        # Get student ID query parameter
        student_id = request.args.get('student_id')

        # Fetch module details using service
        module = course_service.get_module_by_id(module_id)

        # Handle module not found
        if not module:
            return jsonify({"error": "Module not found"}), 404

        # Extract course ID from module
        course_id = module[0]["course_id"]

        # Fetch course details using service
        course = course_service.get_course_by_id(course_id, instructor_id=instructor_id)
        
        # Handle course not found
        if not course:
            return jsonify({"error": "Course not found"}), 404

        # Check if the requester is the course instructor
        is_instructor = instructor_id and str(instructor_id) == str(course[0]["instructor_id"])
        
        # If the requester is not the course instructor, verify student enrollment
        if not is_instructor:
            if not student_id:
                return jsonify({"error": "Access Denied. Student ID is required."}), 403

            # Check if the student has an active enrollment
            enrollment = course_service.check_enrollment(student_id, course_id)
            if not enrollment:
                return jsonify({"error": "Access Denied. You must be enrolled to view lessons."}), 403

        # Fetch lessons metadata from service
        lessons = course_service.get_lessons_by_module(module_id)

        # Return list of lessons
        return jsonify(lessons), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Modify an existing lesson by ID (Instructor Only)
@courses_bp.route('/lessons/<lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    try:
        # Get JSON request body
        lesson_data = request.get_json(silent=True)

        # Handle empty request body
        if not lesson_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate modification fields
        from .validators import validate_lesson_update

        if not validate_lesson_update(lesson_data):
            return jsonify({"error": "No fields provided to update"}), 400

        # Update lesson using service
        lesson = course_service.update_lesson(lesson_id, lesson_data)

        # Return updated lesson object
        if lesson:
            return jsonify(lesson[0]), 200

        # Handle lesson not found
        return jsonify({"error": "Lesson not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    