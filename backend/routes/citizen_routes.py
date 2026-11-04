from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from backend.database import query_db, execute_db
from backend.routes.auth_routes import admin_required

citizen_bp = Blueprint('citizen_bp', __name__, url_prefix='/api/admin/citizens')

@citizen_bp.route('', methods=['GET'])
@admin_required
def get_citizens():
    """
    Retrieve registered citizens with aggregated complaint count and search capability.
    Passwords are never returned.
    """
    search = request.args.get('search', '').strip()
    
    where_sql = "WHERE u.role = 'citizen'"
    params = []
    
    if search:
        where_sql += " AND (u.name LIKE %s OR u.email LIKE %s OR u.phone LIKE %s)"
        like_search = f"%{search}%"
        params.extend([like_search, like_search, like_search])

    sql = f"""
        SELECT u.user_id, u.name, u.email, u.phone, u.created_at,
               COUNT(cmp.complaint_id) as total_complaints,
               SUM(CASE WHEN cmp.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_complaints,
               SUM(CASE WHEN cmp.status IN ('Submitted', 'Under Review', 'In Progress') THEN 1 ELSE 0 END) as pending_complaints
        FROM users u
        LEFT JOIN complaints cmp ON u.user_id = cmp.user_id
        {where_sql}
        GROUP BY u.user_id, u.name, u.email, u.phone, u.created_at
        ORDER BY u.created_at DESC
    """
    citizens = query_db(sql, tuple(params))
    return jsonify({
        'success': True,
        'count': len(citizens),
        'citizens': citizens
    }), 200

@citizen_bp.route('/<int:user_id>', methods=['GET'])
@admin_required
def get_citizen_detail(user_id):
    """Retrieve detailed citizen record and all complaints submitted by this citizen."""
    citizen = query_db(
        "SELECT user_id, name, email, phone, created_at FROM users WHERE user_id = %s AND role = 'citizen'",
        (user_id,),
        one=True
    )
    if not citizen:
        return jsonify({'success': False, 'message': 'Citizen not found.'}), 404

    # Fetch citizen's complaints
    sql = """
        SELECT cmp.complaint_id, cmp.description, cmp.status, cmp.address,
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
        'citizen': citizen,
        'complaints': complaints,
        'complaints_count': len(complaints)
    }), 200

@citizen_bp.route('', methods=['POST'])
@admin_required
def create_citizen_by_admin():
    """Allows an administrator to register a citizen directly from the admin panel."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', 'CitizenPass123')

    if not name or not email:
        return jsonify({'success': False, 'message': 'Name and email are required.'}), 400

    existing = query_db("SELECT user_id FROM users WHERE LOWER(email) = %s", (email,), one=True)
    if existing:
        return jsonify({'success': False, 'message': 'A user with this email already exists.'}), 409

    pass_hash = generate_password_hash(password)
    user_id = execute_db(
        """INSERT INTO users (name, email, phone, password_hash, role)
           VALUES (%s, %s, %s, %s, 'citizen')""",
        (name, email, phone, pass_hash)
    )

    return jsonify({
        'success': True,
        'message': f'Citizen "{name}" successfully registered.',
        'user_id': user_id
    }), 201
