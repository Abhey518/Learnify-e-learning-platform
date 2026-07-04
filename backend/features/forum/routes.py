from flask import Blueprint, request, jsonify
from .services import ForumService

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')

@forum_bp.route('/threads', methods=['GET'])
def get_threads():
    # Get forum threads
    pass

@forum_bp.route('/threads', methods=['POST'])
def create_thread():
    # Create new forum thread
    pass

@forum_bp.route('/threads/<thread_id>/posts', methods=['GET'])
def get_thread_posts(thread_id):
    # Get posts in a thread
    pass

@forum_bp.route('/threads/<thread_id>/posts', methods=['POST'])
def create_post(thread_id):
    # Create post in thread
    pass
