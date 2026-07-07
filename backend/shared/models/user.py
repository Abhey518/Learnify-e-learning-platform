from datetime import datetime

class User:
    def __init__(self, id, email, name, role, created_at=None):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at,
        }
