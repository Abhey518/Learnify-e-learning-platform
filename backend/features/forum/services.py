from core.supabase_client import supabase

class ForumService:
    def __init__(self):
        self.supabase = supabase


# --- Create a new thread (Private) ---

    def create_thread(self, thread_data):
        # insert new thread in database
        response = self.supabase.table('forum_threads').insert({
            "title": thread_data.get('title'),
            "description": thread_data.get('description'),
            "user_id": thread_data.get('user_id'),
            "course_id": thread_data.get('course_id')  # optional
        }).execute()
        return response.data[0] if response.data else response.data


# --- Get all threads of a course (Private) ---

    def get_forum_threads(self, course_id):
        # Enforce that course_id must exist before querying
        if not course_id:
            raise ValueError("Course ID is required")

        # Get threads only for the specific course
        response = self.supabase.table('forum_threads').select('*, profiles(name, role)').eq('course_id', course_id).execute()
        
        return response.data


# --- Update a thread ---
    def update_thread(self, thread_id, thread_data):
        # update thread title and/or description
        response = self.supabase.table('forum_threads')\
            .update({
                "title": thread_data.get('title'),
                "description": thread_data.get('description')
            })\
            .eq('id', thread_id)\
            .execute()
        return response.data[0] if response.data else None


# --- Delete a thread ---
    def delete_thread(self, thread_id):
        # delete a thread
        response = self.supabase.table('forum_threads')\
            .delete()\
            .eq('id', thread_id)\
            .execute()
        return response.data



# --- Create a new reply ---

    def create_post(self, post_data):
        # insert new reply into a thread
        response = self.supabase.table('forum_replies').insert({
            "thread_id": post_data.get('thread_id'),
            "reply_message": post_data.get('reply_message'),
            "user_id": post_data.get('user_id')
        }).execute()
        return response.data[0] if response.data else response.data


# --- Get replies of a thread ---

    def get_thread_posts(self, thread_id):
        # get replies for a specific threads 
        response = self.supabase.table('forum_replies')\
            .select('*, profiles(name, role)')\
            .eq('thread_id', thread_id)\
            .execute()
        return response.data


# --- Update a reply (Private) ---
    def update_post(self, post_id, post_data):
        # update reply message
        response = self.supabase.table('forum_replies')\
            .update({
                "reply_message": post_data.get('reply_message')
            })\
            .eq('id', post_id)\
            .execute()
        return response.data[0] if response.data else None


# --- Delete a reply ---

    def delete_post(self, post_id):
        # delete a reply
        response = self.supabase.table('forum_replies')\
            .delete()\
            .eq('id', post_id)\
            .execute()
        return response.data
