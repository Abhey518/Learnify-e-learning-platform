
from flask import Blueprint, request, jsonify, session
from .services import EnrollmentService
from core.supabase_client import supabase


enrollment_bp = Blueprint(
    "enrollment",
    __name__,
    url_prefix="/api/enrollment"
)

enrollment_service = EnrollmentService()

# # FR-2.1: Get Catalog

@enrollment_bp.route("/catalog", methods=["GET"])
def get_catalog():
    try:
        user_id = session.get('user_id')
        # Pass the session user_id to compute custom enrollment status flags
        courses = enrollment_service.get_catalog_with_status(user_id)
        return jsonify({"success": True, "courses": courses}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# FR-2.2: Enroll Course

@enrollment_bp.route("", methods=["POST"])
def enroll_course():
    try:
        user_id = session.get('user_id')
        user_role = session.get('user_role')

        if not user_id:
            return jsonify({"error": "Unauthenticated: No active session found."}), 401

        if user_role != 'student':
            return jsonify({"error": "Access Denied: Log as a student is required."}), 403

        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        course_id = data.get("course_id")
        if not course_id:
            return jsonify({"error": "Missing fields: course_id is required"}), 400

        result = enrollment_service.enroll_user(user_id, course_id)
        
        # Guard check if result returned empty array or record mapping failures
        record = result[0] if (result and len(result) > 0) else {"student_id": user_id, "course_id": course_id}
        return jsonify({"message": "Enrollment successful", "data": record}), 201

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@enrollment_bp.route("/lessons/<lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    try:
        # Pull student identity directly out of session cookie to prevent spoofing
        user_id = session.get('user_id')
        user_role = session.get('user_role')

        if not user_id:
            return jsonify({"error": "Unauthenticated: No active session found."}), 401
        if user_role != 'student':
            return jsonify({"error": "Access Denied: Log as a student is required."}), 403

        # Pass secure user_id directly into your service tier execution
        result = enrollment_service.get_lesson_content(user_id, lesson_id)
        if result is None:
            return jsonify({"error": "Lesson not found"}), 404

        return jsonify({"success": True, "lesson": result}), 200

    except PermissionError as pe:
        return jsonify({"error": str(pe)}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# FR-2.5 & FR-2.6: Track Progress
@enrollment_bp.route("/progress", methods=["POST"])
def track_progress():
    try:
        
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Unauthenticated: No active session found."}), 401

        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body is empty"}), 400
            
        lesson_id = data.get("lesson_id")
        is_completed = data.get("is_completed", True)
        
        if not lesson_id:
            return jsonify({"error": "Missing fields: lesson_id is required"}), 400
            
        result = enrollment_service.track_progress(user_id, lesson_id, is_completed)
        return jsonify({"message": "Progress updated successfully", "data": result[0] if result else None}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

# GET /api/enrollment/progress/<student_id>/course/<course_id>

@enrollment_bp.route("/progress/session/course/<course_id>", methods=["GET"])
def get_course_progress(course_id):
    try:
        user_id = session.get('user_id')
        user_role = session.get('user_role')

        if not user_id:
            return jsonify({"error": "Unauthenticated: No active session found."}), 401
        if user_role != 'student':
            return jsonify({"error": "Access Denied: Log as a student is required."}), 403

        progress = enrollment_service.calculate_course_progress(user_id, course_id)
        return jsonify({"success": True, "progress": progress}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    



@enrollment_bp.route("/courses/<course_id>/workspace-setup", methods=["GET"])
def get_full_workspace_setup(course_id):
    try:
        # Fetch course modules
        modules_res = supabase.table("modules").select("*").eq("course_id", course_id).order("order_no").execute()
        modules = modules_res.data or []
        module_ids = [m["id"] for m in modules]

        if not module_ids:
            return jsonify({"success": True, "sequence": []}), 200

        # Fetch all matching lessons in a single batch call
        lessons_res = supabase.table("lessons").select("*").in_("module_id", module_ids).order("order_no").execute()
        all_lessons = lessons_res.data or []

        sequence = []
        for m in modules:
            module_lessons = [l for l in all_lessons if l["module_id"] == m["id"]]
            for lesson in module_lessons:
                sequence.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "content": lesson.get("content") or lesson.get("body") or "",
                    "video_url": lesson.get("video_url"),
                    "file_url": lesson.get("file_url"),
                    "module_id": m["id"],
                    "module_title": m["title"],
                    "module_order_no": m["order_no"]
                })

        return jsonify({"success": True, "sequence": sequence}), 200
    except Exception as e:
        print(f"Error building workspace bundle: {str(e)}")
        return jsonify({"error": str(e)}), 500
    


@enrollment_bp.route("/progress/session/course/<course_id>/lessons", methods=["GET"])
def get_completed_lesson_ids(course_id):
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Unauthenticated"}), 401
            
        # 1. Fetch all lessons belonging to this course's modules
        modules_res = supabase.table("modules").select("id").eq("course_id", course_id).execute()
        module_ids = [m["id"] for m in (modules_res.data or [])]
        
        if not module_ids:
            return jsonify({"success": True, "completed_lesson_ids": []}), 200
            
        lessons_res = supabase.table("lessons").select("id").in_("module_id", module_ids).execute()
        lesson_ids = [l["id"] for l in (lessons_res.data or [])]
        
        if not lesson_ids:
            return jsonify({"success": True, "completed_lesson_ids": []}), 200

        # 2. Extract entries from student_progress table that are explicitly set to True
        progress_res = supabase.table("student_progress") \
            .select("lesson_id") \
            .eq("student_id", user_id) \
            .eq("is_completed", True) \
            .in_("lesson_id", lesson_ids) \
            .execute()
            
        completed_ids = [row["lesson_id"] for row in (progress_res.data or [])]
        return jsonify({"success": True, "completed_lesson_ids": completed_ids}), 200

    except Exception as e:
        print(f"Error fetching lesson ids: {str(e)}")
        return jsonify({"error": str(e)}), 500
