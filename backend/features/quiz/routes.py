import traceback
from flask import Blueprint, jsonify, request
from .services import QuizService
from .validators import validate_quiz_template, validate_question

quiz_bp = Blueprint('quiz', __name__)

def add_cors_headers(res, methods="GET"):
    res.headers.add("Access-Control-Allow-Origin", "*")
    res.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    res.headers.add("Access-Control-Allow-Methods", methods)
    return res

# 1. Fetch all quizzes for a specific course
@quiz_bp.route('/courses/<int:course_id>/quizzes', methods=['GET'])
def get_course_quizzes(course_id):
    try:
        data = QuizService.get_quizzes_by_course(course_id)
        res = jsonify(data)
        return add_cors_headers(res), 200
    except Exception as e:
        res = jsonify({"error": str(e)})
        return add_cors_headers(res), 500

# 2. Instructor Creates a New Quiz Template
@quiz_bp.route('/courses/<int:course_id>/quizzes', methods=['POST', 'OPTIONS'])
def create_quiz_template(course_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "POST,OPTIONS"), 200

    try:
        data = request.json
        is_valid, error_msg = validate_quiz_template(data)
        if not is_valid:
            return add_cors_headers(jsonify({"error": error_msg})), 400

        quiz = QuizService.create_quiz(course_id, data)
        return add_cors_headers(jsonify(quiz)), 201
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 400

# 3. Fetch questions from Supabase
@quiz_bp.route('/quizzes/<int:quiz_id>/questions', methods=['GET'])
@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_questions(quiz_id):
    try:
        questions = QuizService.get_questions_by_quiz(quiz_id)
        return add_cors_headers(jsonify(questions)), 200
    except Exception as e:
        return add_cors_headers(jsonify({"error": str(e)})), 500

# 4. Instructor Creates a New Question
@quiz_bp.route('/quizzes/<int:quiz_id>/questions', methods=['POST', 'OPTIONS'])
def create_question(quiz_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "POST,OPTIONS"), 200

    try:
        data = request.json
        is_valid, error_msg = validate_question(data)
        if not is_valid:
            return add_cors_headers(jsonify({"error": error_msg})), 400

        question = QuizService.create_question(quiz_id, data)
        return add_cors_headers(jsonify(question)), 201
    except Exception as e:
        print("\n" + "!"*50 + f"\n🔥 SUPABASE QUESTION CREATION REJECTED:\n{traceback.format_exc()}\n" + "!"*50)
        return add_cors_headers(jsonify({"error": str(e)})), 400

# 5. Submit quiz and persist records
@quiz_bp.route('/quizzes/<int:quiz_id>/submit', methods=['POST', 'OPTIONS'])
def submit_quiz(quiz_id):
    if request.method == 'OPTIONS':
        return add_cors_headers(jsonify({"status": "CORS preflight OK"}), "POST,OPTIONS"), 200

    try:
        user_answers = request.json
        score, total = QuizService.submit_quiz_answers(quiz_id, user_answers)
        
        response = jsonify({
            "success": True, 
            "score": score, 
            "total_questions": total,
            "status": "Completed",
            "message": "Quiz submission processed successfully!"
        })
        return add_cors_headers(response), 200
    except Exception as e:
        print("\n" + "!"*50 + f"\n🔥 DETAILED BACKEND CRASH LOG:\n{traceback.format_exc()}\n" + "!"*50)
        response = jsonify({
            "success": False,
            "error": str(e),
            "detail": "Check your Python backend terminal for full traceback logs."
        })
        return add_cors_headers(response, "POST"), 500