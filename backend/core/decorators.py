from functools import wraps
from flask import session, jsonify


# Check that Logged or not 
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Unauthenticated: Active session required."}), 401
        return f(*args, **kwargs)
    return decorated_function


# Check Logged user role 
def role_required(allowed_roles):
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