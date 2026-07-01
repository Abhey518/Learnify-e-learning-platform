from flask import Blueprint, request, jsonify
from .services import CourseService
from .validators import validate_course

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')
course_service = CourseService() #initialize the service class

# Retrieve all courses
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


# Retrieve a specific course by ID
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


# Create a new course
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
        

# Update course
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
    

# Delete course
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
