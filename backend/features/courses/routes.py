from flask import Blueprint, request, jsonify
from .services import CourseService
from .validators import validate_course

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