
from flask import Blueprint, request, jsonify
from .services import EnrollmentService

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

        