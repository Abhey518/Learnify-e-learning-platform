# ==============================================================================
# Learnify - A Comprehensive Learning Management System
# 
# Developed by:
#   - Srirajitha.S
#   - Thennakoon T M B M
#   - Lathinka R W I (ishadi)
#   - Abeywardhana H H A P
#   - Insifa M.F
# 
# Bachelor of Information and Communication Technology (BICT)
# Software System Specialization
# Faculty of Computing and Technology, University of Kelaniya - Sri Lanka
# 
# Project developed for:
#   3rd Year - Software Architecture and Concepts
# 
# Copyright (C) 2026. All rights reserved.
# ==============================================================================
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.
# ==============================================================================




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
