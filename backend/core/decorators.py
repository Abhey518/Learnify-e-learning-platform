from functools import wraps
from flask import session, jsonify

def login_required(f):
    """
    Enforces that a user must be logged into an active session.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Unauthenticated: Active session required."}), 401
        return f(*args, **kwargs)
    return decorated_function


def role_required(allowed_roles):
    """
    Enforces that a logged-in user must possess a specific role.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not session.get('user_id'):
                return jsonify({"error": "Unauthenticated: Active session required."}), 401
            
            if session.get('user_role') not in allowed_roles:
                return jsonify({"error": "Access Denied: Insufficient permissions."}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator