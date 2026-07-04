def validate_signup_data(data):
    
    errors = {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    resume_url = data.get('resume_url')

    if not name or not email or not password:
        return False, "Name, email, and password are required fields."

    ALLOWED_ROLES = ['student', 'instructor']  
    if role not in ALLOWED_ROLES:
        return False, f"Invalid account role requested: {role}"
    
    if role == 'instructor' and not resume_url:
        return False, "A resume or portfolio URL is required for instructor accounts."

    return True, None


def validate_login_data(data):
    if not data.get('email') or not data.get('password'):
        return False, "Email and password fields are required."
    return True, None

