def validate_quiz_template(data):
    
    if not data or not data.get("title"):
        return False, "Quiz title is required."
    return True, None

def validate_question(data):
    
    required_fields = ["question_text", "option_a", "option_b", "option_c", "option_d"]
    if not data:
        return False, "No data provided."
        
    for field in required_fields:
        if not data.get(field):
            return False, f"Field '{field}' is required."
    return True, None


def validate_quiz_submission(data):
    required_fields = ['quiz_id', 'user_id', 'answers']
    return all(field in data for field in required_fields)

def validate_answers(answers):
    # Validate quiz answers format
    return isinstance(answers, list) and len(answers) > 0
