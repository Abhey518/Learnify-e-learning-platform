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
    
    # --- POSTS / REPLIES GET ENDPOINT ---


@forum_bp.route('/threads/<thread_id>/posts', methods=['GET'])
def get_thread_posts(thread_id):
    try:
        posts = forum_service.get_thread_posts(thread_id)
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- POSTS / REPLIES POST ENDPOINT ---

@forum_bp.route('/threads/<thread_id>/posts', methods=['POST'])
def create_post(thread_id):
    try:
        data = request.get_json()
        if not data.get('content'):
            return jsonify({"error": "Content is required"}), 400
            
        data['thread_id'] = thread_id
        new_post = forum_service.create_post(data)
        return jsonify(new_post), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500