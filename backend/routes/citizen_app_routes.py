import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from backend.config import Config
from backend.database import query_db, execute_db

citizen_app_bp = Blueprint('citizen_app_bp', __name__, url_prefix='/api/citizen')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@citizen_app_bp.route('/register', methods=['POST'])
def register_citizen():
    """Citizen registration endpoint for the Flutter mobile application."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400

    existing = query_db("SELECT user_id FROM users WHERE LOWER(email) = %s", (email,), one=True)
    if existing:
        return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 409

    pass_hash = generate_password_hash(password)
    user_id = execute_db(
        """INSERT INTO users (name, email, phone, password_hash, role)
           VALUES (%s, %s, %s, %s, 'citizen')""",
        (name, email, phone, pass_hash)
    )

    return jsonify({
        'success': True,
        'message': 'Citizen account created successfully.',
        'user': {
            'user_id': user_id,
            'name': name,
            'email': email,
            'phone': phone,
            'role': 'citizen'
        }
    }), 201

@citizen_app_bp.route('/login', methods=['POST'])
def login_citizen():
    """Citizen login endpoint for Flutter mobile application."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = query_db("SELECT * FROM users WHERE LOWER(email) = %s AND role = 'citizen'", (email,), one=True)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid citizen credentials.'}), 401

    return jsonify({
        'success': True,
        'message': 'Citizen login successful.',
        'user': {
            'user_id': user['user_id'],
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'role': user['role']
        }
    }), 200

@citizen_app_bp.route('/complaints', methods=['POST'])
def submit_complaint():
    """
    Endpoint for citizens to submit a civic issue via mobile app.
    Accepts multipart/form-data or json.
    Handles image photo file upload.
    """
    user_id = request.form.get('user_id')
    category_id = request.form.get('category_id')
    description = request.form.get('description', '').strip()
    address = request.form.get('address', '').strip()
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')

    # Also handle JSON if sent as payload
    if not user_id and request.is_json:
        data = request.get_json() or {}
        user_id = data.get('user_id')
        category_id = data.get('category_id')
        description = data.get('description', '').strip()
        address = data.get('address', '').strip()
        latitude = data.get('latitude')
        longitude = data.get('longitude')

    if not user_id or not category_id or not description or not address:
        return jsonify({'success': False, 'message': 'Missing required fields (user_id, category_id, description, address).'}), 400

    # Image upload processing
    image_rel_path = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            ext = secure_filename(file.filename).rsplit('.', 1)[1].lower()
            unique_name = f"comp_{uuid.uuid4().hex[:12]}.{ext}"
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            saved_full_path = os.path.join(Config.UPLOAD_FOLDER, unique_name)
            file.save(saved_full_path)
            image_rel_path = f"uploads/complaints/{unique_name}"

    complaint_id = execute_db(
        """INSERT INTO complaints 
           (user_id, category_id, description, image_path, latitude, longitude, address, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, 'Submitted')""",
        (user_id, category_id, description, image_rel_path, latitude, longitude, address)
    )

    # Initial history entry
    execute_db(
        """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
           VALUES (%s, 'None', 'Submitted', 'Complaint submitted via Citizen Mobile App.', %s)""",
        (complaint_id, user_id)
    )

    return jsonify({
        'success': True,
        'message': 'Complaint submitted successfully.',
        'complaint_id': complaint_id,
        'status': 'Submitted'
    }), 201

@citizen_app_bp.route('/complaints/user/<int:user_id>', methods=['GET'])
def get_user_complaints(user_id):
    """Fetch all complaints submitted by a specific citizen."""
    sql = """
        SELECT cmp.complaint_id, cmp.category_id, cmp.description, cmp.image_path,
               cmp.latitude, cmp.longitude, cmp.address, cmp.status,
               cmp.created_at, cmp.updated_at,
               cat.category_name, cat.icon as category_icon
        FROM complaints cmp
        JOIN categories cat ON cmp.category_id = cat.category_id
        WHERE cmp.user_id = %s
        ORDER BY cmp.created_at DESC
    """
    complaints = query_db(sql, (user_id,))
    return jsonify({
        'success': True,
        'complaints': complaints
    }), 200

@citizen_app_bp.route('/complaints/<int:complaint_id>/track', methods=['GET'])
def track_complaint(complaint_id):
    """Allows a citizen to track real-time resolution progress and remarks."""
    complaint = query_db(
        """SELECT cmp.*, cat.category_name, cat.icon as category_icon
           FROM complaints cmp
           JOIN categories cat ON cmp.category_id = cat.category_id
           WHERE cmp.complaint_id = %s""",
        (complaint_id,),
        one=True
    )
    if not complaint:
        return jsonify({'success': False, 'message': 'Complaint not found.'}), 404

    history = query_db(
        """SELECT old_status, new_status, admin_remark, updated_at
           FROM status_history
           WHERE complaint_id = %s
           ORDER BY updated_at ASC""",
        (complaint_id,)
    )

    return jsonify({
        'success': True,
        'complaint': complaint,
        'timeline': history
    }), 200
