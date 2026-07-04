def validate_thread(data):
    required_fields = ['title', 'content', 'user_id']
    return all(field in data for field in required_fields)

def validate_post(data):
    required_fields = ['content', 'user_id', 'thread_id']
    return all(field in data for field in required_fields)
