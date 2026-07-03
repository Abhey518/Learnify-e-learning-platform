from flask import Blueprint, request, jsonify, session
from core.decorators import login_required, role_required
from .services import CourseService

from .validators import (
    validate_course,
    validate_course_update,
    validate_module,
    validate_module_update,
    validate_lesson,
    validate_lesson_update,
)

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')
course_service = CourseService() #initialize the service class


# Helper function to get user context
def _actor_context():
    user_id = session.get('user_id')
    user_role = session.get('user_role')
    instructor_id = user_id if user_role == 'instructor' else None
    return user_id, user_role, instructor_id

# Retrieve all courses (Public)
@courses_bp.route('', methods=['GET'])
def get_courses():
    try:
        # Get user context
        _, _, instructor_id = _actor_context()

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
        # Get user context
        _, _, instructor_id = _actor_context()

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
@role_required(['instructor'])
def create_course():
    try:
        # Get JSON request body
        course_data = request.get_json(silent=True)

        # Handle empty request body
        if not course_data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # Inject authenticated instructor ID into the payload
        course_data['instructor_id'] = session.get('user_id')
        
        # Validate required fields
        if not validate_course(course_data):
            return jsonify({"error": "Missing required fields: title or description"}), 400
        
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
@role_required(['instructor'])
def update_course(course_id):
    try:
        # Verify instructor ownership before applying changes
        if not course_service.is_course_owner(course_id, session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can modify only owned courses."}), 403

        # Get JSON request body
        course_data = request.get_json(silent=True)

        # Handle empty request body
        if not course_data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # Validate modification fields
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
@role_required(['instructor'])
def delete_course(course_id):
    try:
        # Verify instructor ownership before removal
        if not course_service.is_course_owner(course_id, session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can remove only owned courses."}), 403

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
@role_required(['instructor'])
def create_module():
    try:
        # Get JSON request body
        module_data = request.get_json(silent=True)

        # Handle empty request body
        if not module_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate required fields
        if not validate_module(module_data):
            return jsonify({"error": "Missing required fields: course_id, title, or order_no"}), 400
        
        # Verify instructor ownership before creation
        if not course_service.is_course_owner(module_data['course_id'], session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can create modules only under owned courses."}), 403
        
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
        # Get user context
        _, _, instructor_id = _actor_context()

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
@role_required(['instructor'])
def update_module(module_id):
    try:
        # Get module details
        module = course_service.get_module_by_id(module_id)
        if not module:
            return jsonify({"error": "Module not found"}), 404
        
        # Verify instructor ownership before modification
        if not course_service.is_course_owner(module[0]['course_id'], session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can modify only owned modules."}), 403

        # Get JSON request body
        module_data = request.get_json(silent=True)

        # Handle empty request body
        if not module_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate modification fields
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
@role_required(['instructor'])
def delete_module(module_id):
    try:
        # Get module details
        module = course_service.get_module_by_id(module_id)
        if not module:
            return jsonify({"error": "Module not found"}), 404

        # Verify instructor ownership before deletion
        if not course_service.is_course_owner(module[0]['course_id'], session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can delete only owned modules."}), 403

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
@role_required(['instructor'])
def create_lesson():
    try:
        # Get JSON request body
        lesson_data = request.get_json(silent=True)

        # Handle empty request body
        if not lesson_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate required fields
        if not validate_lesson(lesson_data):
            return jsonify({"error": "Missing required fields: module_id, title, or order_no"}), 400
        
         # Verify module ownership before creation
        module = course_service.get_module_by_id(lesson_data['module_id'])
        if not module:
            return jsonify({"error": "Module not found"}), 404
        
        if not course_service.is_course_owner(module[0]['course_id'], session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can create lessons only under owned modules."}), 403

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
@login_required
def get_module_lessons(module_id):
    try:
        # Get user context from session
        user_id, user_role, _ = _actor_context()

        # Fetch module details using service
        module = course_service.get_module_by_id(module_id)

        # Handle module not found
        if not module:
            return jsonify({"error": "Module not found"}), 404

        # Extract course ID from module
        course_id = module[0]["course_id"]

        # Fetch course details using service
        course = course_service.get_course_by_id(course_id, instructor_id=user_id if user_role == 'instructor' else None)
        
        # Handle course not found
        if not course:
            return jsonify({"error": "Course not found"}), 404

        # Check if the requester is the course instructor
        is_instructor = user_role == 'instructor' and str(user_id) == str(course[0]["instructor_id"])
        
        # If the requester is not the course instructor, verify student enrollment
        if not is_instructor:
            # Check if the student has an active enrollment
            enrollment = course_service.check_enrollment(user_id, course_id)
            if not enrollment:
                return jsonify({"error": "Access Denied. Enrollment in this course is required to view lessons."}), 403

        # Fetch lessons metadata from service
        lessons = course_service.get_lessons_by_module(module_id)

        # Return list of lessons
        return jsonify(lessons), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Modify an existing lesson by ID (Instructor Only)
@courses_bp.route('/lessons/<lesson_id>', methods=['PUT'])
@role_required(['instructor'])
def update_lesson(lesson_id):
    try:
        # Get lesson details
        lesson = course_service.get_lesson_by_id(lesson_id)
        if not lesson:
            return jsonify({"error": "Lesson not found"}), 404
        
        # Get module details
        module = course_service.get_module_by_id(lesson[0]['module_id'])
        if not module:
            return jsonify({"error": "Module not found"}), 404
        
        # Verify instructor ownership before modification
        if not course_service.is_course_owner(module[0]['course_id'], session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can modify only owned lessons."}), 403

        # Get JSON request body
        lesson_data = request.get_json(silent=True)

        # Handle empty request body
        if not lesson_data:
            return jsonify({"error": "Request body is empty"}), 400

        # Validate modification fields
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
    
    
# Delete a lesson by ID (Instructor Only)
@courses_bp.route('/lessons/<lesson_id>', methods=['DELETE'])
@role_required(['instructor'])
def delete_lesson(lesson_id):
    try:
        # Get lesson details
        lesson = course_service.get_lesson_by_id(lesson_id)
        if not lesson:
            return jsonify({"error": "Lesson not found"}), 404

        # Get module details
        module = course_service.get_module_by_id(lesson[0]['module_id'])
        if not module:
            return jsonify({"error": "Module not found"}), 404

        # Verify instructor ownership before removal
        if not course_service.is_course_owner(module[0]['course_id'], session.get('user_id')):
            return jsonify({"error": "Access Denied. Instructor can remove only owned lessons."}), 403

        # Delete lesson using service
        lesson = course_service.delete_lesson(lesson_id)

        # Return success message
        if lesson:
            return jsonify({"message": "Lesson deleted successfully"}), 200

        # Handle lesson not found
        return jsonify({"error": "Lesson not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    