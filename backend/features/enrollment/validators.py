def validate_enrollment(data):
    required_fields = ['user_id', 'course_id']
    return all(field in data for field in required_fields)

def validate_enrollment_exists(user_id, course_id):
    # Check if enrollment already exists
    pass
