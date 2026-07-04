from flask import Blueprint, request, jsonify, g, session
from core.middleware import verify_supabase_token
from core.decorators import login_required, role_required
from .services import create_course_review, get_course_reviews_and_average, get_instructor_metrics, delete_review_by_admin, get_pending_instructors, update_instructor_status, fetch_all_reviews, get_all_students, get_all_instructors, delete_user_by_admin
from .validators import validate_review_data, validate_dashboard_filters, validate_approval_status


analytics = Blueprint('analytics', __name__)


# Course Review Pipeline
@analytics.route('/reviews', methods=['POST'])
def post_review():
    user_id = session.get('user_id')
    # user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401
    
    data = request.get_json() or {}

    is_valid, validation_errors = validate_review_data(data)
    if not is_valid:
        return jsonify({"errors": validation_errors}), 400
    
    result = create_course_review(
        student_id=user_id,
        course_id=data['course_id'],
        rating=data['rating'],
        comment=data.get('comment', '')
    )

    if not result['success']:
        return jsonify({"error": result['error']}), 400
    
    return jsonify({"message": "Review submitted successfully!", "review": result['data']}), 201


@analytics.route('/courses/<int:course_id>/reviews', methods=['GET'])
def get_reviews(course_id):
    result = get_course_reviews_and_average(course_id)

    if not result['success']:
        return jsonify({"error": request['error']}), 500
    
    return jsonify(result), 200


@analytics.route('/reviews', methods=['GET'])
def get_all_reviews():
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id or user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403

    result = fetch_all_reviews()
    if not result['success']:
        return jsonify({"error": result['error']}), 500

    return jsonify(result['data']), 200


@analytics.route('/admin/reviews/<int:review_id>', methods=['DELETE'])
def admin_delete_review(review_id):
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401

    if user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    result = delete_review_by_admin(review_id)
    if not result['success']:
        return jsonify({"error": result['error']}), 400

    return jsonify({"message": "Review deleted successfully by administrator moderation override."}), 200





# Instructor Performance Metrics
@analytics.route('/instructor/dashboard', methods=['GET'])
def get_dashboard_analytics():
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401
    
    if user_role not in ['instructor', 'admin']:
        return jsonify({"error": "Access Denied: Only the Instructor and Administrators can access this reporting view."}), 403
    
    target_course = request.args.get('course_id')
    requested_instructor_id = request.args.get('instructor_id')

    if user_role == 'instructor':
        instructor_id = user_id
    else:
        instructor_id = requested_instructor_id if requested_instructor_id else user_id

    if not instructor_id:
        return jsonify({"error": "Bad Request: Missing target instructor_id parameter."}), 400
    
    result = get_instructor_metrics(
        instructor_id=instructor_id,
        target_course_id=int(target_course) if target_course else None
    )

    if not result['success']:
        return jsonify({"error": result['error']}), 500
    
    return jsonify(result), 200


# Admin Platform Instructer and Student Management
@analytics.route('/admin/pending-instructors', methods=['GET'])
def list_pending_instructors():
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401
    
    if user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    result = get_pending_instructors()

    if not result['success']:
        return jsonify({"error": result['error']}), 500
    
    return jsonify({
        "success": True,
        "applications": result['applications']
    }), 200


@analytics.route('/admin/process-instructor', methods=['PUT'])
def process_instructor():
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id or user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    data = request.get_json() or {}
    is_valid, validation_errors = validate_approval_status(data)
    if not is_valid:
        return jsonify({"errors": validation_errors}), 400
    
    result = update_instructor_status(user_id=data['user_id'], status=data['status'])
    if not result['success']:
        return jsonify({"error": result['error']}), 400
    
    return jsonify({
        "message": f"Instructor application status updated to '{data['status']}' successfully.",
        "profile": result['profile']
    }), 200

















# Admin user controller
@analytics.route('/admin/students', methods=['GET'])
def admin_get_students():
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401

    if user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    result = get_all_students()
    if not result['success']:
        return jsonify({"error": result['error']}), 400

    return jsonify(result['data']), 200



@analytics.route('/admin/instructors', methods=['GET'])
def admin_get_instructor():
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401

    if user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    result = get_all_instructors()
    if not result['success']:
        return jsonify({"error": result['error']}), 400

    return jsonify(result['data']), 200



@analytics.route('/admin/students/<id>', methods=['DELETE'])
def admin_delete_student(id):
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401

    if user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    result = delete_user_by_admin(id)
    if not result['success']:
        return jsonify({"error": result['error']}), 400

    return jsonify({"message": "Student Account deleted successfully by administrator moderation override."}), 200



@analytics.route('/admin/instructors/<id>', methods=['DELETE'])
def admin_delete_instructors(id):
    user_id = session.get('user_id')
    user_role = session.get('user_role')

    if not user_id:
        return jsonify({"error": "Unauthenticated: No active session found."}), 401

    if user_role != 'admin':
        return jsonify({"error": "Access Denied: Administrative privileges required."}), 403
    
    result = delete_user_by_admin(id)
    if not result['success']:
        return jsonify({"error": result['error']}), 400

    return jsonify({"message": "Instructor Account deleted successfully by administrator moderation override."}), 200
