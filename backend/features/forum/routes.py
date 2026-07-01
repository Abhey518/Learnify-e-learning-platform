from flask import Blueprint, request, jsonify
from .services import ForumService

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')
forum_service = ForumService()

# --- THREADS GET ENDPOINT ---


@forum_bp.route('/threads', methods=['GET'])
def get_threads():
    try:
        course_id = request.args.get('course_id')
        threads = forum_service.get_forum_threads(course_id)
        return jsonify(threads), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- THREADS POST ENDPOINT ---


@forum_bp.route('/threads', methods=['POST'])
def create_thread():
    try:
        data = request.get_json()
        if not data.get('title'):
            return jsonify({"error": "Title is required"}), 400
            
        new_thread = forum_service.create_thread(data)
        return jsonify(new_thread), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500