import os
from flask import Flask
from flask_cors import CORS
from features.registration.routes import auth
from features.analytics.routes import analytics
from features.courses.routes import courses_bp
from features.enrollment.routes import enrollment_bp
from features.forum.routes import forum_bp
from features.quiz.routes import quiz_bp


app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-fallback-key-replace-in-production')

app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(analytics, url_prefix='/api')
app.register_blueprint(courses_bp)
app.register_blueprint(enrollment_bp)
app.register_blueprint(forum_bp)
app.register_blueprint(quiz_bp)



@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 20

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
