<<<<<<< HEAD
from flask import Flask, jsonify
from flask_cors import CORS
# Import the quiz blueprint from your features folder
from features.quiz.routes import quiz_bp

# 1. Create the explicit Flask application instance named 'app'
app = Flask(__name__)

# 2. Configure CORS to allow all origins and handles OPTIONS preflight globally
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 3. Register the blueprint with the /api prefix
app.register_blueprint(quiz_bp, url_prefix='/api')

# Debug route to verify active endpoints
@app.route('/routes')
def list_routes():
    output = []
    for rule in app.url_map.iter_rules():
        output.append(f"{rule.endpoint}: {rule.rule}")
    return jsonify({"active_routes": output})

@app.route('/')
def index():
    return "Learnify Backend is Running Successfully!"

# 4. Standard entry point execution block
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
=======
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
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059
