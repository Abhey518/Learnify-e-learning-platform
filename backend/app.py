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