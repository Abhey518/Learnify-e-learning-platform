
from flask import Blueprint, request, jsonify
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
    


# FR-2.2: Enroll Course
@enrollment_bp.route("", methods=["POST"])
def enroll_course():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        student_id = data.get("student_id")
        course_id = data.get("course_id")

        if not student_id or not course_id:
            return jsonify({"error": "Missing fields: student_id and course_id are required"}), 400

        result = enrollment_service.enroll_user(student_id, course_id)
        return jsonify({"message": "Enrollment successful", "data": result[0]}), 201

    except ValueError as ve:
        # Handles "Already enrolled" validation error cleanly
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    # FR-2.3: Unenroll
@enrollment_bp.route("/<enrollment_id>", methods=["DELETE"])
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
def get_lesson(lesson_id):
    try:
        student_id = request.args.get("student_id")
        if not student_id:
            return jsonify({"error": "student_id is required as a query parameter"}), 400

        result = enrollment_service.get_lesson_content(student_id, lesson_id)
        if result is None:
            return jsonify({"error": "Lesson not found"}), 404

        return jsonify({"success": True, "lesson": result}), 200

    except PermissionError as pe:
        # Handles "Access Denied" error cleanly
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# FR-2.5 & FR-2.6: Track Progress
@enrollment_bp.route("/progress", methods=["POST"])
def track_progress():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body is empty"}), 400
        student_id = data.get("student_id")
        lesson_id = data.get("lesson_id")
        is_completed = data.get("is_completed", True)
        if not student_id or not lesson_id:
            return jsonify({"error": "Missing fields: student_id and lesson_id are required"}), 400
        result = enrollment_service.track_progress(student_id, lesson_id, is_completed)
        return jsonify({"message": "Progress updated successfully", "data": result[0] if result else None}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# GET /api/enrollment/progress/<student_id>/course/<course_id>
@enrollment_bp.route("/progress/<student_id>/course/<course_id>", methods=["GET"])
def get_course_progress(student_id, course_id):
    try:
        progress = enrollment_service.calculate_course_progress(student_id, course_id)
        return jsonify({"success": True, "progress": progress}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
