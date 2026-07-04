from datetime import datetime

class Progress:
    def __init__(self, id, user_id, course_id, completion_percentage, updated_at=None):
        self.id = id
        self.user_id = user_id
        self.course_id = course_id
        self.completion_percentage = completion_percentage
        self.updated_at = updated_at or datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'completion_percentage': self.completion_percentage,
            'updated_at': self.updated_at,
        }
