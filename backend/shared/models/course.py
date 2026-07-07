from datetime import datetime

class Course:
    def __init__(self, id, title, description, instructor_id, created_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.instructor_id = instructor_id
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'instructor_id': self.instructor_id,
            'created_at': self.created_at,
        }
