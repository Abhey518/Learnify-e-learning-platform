
# Course Review Pipeline
def validate_review_data(data):
    errors = {}
    course_id = data.get('course_id')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not course_id:
        errors['course_id'] = "Course ID is require"

    if rating is None:
        errors['rating'] = 'Rating score is required.'

    else:
        try:
            rating_int = int(rating)
            if rating_int < 1 or rating_int > 5:
                errors['rating'] =  'Rating must be an integer between 1 and 5.'
        except (ValueError, TypeError):
            errors['rating'] = 'Rating must be a valid integer number.'

    if comment and len(str(comment)) > 1000:
        errors['comment'] = 'Comment text cannot exceed 1000 characters.'

    return len(errors) == 0, errors


# Instructor Performance Metrics
def validate_dashboard_filters(args):
    errors = {}
    course_id = args.get('course_id')

    if course_id:
        try:
            int(course_id)
        except ValueError:
            errors['course_id'] = 'Course ID filter must be a valid integer.'
        
    return len(errors) == 0, errors


# Admin Platform Gatekeeper
def validate_approval_status(data):
    errors = {}
    status = data.get('status')
    user_id = data.get('user_id')

    if not user_id:
        errors['user_id'] = 'User ID is required to process an application.'

    ALLOWED_STATUS = ['approved', 'rejected']
    if not status or status not in ALLOWED_STATUS:
        errors['status'] = "Status must be explicitly set to either 'approved' or 'rejected'."

    return len(errors) == 0, errors