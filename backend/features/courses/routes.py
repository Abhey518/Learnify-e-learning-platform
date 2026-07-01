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
        

# Update course
@courses_bp.route('/<course_id>', methods=['PUT'])
def update_course(course_id):
    try:
        # Check if JSON data was sent
        course_data = request.get_json(silent=True)

        if not course_data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # Validate required fields
        from .validators import validate_course_update

        if not validate_course_update(course_data):
            return jsonify({"error": "No fields provided to update"}), 400
        
        # If valid, proceed to update in database
        updated_course = course_service.update_course(course_id, course_data)

        if updated_course:
            return jsonify(updated_course[0]), 200
        
        # If course was not found in the DB
        return jsonify({"error": "Failed to update course. Course not found"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Delete course
@courses_bp.route('/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    
    pass
