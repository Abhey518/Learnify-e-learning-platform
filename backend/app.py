import os
from flask import Flask
from flask_cors import CORS
from features.registration.routes import auth


app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-fallback-key-replace-in-production')

app.register_blueprint(auth, url_prefix='/auth')

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
