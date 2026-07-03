from core.supabase_client import supabase

def register_user(name, email, password, role, resume_url):
    
    try:
        
        existing_user = supabase.table('profiles').select('id').eq('email', email).execute()
        if existing_user.data:
            return {"success": False, "status_code": 409, "error": "An account with this email already exists."}
        
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

        return {
            "success": True, 
            "status_code": 201, 
            "user_id": auth_response.user.id,
            "email": auth_response.user.email
        }
    except Exception as e:
        return {"success": False, "status_code": 400, "error": str(e)}


def authenticate_user(email, password):
    try:
        
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not auth_response.user:
            return {"success": False, "status_code": 401, "error": "Invalid email or password."}
        
        user_id = auth_response.user.id

        
        profile_query = supabase.table('profiles').select('name, role, status').eq('id', user_id).execute()

        if not profile_query.data:
            return {"success": False, "status_code": 404, "error": "Profile records are out of sync."}
        
        user_profile = profile_query.data[0]
        
        return {
            "success": True,
            "status_code": 200,
            "user_id": user_id,
            "name": user_profile.get('name'),
            "role": user_profile.get('role'),
            "status": user_profile.get('status')
        }
    except Exception as e:
        return {"success": False, "status_code": 400, "error": str(e)}