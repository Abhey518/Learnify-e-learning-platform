from core.supabase_client import supabase

class ForumService:
    def __init__(self):
        self.supabase = supabase

# --- GET THREADS LOGIC ---

    def get_forum_threads(self, course_id=None):
        # get all threads from database
        query = self.supabase.table('forum_threads').select('*')
        if course_id:
            query = query.eq('course_id', course_id)
        
        response = query.execute()
        return response.data

# --- CREATE THREAD LOGIC ---

    def create_thread(self, thread_data):
        # insert new thread in database
        response = self.supabase.table('forum_threads').insert({
            "title": thread_data.get('title'),
            "description": thread_data.get('description'),
            "user_id": thread_data.get('user_id'),
            "course_id": thread_data.get('course_id')  # optional
        }).execute()
        return response.data[0] if response.data else response.data
    
    # --- GET THREAD POSTS LOGIC ---

    def get_thread_posts(self, thread_id):
        # get posts into specific threads 
        response = self.supabase.table('forum_posts')\
            .select('*')\
            .eq('thread_id', thread_id)\
            .execute()
        return response.data

# --- CREATE POST LOGIC ---

    def create_post(self, post_data):
        # insert new post into a thread
        response = self.supabase.table('forum_posts').insert({
            "thread_id": post_data.get('thread_id'),
            "content": post_data.get('content'),
            "user_id": post_data.get('user_id')
        }).execute()
        return response.data[0] if response.data else response.data

# --- DELETE POST LOGIC ---

    def delete_post(self, post_id):
        # delete a post
        response = self.supabase.table('forum_posts')\
            .delete()\
            .eq('id', post_id)\
            .execute()
        return response.data
