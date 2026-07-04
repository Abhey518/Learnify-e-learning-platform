<<<<<<< HEAD
from backend.core.supabase_client import get_supabase_client
=======
from ...core.supabase_client import get_supabase_client
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059

class ForumService:
    def __init__(self):
        self.supabase = get_supabase_client()

    def get_forum_threads(self, course_id=None):
        # Get all forum threads
        pass

    def create_thread(self, thread_data):
        # Create new forum thread
        pass

    def get_thread_posts(self, thread_id):
        # Get all posts in a thread
        pass

    def create_post(self, post_data):
        # Create new forum post
        pass

    def delete_post(self, post_id):
        # Delete a post
        pass
