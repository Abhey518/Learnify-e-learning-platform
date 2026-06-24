from flask import Blueprint, request, jsonify
from .services import EnrollmentService

enrollment_bp = Blueprint('enrollment', __name__, url_prefix='/api/enrollment')

@enrollment_bp.route('', methods=['GET'])
def get_enrollments():
    # Get user enrollments
    pass

@enrollment_bp.route('', methods=['POST'])
def enroll_course():
    # Enroll in a course
    pass

@enrollment_bp.route('/<enrollment_id>', methods=['DELETE'])
def unenroll(enrollment_id):
    # Unenroll from course
    pass
