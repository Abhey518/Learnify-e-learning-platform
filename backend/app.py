from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS

# Import blueprints
from features.courses.routes import courses_bp
from features.enrollment.routes import enrollment_bp
from features.quiz.routes import quiz_bp
from features.forum.routes import forum_bp
from features.analytics.routes import analytics_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(courses_bp)
app.register_blueprint(enrollment_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(forum_bp)
app.register_blueprint(analytics_bp)

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
