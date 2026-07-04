import os
from flask import Flask, jsonify
from flask_cors import CORS
from features.registration.routes import auth
from features.analytics.routes import analytics
from features.courses.routes import courses_bp
from features.quiz.routes import quiz_bp


app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-fallback-key-replace-in-production')

app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(analytics, url_prefix='/api')
app.register_blueprint(courses_bp)
app.register_blueprint(quiz_bp, url_prefix='/api')


@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 20
  
  
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.route('/routes')
def list_routes():
    output = []
    for rule in app.url_map.iter_rules():
        output.append(f"{rule.endpoint}: {rule.rule}")
    return jsonify({"active_routes": output})

@app.route('/')
def index():
    return "Learnify Backend is Running Successfully!"
  

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

