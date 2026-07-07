from flask import Blueprint, request, jsonify, session
from core.decorators import login_required, role_required
from .services import ForumService
from .validators import validate_thread, validate_reply    

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')
forum_service = ForumService()



# --- Create a new thread ---

@forum_bp.route('/threads', methods=['POST'])
@login_required
def create_thread():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Request body is empty"}), 400
            
        if not validate_thread(data):
            return jsonify({"error": "Missing required fields: title, description, or course_id"}), 400

        data['user_id'] = session.get('user_id')
     
        new_thread = forum_service.create_thread(data)
        return jsonify(new_thread), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Retrieve all threads of a course ---

@forum_bp.route('/<course_id>/threads', methods=['GET'])
@login_required
def get_threads(course_id):
    try:
        if not course_id:
            return jsonify({"error": "Course id is required"}),400

        threads = forum_service.get_forum_threads(course_id)

        if not threads:
        #    return jsonify({"message": "No threads found"}), 200 # if the below code works, we can delete this
           return jsonify([]), 200 

        return jsonify(threads), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Update a thread ---
@forum_bp.route('/threads/<thread_id>', methods=['PUT'])
@login_required
def update_thread(thread_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        updated_thread = forum_service.update_thread(thread_id, data)

        if not updated_thread:
            return jsonify({"error": "Thread not found"}), 404

        return jsonify(updated_thread), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# --- Delete a thread ---
@forum_bp.route('/threads/<thread_id>', methods=['DELETE'])
@login_required
def delete_thread(thread_id):
    try:
        deleted = forum_service.delete_thread(thread_id)

        if not deleted:
            return jsonify({"error": "Thread not found"}), 404

        return jsonify({"message": "Thread deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# --- Create a new reply ---

@forum_bp.route('/threads/<thread_id>/posts', methods=['POST'])
@login_required
def create_post(thread_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        if not validate_reply(data):
            return jsonify({"error": "Missing required fields: reply_message or thread_id"}), 400

        data['thread_id'] = thread_id
        data['user_id'] = session.get('user_id')

        new_post = forum_service.create_post(data)
        return jsonify(new_post), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Retrieve all replies of a thread ---

@forum_bp.route('/threads/<thread_id>/posts', methods=['GET'])
@login_required
def get_thread_posts(thread_id):
    try:
        posts = forum_service.get_thread_posts(thread_id)
        return jsonify(posts), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Update a reply ---
@forum_bp.route('/posts/<post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        if not data.get('reply_message'):
            return jsonify({"error": "Missing required field: reply_message"}), 400

        updated_post = forum_service.update_post(post_id, data)
        
        if not updated_post:
            return jsonify({"error": "Reply not found"}), 404
        
        return jsonify(updated_post), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Delete a reply ---

@forum_bp.route('/posts/<post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    try:
        deleted = forum_service.delete_post(post_id)

        if not deleted:
            return jsonify({"error": "Reply not found"}), 404

        return jsonify({"message": "Reply deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
