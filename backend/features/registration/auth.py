
from flask import Blueprint, request, jsonify, flash, session, redirect, url_for, render_template
from core.supabase_client import supabase

auth = Blueprint('auth', __name__)


@auth.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    resume_url = data.get('resume_url')

    if not name or not email or not password:
        flash("Name, email, and password are required", "error")
        return jsonify({"error": "Name, email, and password are required"}), 400
    
    ALLOWED_ROLES = ['student', 'instructor', 'admin']  
    if role not in ALLOWED_ROLES:
        flash("Invalid account role requested", "error")
        return jsonify({"error": f"Invalid account role requested: {role}"}), 400
    
    if role == 'instructor' and not resume_url:
        return jsonify({"error": "Resume URL is required for instructor accounts"}), 400
    
    try:
        existing_user = supabase.table('profiles').select('id').eq('email', email).execute()
        if existing_user.data:
            flash("An account with this email already exists", "error")
            return jsonify({"error": "An account with this email already exists"}), 409
        
        
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "name": name,
                    "role": role,
                    "resume_url": resume_url
                    }
                }
        })

        flash(f"User registered successfully!{auth_response.user.email}", "success")
        return jsonify({
            "message": "User registered successfully!",
            "user_id": auth_response.user.id
        }), 201
    
    except Exception as e:
        flash(f"Error during registration: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400
    



@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        flash("Email and password are required", "error")
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if auth_response.user:
            session['user_id'] = auth_response.user.id
            flash(f"User logged in successfully!{auth_response.user.email}", "success")
            role = auth_response.user.user_metadata.get("role")
            return jsonify({
                "message": "User logged in successfully!",
                "user_id": auth_response.user.id,
                "role": auth_response.user.user_metadata.get("role"),
                # "access_token": auth_response.session.access_token,
                # "refresh_token": auth_response.session.refresh_token
            }), 200
        
        if role == 'instructor':
            return jsonify({"message": "Instructor logged in successfully!"}), 200, render_template('instructor_dashboard.html', user=auth_response.user)
        
        if role == 'student':
            return jsonify({"message": "Student logged in successfully!"}), 200, render_template('student_dashboard.html', user=auth_response.user)
        
        if role == 'admin':
            return jsonify({"message": "Admin logged in successfully!"}), 200, render_template('admin_dashboard.html', user=auth_response.user)
        
        
        else:
            flash("Invalid email or password", "error")
            return jsonify({"error": "Invalid email or password"}), 401
        
    except Exception as e:
        flash(f"Error during login: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400