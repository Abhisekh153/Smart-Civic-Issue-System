from flask import Blueprint, request, jsonify, session
from backend.database import query_db, execute_db
from backend.routes.auth_routes import admin_required

complaint_bp = Blueprint('complaint_bp', __name__, url_prefix='/api/admin/complaints')

VALID_STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved']

@complaint_bp.route('', methods=['GET'])
@admin_required
def get_complaints():
    """
    Search, filter, sort, and paginate complaints.
    Query parameters:
    - search: string (matches complaint_id, citizen name, or address)
    - category_id: integer
    - status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved'
    - sort: 'newest' | 'oldest'
    """
    search = request.args.get('search', '').strip()
    category_id = request.args.get('category_id', '').strip()
    status = request.args.get('status', '').strip()
    sort = request.args.get('sort', 'newest').strip()

    where_clauses = ["1=1"]
    params = []

    if search:
        where_clauses.append("(cmp.complaint_id = %s OR u.name LIKE %s OR cmp.address LIKE %s OR cmp.description LIKE %s)")
        # If numeric search matches ID directly
        id_search = int(search) if search.isdigit() else -1
        search_like = f"%{search}%"
        params.extend([id_search, search_like, search_like, search_like])

    if category_id and category_id != 'all':
        where_clauses.append("cmp.category_id = %s")
        params.append(category_id)

    if status and status != 'all':
        where_clauses.append("cmp.status = %s")
        params.append(status)

    order_by = "cmp.created_at ASC" if sort == 'oldest' else "cmp.created_at DESC"

    where_str = " AND ".join(where_clauses)
    sql = f"""
        SELECT cmp.complaint_id, cmp.user_id, cmp.category_id, cmp.description,
               cmp.image_path, cmp.latitude, cmp.longitude, cmp.address,
               cmp.status, cmp.created_at, cmp.updated_at,
               u.name as citizen_name, u.email as citizen_email, u.phone as citizen_phone,
               cat.category_name, cat.icon as category_icon
        FROM complaints cmp
        JOIN users u ON cmp.user_id = u.user_id
        JOIN categories cat ON cmp.category_id = cat.category_id
        WHERE {where_str}
        ORDER BY {order_by}
    """

    complaints = query_db(sql, tuple(params))
    return jsonify({
        'success': True,
        'count': len(complaints),
        'complaints': complaints
    }), 200

@complaint_bp.route('/locations', methods=['GET'])
@admin_required
def get_complaint_locations():
    """Retrieve all complaints with valid geographic coordinates for Leaflet maps."""
    sql = """
        SELECT cmp.complaint_id, cmp.latitude, cmp.longitude, cmp.address,
               cmp.status, cmp.description, cmp.image_path, cmp.created_at,
               u.name as citizen_name,
               cat.category_name, cat.icon as category_icon
        FROM complaints cmp
        JOIN users u ON cmp.user_id = u.user_id
        JOIN categories cat ON cmp.category_id = cat.category_id
        WHERE cmp.latitude IS NOT NULL AND cmp.longitude IS NOT NULL
        ORDER BY cmp.created_at DESC
    """
    locations = query_db(sql)
    return jsonify({
        'success': True,
        'locations': locations
    }), 200

@complaint_bp.route('/<int:complaint_id>', methods=['GET'])
@admin_required
def get_complaint_detail(complaint_id):
    """Retrieve complete details for a single civic complaint."""
    sql = """
        SELECT cmp.complaint_id, cmp.user_id, cmp.category_id, cmp.description,
               cmp.image_path, cmp.latitude, cmp.longitude, cmp.address,
               cmp.status, cmp.created_at, cmp.updated_at,
               u.name as citizen_name, u.email as citizen_email, u.phone as citizen_phone,
               cat.category_name, cat.description as category_description, cat.icon as category_icon
        FROM complaints cmp
        JOIN users u ON cmp.user_id = u.user_id
        JOIN categories cat ON cmp.category_id = cat.category_id
        WHERE cmp.complaint_id = %s
    """
    complaint = query_db(sql, (complaint_id,), one=True)
    if not complaint:
        return jsonify({'success': False, 'message': f'Complaint #{complaint_id} not found.'}), 404

    # Fetch status history for this complaint
    history_sql = """
        SELECT h.history_id, h.old_status, h.new_status, h.admin_remark, h.updated_at,
               admin.name as updated_by_name, admin.email as updated_by_email
        FROM status_history h
        JOIN users admin ON h.updated_by = admin.user_id
        WHERE h.complaint_id = %s
        ORDER BY h.updated_at ASC
    """
    history = query_db(history_sql, (complaint_id,))

    return jsonify({
        'success': True,
        'complaint': complaint,
        'history': history
    }), 200

@complaint_bp.route('/<int:complaint_id>/status', methods=['POST'])
@admin_required
def update_complaint_status(complaint_id):
    """
    Update complaint status, write audit record into status_history with remark.
    """
    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    admin_remark = data.get('remark', '').strip()

    if not new_status:
        return jsonify({'success': False, 'message': 'New status is required.'}), 400

    if new_status not in VALID_STATUSES:
        return jsonify({'success': False, 'message': f'Invalid status. Allowed values: {", ".join(VALID_STATUSES)}'}), 400

    complaint = query_db("SELECT status FROM complaints WHERE complaint_id = %s", (complaint_id,), one=True)
    if not complaint:
        return jsonify({'success': False, 'message': f'Complaint #{complaint_id} not found.'}), 404

    old_status = complaint['status']
    admin_id = session.get('user_id')

    if not admin_remark:
        admin_remark = f"Status updated to {new_status} by administrator."

    # Update complaint status
    execute_db(
        "UPDATE complaints SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = %s",
        (new_status, complaint_id)
    )

    # Insert status audit record
    history_id = execute_db(
        """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
           VALUES (%s, %s, %s, %s, %s)""",
        (complaint_id, old_status, new_status, admin_remark, admin_id)
    )

    return jsonify({
        'success': True,
        'message': f'Complaint #{complaint_id} status successfully updated to "{new_status}".',
        'history_id': history_id,
        'old_status': old_status,
        'new_status': new_status
    }), 200

@complaint_bp.route('/<int:complaint_id>/history', methods=['GET'])
@admin_required
def get_complaint_history(complaint_id):
    """Retrieve full audit timeline for a specific complaint."""
    sql = """
        SELECT h.history_id, h.complaint_id, h.old_status, h.new_status, h.admin_remark, h.updated_at,
               admin.name as updated_by_name, admin.email as updated_by_email
        FROM status_history h
        JOIN users admin ON h.updated_by = admin.user_id
        WHERE h.complaint_id = %s
        ORDER BY h.updated_at ASC
    """
    history = query_db(sql, (complaint_id,))
    return jsonify({
        'success': True,
        'history': history
    }), 200
