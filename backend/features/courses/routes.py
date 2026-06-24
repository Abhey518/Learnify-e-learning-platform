from flask import Blueprint, request, jsonify
from .services import CourseService
from .validators import validate_course

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@courses_bp.route('', methods=['GET'])
def get_courses():
    # Get all courses
    pass

@courses_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id):
    # Get specific course
    pass

@courses_bp.route('', methods=['POST'])
def create_course():
    # Create new course
    pass

@courses_bp.route('/<course_id>', methods=['PUT'])
def update_course(course_id):
    # Update course
    pass

@courses_bp.route('/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    # Delete course
    pass
