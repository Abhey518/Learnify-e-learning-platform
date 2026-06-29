from flask import Blueprint, request, jsonify
from .services import CourseService
from .validators import validate_course

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')
course_service = CourseService() #initialize the service class

# Fetch the courses using the service
@courses_bp.route('', methods=['GET'])
def get_courses():
    try:
        courses = course_service.get_all_courses()
        return jsonify(courses), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Get specific course
@courses_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id):
    try:
        course = course_service.get_course_by_id(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        return jsonify(course[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Create new course
@courses_bp.route('', methods=['POST'])
def create_course():
    try:
        # Check if JSON data was sent
        course_data = request.get_json(silent=True)

        if not course_data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # Validate required fields
        if not validate_course(course_data):
            return jsonify({"error": "Missing required fields: title, description, or instructor_id"}), 400
        
        # If valid, proceed to insert in database
        course = course_service.create_course(course_data)
        if course:
            return jsonify(course[0]), 201
        
        return jsonify({"error": "Failed to create course"}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        

@courses_bp.route('/<course_id>', methods=['PUT'])
def update_course(course_id):
    # Update course
    pass

@courses_bp.route('/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    # Delete course
    pass
