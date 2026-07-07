import traceback
from flask import Blueprint, jsonify, request, session
from .services import QuizService
from .validators import validate_quiz_template, validate_question, validate_quiz_submission, validate_answers
from core.supabase_client import supabase

# Create ONE unified blueprint with a clean root prefix
quiz_bp = Blueprint('quiz', __name__, url_prefix='/api')

def add_cors_headers(res, methods="GET"):
    res.headers.add("Access-Control-Allow-Origin", "*")
    res.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    res.headers.add("Access-Control-Allow-Methods", methods)
    return res

# Fetch all quizzes for a specific course
@quiz_bp.route('/courses/<int:course_id>/quizzes', methods=['GET'])
@quiz_bp.route('/courses/modules/<int:module_id>/quizzes', methods=['GET'])
def get_course_quizzes(course_id=None, module_id=None):
    try:
        query = supabase.table("quizzes").select("*")
        
        if module_id:
            response = query.eq("module_id", module_id).execute()
        else:
            response = query.eq("course_id", course_id).execute()
        
        res = jsonify(response.data or [])
        return add_cors_headers(res), 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        return add_cors_headers(res), 500


# Instructor Creates a New Quiz Template (With Attempt Limit)
@quiz_bp.route('/courses/<int:course_id>/quizzes', methods=['POST', 'OPTIONS'])
@quiz_bp.route('/courses/modules/<int:module_id>/quizzes', methods=['POST', 'OPTIONS'])
def create_course_quiz(course_id=None, module_id=None):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "POST,OPTIONS"), 200
    try:
        data = request.get_json()
        title = data.get('title')
        attempt_limit = data.get('attempt_limit', 1) 
        
        if not title:
            return add_cors_headers(jsonify({"error": "Missing quiz title"})), 400

        final_course_id = course_id if course_id else data.get('course_id')
        final_module_id = module_id if module_id else data.get('module_id')

        new_quiz = {
            "title": title,
            "course_id": final_course_id,
            "module_id": final_module_id,
            "attempt_limit": int(attempt_limit)
        }

        response = supabase.table('quizzes').insert(new_quiz).execute()
        return add_cors_headers(jsonify(response.data[0])), 201
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500


# Fetch Single Quiz Configuration + Check Student Attempt Tracking Count
@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_single_quiz_details(quiz_id):
    try:
        student_id = session.get("user_id") or session.get("student_id")
        
        # Fetch the quiz metadata
        quiz_res = supabase.table("quizzes").select("*").eq("id", quiz_id).execute()
        if not quiz_res.data:
            return add_cors_headers(jsonify({"error": "Quiz not found"})), 404
        quiz_meta = quiz_res.data[0]

        # Fetch questions
        questions_res = supabase.table("questions").select("*").eq("quiz_id", quiz_id).execute()
        
        # Calculate how many times this student has taken this quiz
        attempts_count = 0
        if student_id:
            attempts_res = supabase.table("quiz_scores")\
                .select("id")\
                .eq("quiz_id", quiz_id)\
                .eq("student_id", str(student_id))\
                .execute()
            attempts_count = len(attempts_res.data or [])

        # Send everything back to the frontend container
        return add_cors_headers(jsonify({
            "meta": quiz_meta,
            "questions": questions_res.data or [],
            "current_student_attempts": attempts_count
        })), 200
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500
    

# Fetch questions from Supabase
@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
@quiz_bp.route('/quizzes/<int:quiz_id>/questions', methods=['GET'])
def get_questions(quiz_id):
    try:
        questions = QuizService.get_questions_by_quiz(quiz_id)
        return add_cors_headers(jsonify(questions)), 200
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500

# Instructor Creates a New Question
@quiz_bp.route('/quizzes/<int:quiz_id>/questions', methods=['POST', 'OPTIONS'])
def create_question(quiz_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "POST,OPTIONS"), 200
    try:
        data = request.json
        question = QuizService.create_question(quiz_id, data)
        return add_cors_headers(jsonify(question)), 201
    except Exception as e:
        print(f"SUPABASE QUESTION CREATION REJECTED:\n{traceback.format_exc()}")
        return add_cors_headers(jsonify({"error": str(e)})), 400

# Submit quiz and persist records
@quiz_bp.route('/quizzes/<int:quiz_id>/submit', methods=['POST', 'OPTIONS'])
def submit_student_quiz_attempt(quiz_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "POST,OPTIONS"), 200
    try:
        submitted_answers = request.get_json()
        
        # Fetch correct answers
        questions_res = supabase.table("questions").select("id", "correct_option").eq("quiz_id", quiz_id).execute()
        questions_data = questions_res.data or []
        
        if not questions_data:
            return add_cors_headers(jsonify({"error": "No questions found"})), 400

        correct_map = {q["id"]: str(q["correct_option"]).strip().upper() for q in questions_data}
        
        # Calculate score
        score = 0
        total_questions = len(questions_data)
        for item in submitted_answers:
            q_id = item.get("question_id")
            student_ans = str(item.get("answer")).strip().upper()
            if q_id in correct_map and correct_map[q_id] == student_ans:
                score += 1

        raw_student_id = session.get("user_id") or session.get("student_id")
        
        if not raw_student_id:
            return add_cors_headers(jsonify({"error": "User session not found"})), 401
            
        student_id_str = str(raw_student_id)

        # Payload targeting your "quiz_scores" table
        score_payload = {
            "student_id": student_id_str, # Passed as UUID string
            "quiz_id": int(quiz_id),      # Keep quiz_id as int
            "score": int(score)
        }
        
        # Insert to quiz_scores
        supabase.table("quiz_scores").insert(score_payload).execute()

        return add_cors_headers(jsonify({
            "success": True, 
            "score": score, 
            "total_questions": total_questions
        })), 200

    except Exception as e:
        import traceback
        print(f"\CRASH LOG:\n{traceback.format_exc()}")
        return add_cors_headers(jsonify({"error": str(e)}), "POST"), 500
    

    
# Instructor Updates Quiz Meta Properties (e.g., Title)
@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['PUT', 'OPTIONS'])
def update_quiz_meta(quiz_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "PUT,OPTIONS"), 200
    try:
        data = request.get_json()
        new_title = data.get('title')
        
        if not new_title or not new_title.strip():
            return add_cors_headers(jsonify({"error": "Quiz title cannot be blank"})), 400

        # Update the target quiz row record inside Supabase
        response = supabase.table("quizzes") \
            .update({"title": new_title.strip()}) \
            .eq("id", quiz_id) \
            .execute()
            
        if not response.data:
            return add_cors_headers(jsonify({"error": "Quiz record not found or update failed"})), 404
            
        res = jsonify(response.data[0])
        return add_cors_headers(res), 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        return add_cors_headers(res), 500
    


# Instructor Updates an Existing Question and its Options
@quiz_bp.route('/questions/<int:question_id>', methods=['PUT', 'OPTIONS'])
def update_question_details(question_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "PUT,OPTIONS"), 200
    try:
        data = request.get_json()
        
        # Defensively parse and normalize option_e string contents
        raw_opt_e = data.get("option_e")
        processed_opt_e = str(raw_opt_e).strip() if raw_opt_e is not None else "N/A"
        if processed_opt_e == "":
            processed_opt_e = "N/A"

        # Build the update dictionary matching your active schema configurations safely
        updated_row = {
            "question_text": data.get("question_text"),
            "text": data.get("question_text"),  # Fallback row matching your database columns
            "option_a": data.get("option_a"),
            "option_b": data.get("option_b"),
            "option_c": data.get("option_c"),
            "option_d": data.get("option_d"),
            "option_e": processed_opt_e,
            "correct_option": data.get("correct_option", "A")
        }

        # Safe update block execution using try-except fallback logic
        try:
            response = supabase.table("questions") \
                .update(updated_row) \
                .eq("id", question_id) \
                .execute()
        except Exception as database_err:
            if "question_text" in str(database_err) or "text" in str(database_err):
                stripped_row = {k: v for k, v in updated_row.items() if k != "text"}
                response = supabase.table("questions") \
                    .update(stripped_row) \
                    .eq("id", question_id) \
                    .execute()
            else:
                raise database_err

        if not response.data:
            return add_cors_headers(jsonify({"error": "Question record not found or update failed"})), 404

        return add_cors_headers(jsonify({"success": True, "data": response.data[0]})), 200
    except Exception as e:
        print("\n" + "!"*60)
        print(f"DETAILED QUESTION UPDATE CRASH LOG:\n{traceback.format_exc()}")
        print("!"*60 + "\n")
        return add_cors_headers(jsonify({"error": str(e), "detail": traceback.format_exc()}), "PUT"), 500
    

# Instructor Deletes an Entire Quiz Template
@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE', 'OPTIONS'])
def delete_quiz_by_id(quiz_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "DELETE,OPTIONS"), 200
    try:
        # Cascade warnings: Note that your database foreign key rules 
        # should ideally be set to ON DELETE CASCADE for questions linked to this quiz.
        response = supabase.table("quizzes") \
            .delete() \
            .eq("id", quiz_id) \
            .execute()
            
        if not response.data:
            return add_cors_headers(jsonify({"error": "Quiz record not found or already removed"})), 404
            
        res = jsonify({"success": True, "message": "Quiz deleted successfully"})
        return add_cors_headers(res), 200
    except Exception as e:
        print(f"\QUIZ DELETION CRASH LOG:\n{traceback.format_exc()}")
        res = jsonify({"error": str(e)})
        return add_cors_headers(res), 500
    
# Fetch All Completed Quiz IDs for Active Session Student
@quiz_bp.route('/enrollment/progress/session/course/<int:course_id>/quizzes', methods=['GET'])
def get_completed_quizzes(course_id):
    try:
        student_id = session.get("user_id") or session.get("student_id") or 1
        
        # Query quiz scores for this specific user
        response = supabase.table("quiz_scores")\
            .select("quiz_id")\
            .eq("student_id", student_id)\
            .execute()
            
        completed_ids = [row["quiz_id"] for row in (response.data or [])]
        
        return add_cors_headers(jsonify({
            "success": True,
            "completed_quiz_ids": completed_ids
        })), 200
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500



# Instructor View: Fetch Quiz Performance Marks & Student Names (Aligned with Profiles Schema)
@quiz_bp.route('/quizzes/<int:quiz_id>/instructor-marks', methods=['GET'])
def get_quiz_marks_for_instructor(quiz_id):
    try:
        user_role = session.get('user_role')
        if user_role != 'instructor':
            return add_cors_headers(jsonify({"error": "Access Denied: Instructor role required."})), 403

        # 1. Fetch total question count
        questions_res = supabase.table("questions").select("id").eq("quiz_id", quiz_id).execute()
        total_questions = len(questions_res.data or [])
        
        if total_questions == 0:
            return add_cors_headers(jsonify({"success": True, "marks": []})), 200

        # 2. Fetch student scores
        scores_res = supabase.table("quiz_scores") \
            .select("student_id, score") \
            .eq("quiz_id", quiz_id) \
            .execute()
        scores_data = scores_res.data or []

        # Fetch user details from 'profiles' table using 'id' and 'name'
        user_ids = [row["student_id"] for row in scores_data]
        user_map = {}
        
        if user_ids:
            try:
                users_res = supabase.table("profiles").select("id, name").in_("id", user_ids).execute()
                user_map = {u["id"]: u["name"] for u in (users_res.data or [])}
            except Exception as e:
                print(f"Error resolving profiles table metadata: {str(e)}")

        # Compile payload and calculate percentage out of 100
        marks_report = []
        for row in scores_data:
            s_id = row["student_id"]
            raw_score = row["score"]
            
            percentage_score = round((raw_score / total_questions) * 100, 2) if total_questions > 0 else 0
            fallback_display_name = f"Student ({str(s_id)[:6]}...)" if s_id else "Unknown Student"
            
            marks_report.append({
                "student_id": s_id,
                "student_name": user_map.get(s_id, fallback_display_name), # Pulls real name now!
                "raw_score": raw_score,
                "total_questions": total_questions,
                "percentage_marks": percentage_score
            })

        return add_cors_headers(jsonify({
            "success": True,
            "quiz_id": quiz_id,
            "marks": marks_report
        })), 200

    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500