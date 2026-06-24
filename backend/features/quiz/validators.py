def validate_quiz_submission(data):
    required_fields = ['quiz_id', 'user_id', 'answers']
    return all(field in data for field in required_fields)

def validate_answers(answers):
    # Validate quiz answers format
    return isinstance(answers, list) and len(answers) > 0
