from core.supabase_client import get_supabase_client

class ForumService:
    def __init__(self):
        # Supabase client-ai initialize seigirom
        self.supabase = get_supabase_client()

# --- GET THREADS LOGIC ---

    def get_forum_threads(self, course_id=None):
        # All threads-ai database-il irundhu edukka
        query = self.supabase.table('forum_threads').select('*')
        if course_id:
            query = query.eq('course_id', course_id)
        
        response = query.execute()
        return response.data

# --- CREATE THREAD LOGIC ---

    def create_thread(self, thread_data):
        # Puthu thread-ai database-il insert seiya
        response = self.supabase.table('forum_threads').insert({
            "title": thread_data.get('title'),
            "description": thread_data.get('description'),
            "user_id": thread_data.get('user_id'),
            "course_id": thread_data.get('course_id')  # optional
        }).execute()
        return response.data[0] if response.data else response.data
