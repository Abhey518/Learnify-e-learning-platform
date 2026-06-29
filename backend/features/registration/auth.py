
# from flask import Blueprint, request, jsonify, flash, session, redirect, url_for, render_template
# from core.supabase_client import supabase


# auth = Blueprint('auth', __name__)


# @auth.route('/signup', methods=['POST'])
# def signup():
#     data = request.json
#     name = data.get('name')
#     email = data.get('email')
#     password = data.get('password')
#     role = data.get('role')
#     resume_url = data.get('resume_url')

#     if not name or not email or not password:
#         flash("Name, email, and password are required", "error")
#         return jsonify({"error": "Name, email, and password are required"}), 400
    
#     ALLOWED_ROLES = ['student', 'instructor']  
#     if role not in ALLOWED_ROLES:
#         flash("Invalid account role requested", "error")
#         return jsonify({"error": f"Invalid account role requested: {role}"}), 400
    
#     if role == 'instructor' and not resume_url:
#         return jsonify({"error": "Resume URL is required for instructor accounts"}), 400
    
#     try:
#         existing_user = supabase.table('profiles').select('id').eq('email', email).execute()
#         if existing_user.data:
#             flash("An account with this email already exists", "error")
#             return jsonify({"error": "An account with this email already exists"}), 409
        
        
#         auth_response = supabase.auth.sign_up({
#             "email": email,
#             "password": password,
#             "options": {
#                 "data": {
#                     "name": name,
#                     "role": role,
#                     "resume_url": resume_url
#                     }
#                 }
#         })

#         flash(f"User registered successfully!{auth_response.user.email}", "success")
#         return jsonify({
#             "message": "User registered successfully!",
#             "user_id": auth_response.user.id
#         }), 201
    
    
#     except Exception as e:
#         flash(f"Error during registration: {str(e)}", "error")
#         return jsonify({"error": str(e)}), 400
    



# @auth.route('/login', methods=['POST'])
# def login():
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')

#     if not email or not password:
#         flash("Email and password are required", "error")
#         return jsonify({"error": "Email and password are required"}), 400
    
#     try:
#         auth_response = supabase.auth.sign_in_with_password({
#             "email": email,
#             "password": password
#         })

#         if not auth_response.user:
#             flash("Invalid email or password", "error")
#             return jsonify({"error": "Invalid email or password"}), 401
        
#         user_id = auth_response.user.id

#         profile_query = supabase.table('profiles').select('role', 'status').eq('id', user_id).execute()

#         if not profile_query.data:
#             flash("User profile data not found.", "error")
#             return jsonify({"error": "Profile records are out of sync."}), 404
        

#         user_profile = profile_query.data[0]
#         role = user_profile.get('role')
#         status = user_profile.get('status')

#         session['user_id'] = user_id
#         session['user_role'] = role
#         session['user_status'] = status
#         session.permanent = True  # Make the session permanent to respect PERMANENT_SESSION_LIFETIME

#         flash(f"Welcome back! Logged in as {auth_response.user.email}", "success")

#         if role == 'instructor':
#             if status == 'pending':
#                 redirect_url = "/dashboard/instructor/pending"
#             else:
#                 redirect_url = "/dashboard/instructor"
#         elif role == 'admin':
#             redirect_url = "/dashboard/admin"
#         else:
#             redirect_url = "/dashboard/student"



#         return jsonify({
#             "message": f"{role.capitalize()} logged in successfully!",
#             "user_id": user_id,
#             "role": role,
#             "status": status,
#             "redirect_url": redirect_url
#         }), 200


        
#     except Exception as e:
#         flash(f"Error during login: {str(e)}", "error")
#         return jsonify({"error": str(e)}), 400


# @auth.route('/logout', methods=['POST'])
# def logout():
#     session.clear()
#     flash("Logged out successfully", "success")
#     return jsonify({"message": "Logged out successfully"}), 200


# @auth.route('/current-user', methods=['GET'])
# def current_user():
#     user_id = session.get('user_id')
#     role = session.get('user_role')
#     status = session.get('user_status')
#     name = session.get("name")

#     if not user_id:
#         return jsonify({"error": "No user is currently logged in"}), 401

#     return jsonify({
#         "name": name,
#         "user_id": user_id,
#         "role": role,
#         "status": status
#     }), 200