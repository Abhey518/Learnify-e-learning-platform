from shared.utils.validators import validate_required_fields

def validate_course(data):
    required_fields = ['title', 'description', 'instructor_id']
    return validate_required_fields(data, required_fields)

def validate_course_update(data):
    # At least one field should be present
    return len(data) > 0

def validate_module(data):
    required_fields = ['course_id', 'title', 'order_no']
    return validate_required_fields(data, required_fields)

def validate_module_update(data):
    # Verify at least one modification field is present
    return len(data) > 0

def validate_lesson(data):
    required_fields = ['module_id', 'title', 'order_no']
    return validate_required_fields(data, required_fields)