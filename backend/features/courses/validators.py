from shared.utils.validators import validate_required_fields

def validate_course(data):
    required_fields = ['title', 'description', 'instructor_id']
    return validate_required_fields(data, required_fields)

def validate_course_update(data):
    # At least one field should be present
    return len(data) > 0
