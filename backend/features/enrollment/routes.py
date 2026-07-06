from flask import Blueprint, request, jsonify, session
from .services import EnrollmentService
from core.decorators import login_required, role_required

enrollment_bp = Blueprint(
    "enrollment",
    __name__,
    url_prefix="/api/enrollment"
)

enrollment_service = EnrollmentService()

# FR-2.1: Get Catalog
@enrollment_bp.route("/catalog", methods=["GET"])
def get_catalog():
    try:
        courses = enrollment_service.get_catalog()
        return jsonify({"success": True, "courses": courses}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# FR-2.2: Enroll Course (Secure)
@enrollment_bp.route("/enroll", methods=["POST"])
@login_required
@role_required(['student'])
def enroll_course():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        # SECURE: Extract student_id from active session, NOT from request payload
        student_id = session.get('user_id')
        course_id = data.get("course_id")

        if not course_id:
            return jsonify({"error": "Missing field: course_id is required"}), 400

        result = enrollment_service.enroll_user(student_id, course_id)
        return jsonify({"message": "Enrollment successful", "data": result[0]}), 201

    except ValueError as ve:
        # Handles "Already enrolled" validation error cleanly
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# FR-2.3: Unenroll (Secure)
@enrollment_bp.route("/<enrollment_id>", methods=["DELETE"])
@login_required
@role_required(['student'])
def unenroll(enrollment_id):
    try:
        result = enrollment_service.unenroll_user(enrollment_id)
        if not result:
            return jsonify({"error": "Enrollment record not found"}), 404
        return jsonify({"message": "Enrollment deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# FR-2.4: Fetch Secure Lesson Content
@enrollment_bp.route("/lessons/<lesson_id>", methods=["GET"])
@login_required
def get_lesson(lesson_id):
    try:
        # SECURE: Extract student_id from active session
        student_id = session.get('user_id')

        result = enrollment_service.get_lesson_content(student_id, lesson_id)
        if result is None:
            return jsonify({"error": "Lesson not found"}), 404

        return jsonify({"success": True, "lesson": result}), 200

    except PermissionError as pe:
        # Handles "Access Denied" error cleanly
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# FR-2.5 & FR-2.6: Track Progress (Secure)
@enrollment_bp.route("/progress", methods=["POST"])
@login_required
@role_required(['student'])
def track_progress():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body is empty"}), 400
        
        # SECURE: Extract student_id from active session
        student_id = session.get('user_id')
        lesson_id = data.get("lesson_id")
        is_completed = data.get("is_completed", True)
        
        if not lesson_id:
            return jsonify({"error": "Missing field: lesson_id is required"}), 400
            
        result = enrollment_service.track_progress(student_id, lesson_id, is_completed)
        return jsonify({"message": "Progress updated successfully", "data": result[0] if result else None}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Notice the route URL changed because we no longer need <student_id> in the path!
@enrollment_bp.route("/progress/course/<course_id>", methods=["GET"])
@login_required
@role_required(['student'])
def get_course_progress(course_id):
    try:
        student_id = session.get('user_id')
        result = enrollment_service.calculate_course_progress(student_id, course_id)
        return jsonify({"success": True, "progress": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
