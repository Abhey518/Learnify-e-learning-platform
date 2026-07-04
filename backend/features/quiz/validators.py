
# Input validation logic for Member 3: Quiz & Assessment Engine

def validate_quiz_payload(data):
    """
    Validates the input dictionary layout for creating a new quiz template.
    Returns parsed data dict or raises a ValueError.
    """
    if not data or not data.get("title"):
        raise ValueError("Quiz configuration error: 'title' is a mandatory required parameter.")
    
    return {
        "title": str(data.get("title")).strip()
    }

def validate_question_payload(data):
    """
    Sanitizes and enforces structural matrix patterns for 5-option multiple choice additions.
    Handles strict PostgreSQL NOT NULL table alignment constraints.
    """
    if not data or not data.get("question_text"):
        raise ValueError("Missing payload criteria: 'question_text' prompt is mandatory.")
        
    # Validation checks for foundational answer blocks
    if not data.get("option_a") or not data.get("option_b") or not data.get("option_c") or not data.get("option_d"):
        raise ValueError("Incomplete core parameters: Options A, B, C, and D must be specified.")

    # 🌟 Refined Fallback Rule: Enforce "N/A" layout metrics if option_e is missing or blank
    opt_e_value = data.get("option_e")
    if opt_e_value is None or str(opt_e_value).strip() == "":
        opt_e_value = "N/A"
    else:
        opt_e_value = str(opt_e_value).strip()

    return {
        "question_text": str(data.get("question_text")).strip(),
        "option_a": str(data.get("option_a")).strip(),
        "option_b": str(data.get("option_b")).strip(),
        "option_c": str(data.get("option_c")).strip(),
        "option_d": str(data.get("option_d")).strip(),
        "option_e": opt_e_value,
        "correct_option": str(data.get("correct_option", "A")).upper().strip()
    }