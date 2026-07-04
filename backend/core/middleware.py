from flask import request, jsonify, g
from functools import wraps
from .supabase_client import supabase
import jwt
import os


def verify_supabase_token():
    auth_header = request.headers.get("Authorization")

    # print(f"DEBUG: Received Auth Header: {auth_header}")

    # # ---- UPDATE THE TEMPORARY BYPASS FOR POSTMAN ----
    # if auth_header == "Bearer POSTMAN_TEST_SECRET":
    #     g.user_id = "6ae11c18-fbee-4b41-a1ff-1429ee9d16d3" # Your exact Instructor UUID
    #     g.user_role = "admin"                       # Set this to instructor
    #     return None                                      # Pass validation safely
    # # -------------------------------------------------



    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid authorization token format."}), 401
    
    token = auth_header.split(' ')[1]

    SUPABASE_JWT_SECRET_KEY = os.environ.get("SUPABASE_JWT_SECRET")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET_KEY,
            algorithms=["HS256"],
            audience="authenticated"
        )

        user_id = payload.get("sub")

        profile_query = supabase.table("profiles").select("role", "status").eq("id", user_id).single().execute()
        profile = profile_query.data

        if not profile:
            return jsonify({"error": "User profile records not found on this platform."}), 404
        if profile.get("status") == "pending":
            return jsonify({"error": "Access Denied: Your instructor application is still pending administrator approval."}), 403
        elif profile.get("status") == "rejected":
            return jsonify({"error": "Access Denied: Your instructor application was rejected."}), 403
        
        g.user_id = user_id
        g.user_role = profile.get("role")

        return None
    
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Your session has expired. Please log in again."}), 401
    
    except jwt.InvalidTokenError:
        return jsonify({"error": "Authentication failed: Invalid token."}), 401
