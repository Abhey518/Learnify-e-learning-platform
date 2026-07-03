import os
from flask import Flask
from flask_cors import CORS

# Import blueprints
from features.registration.routes import auth # rename this later as auth_bp
from features.courses.routes import courses_bp
#from features.enrollment.routes import enrollment_bp
#from features.quiz.routes import quiz_bp
#from features.forum.routes import forum_bp
#from features.analytics.routes import analytics_bp

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-fallback-key-replace-in-production')

# Register blueprints
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(courses_bp) # url prefix is already defined in the blueprint itself

#app.register_blueprint(enrollment_bp, url_prefix='/api/enrollment')
#app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
#app.register_blueprint(forum_bp, url_prefix='/api/forum')
#app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
