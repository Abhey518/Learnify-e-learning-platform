def validate_thread(data):
    required_fields = ['title', 'description', 'course_id']
    return all(field in data for field in required_fields)

def validate_reply(data):
    required_fields = ['reply_message']
    return all(field in data for field in required_fields)
