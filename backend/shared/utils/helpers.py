def generate_id():
    import uuid
    return str(uuid.uuid4())

def format_response(data, message='Success', status=200):
    return {
        'status': status,
        'message': message,
        'data': data
    }

def format_error(error, status=400):
    return {
        'status': status,
        'message': str(error),
        'data': None
    }

def paginate(items, page=1, per_page=10):
    start = (page - 1) * per_page
    end = start + per_page
    return items[start:end]
