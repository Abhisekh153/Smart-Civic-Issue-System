import os
import sys
from pathlib import Path
from flask import Flask, send_from_directory, redirect, jsonify, session
from flask_cors import CORS

# Add root directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import Config
from backend.database import init_tables
from backend.routes.auth_routes import auth_bp
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.complaint_routes import complaint_bp
from backend.routes.citizen_routes import citizen_bp
from backend.routes.category_routes import category_bp
from backend.routes.report_routes import report_bp
from backend.routes.citizen_app_routes import citizen_app_bp

def create_app():
    app = Flask(__name__, static_folder=Config.FRONTEND_DIR, static_url_path='')
    app.config.from_object(Config)

    # Enable CORS for Flutter app and frontend clients
    CORS(app, supports_credentials=True)

    # Initialize Database Tables
    try:
        init_tables()
    except Exception as e:
        print(f"[App Init] Database check notice: {e}")

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(complaint_bp)
    app.register_blueprint(citizen_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(citizen_app_bp)

    # Route: Serve Uploaded Complaint Media
    @app.route('/uploads/complaints/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # Route: Root redirects to login or dashboard based on session
    @app.route('/')
    def root_route():
        if session.get('user_id') and session.get('role') == 'admin':
            return redirect('/dashboard.html')
        return redirect('/login.html')

    # Route: Serve Frontend HTML, CSS, JS assets
    @app.route('/<path:filename>')
    def serve_frontend(filename):
        target_path = os.path.join(Config.FRONTEND_DIR, filename)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            return send_from_directory(Config.FRONTEND_DIR, filename)
        return jsonify({'error': 'Page or resource not found', 'requested': filename}), 404

    # API Health Check
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'system': 'Smart Civic Issue Reporting System',
            'institution': 'Tezpur University'
        }), 200

    @app.errorhandler(404)
    def page_not_found(e):
        return jsonify({'error': 'Not Found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal Server Error'}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n* Smart Civic Issue Reporting System running at http://localhost:{port}/")
    print(f"* Admin Login URL: http://localhost:{port}/login.html\n")
    app.run(host='0.0.0.0', port=port, debug=True)
