from functools import wraps
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from backend.database import query_db

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/admin')

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        role = session.get('role')
        if not user_id or role != 'admin':
            return jsonify({'success': False, 'message': 'Unauthorized: Admin authentication required.'}), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = query_db("SELECT * FROM users WHERE LOWER(email) = %s", (email,), one=True)
    if not user:
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    if user['role'] != 'admin':
        return jsonify({'success': False, 'message': 'Access restricted: Administrator role required.'}), 403

    if not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    # Session storage
    session['user_id'] = user['user_id']
    session['role'] = user['role']
    session['name'] = user['name']
    session['email'] = user['email']
    session.permanent = True

    return jsonify({
        'success': True,
        'message': 'Admin login successful.',
        'user': {
            'user_id': user['user_id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def admin_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Successfully logged out.'}), 200

@auth_bp.route('/me', methods=['GET'])
def admin_me():
    user_id = session.get('user_id')
    role = session.get('role')
    if not user_id or role != 'admin':
        return jsonify({'success': False, 'authenticated': False}), 401

    user = query_db("SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = %s", (user_id,), one=True)
    if not user:
        session.clear()
        return jsonify({'success': False, 'authenticated': False}), 401

    return jsonify({
        'success': True,
        'authenticated': True,
        'user': user
    }), 200
