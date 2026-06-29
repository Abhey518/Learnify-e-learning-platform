from flask import Blueprint, request, jsonify, session, flash
from features.registration.validators import validate_signup_data, validate_login_data
from features.registration.services import register_user, authenticate_user

auth = Blueprint('auth', __name__)

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    
    # 1. Validate incoming format payload structures
    is_valid, validation_error = validate_signup_data(data)
    if not is_valid:
        flash(validation_error, "error")
        return jsonify({"error": validation_error}), 400
        
    # 2. Run background registration transactions
    result = register_user(
        name=data.get('name'),
        email=data.get('email'),
        password=data.get('password'),
        role=data.get('role'),
        resume_url=data.get('resume_url')
    )
    
    if not result['success']:
        flash(result['error'], "error")
        return jsonify({"error": result['error']}), result['status_code']
        
    flash(f"User registered successfully! {result['email']}", "success")
    return jsonify({
        "message": "User registered successfully!",
        "user_id": result['user_id']
    }), result['status_code']


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    is_valid, validation_error = validate_login_data(data)
    if not is_valid:
        flash(validation_error, "error")
        return jsonify({"error": validation_error}), 400

    result = authenticate_user(data.get('email'), data.get('password'))
    if not result['success']:
        flash(result['error'], "error")
        return jsonify({"error": result['error']}), result['status_code']

    # 3. Handle Flask Client State Session Management safely
    session['user_id'] = result['user_id']
    session['name'] = result['name']
    session['user_role'] = result['role']
    session['user_status'] = result['status']
    session.permanent = True 

    # 4. Generate system dashboard routing string redirections
    role = result['role']
    status = result['status']
    
    if role == 'instructor':
        redirect_url = "/dashboard/instructor/pending" if status == 'pending' else "/dashboard/instructor"
    elif role == 'admin':
        redirect_url = "/admin"
    else:
        redirect_url = "/dashboard/student"

    flash(f"Welcome back! Logged in successfully.", "success")
    return jsonify({
        "message": f"{role.capitalize()} logged in successfully!",
        "user_id": result['user_id'],
        "role": role,
        "status": status,
        "redirect_url": redirect_url
    }), 200


@auth.route('/logout', methods=['POST'])
def logout():
    session.clear()
    flash("Logged out successfully", "success")
    return jsonify({"message": "Logged out successfully"}), 200


@auth.route('/current-user', methods=['GET'])
def current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "No user is currently logged in."}), 401

    return jsonify({
        "user_id": user_id,
        "name": session.get("name"),
        "role": session.get('user_role'),
        "status": session.get('user_status')
    }), 200