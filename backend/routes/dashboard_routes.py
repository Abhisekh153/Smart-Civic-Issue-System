from flask import Blueprint, jsonify
from backend.database import query_db
from backend.routes.auth_routes import admin_required

dashboard_bp = Blueprint('dashboard_bp', __name__, url_prefix='/api/admin/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Retrieve primary KPI counters calculated dynamically from database."""
    total = query_db("SELECT COUNT(*) as count FROM complaints", one=True)['count']
    submitted = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Submitted'", one=True)['count']
    under_review = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Under Review'", one=True)['count']
    in_progress = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'", one=True)['count']
    resolved = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'", one=True)['count']
    total_citizens = query_db("SELECT COUNT(*) as count FROM users WHERE role = 'citizen'", one=True)['count']

    return jsonify({
        'success': True,
        'stats': {
            'total': total,
            'submitted': submitted,
            'under_review': under_review,
            'in_progress': in_progress,
            'resolved': resolved,
            'total_citizens': total_citizens
        }
    }), 200

@dashboard_bp.route('/charts', methods=['GET'])
@admin_required
def get_dashboard_charts():
    """Retrieve chart aggregations for Category and Status distributions."""
    # Category Distribution
    cat_sql = """
        SELECT c.category_name, COUNT(cmp.complaint_id) as count
        FROM categories c
        LEFT JOIN complaints cmp ON c.category_id = cmp.category_id
        GROUP BY c.category_id, c.category_name
        ORDER BY count DESC
    """
    category_data = query_db(cat_sql)

    # Status Distribution
    status_sql = """
        SELECT status, COUNT(*) as count
        FROM complaints
        GROUP BY status
    """
    status_data = query_db(status_sql)

    return jsonify({
        'success': True,
        'category_chart': category_data,
        'status_chart': status_data
    }), 200

@dashboard_bp.route('/recent-complaints', methods=['GET'])
@admin_required
def get_recent_complaints():
    """Retrieve latest 6 complaints with citizen name and category."""
    sql = """
        SELECT cmp.complaint_id, cmp.description, cmp.status, cmp.address, cmp.created_at,
               u.name as citizen_name, u.email as citizen_email,
               cat.category_name, cat.icon as category_icon
        FROM complaints cmp
        JOIN users u ON cmp.user_id = u.user_id
        JOIN categories cat ON cmp.category_id = cat.category_id
        ORDER BY cmp.created_at DESC
        LIMIT 6
    """
    recent = query_db(sql)
    return jsonify({
        'success': True,
        'complaints': recent
    }), 200

@dashboard_bp.route('/activity', methods=['GET'])
@admin_required
def get_recent_activity():
    """Retrieve latest status transition activities and admin remarks."""
    sql = """
        SELECT h.history_id, h.complaint_id, h.old_status, h.new_status, h.admin_remark, h.updated_at,
               admin.name as admin_name,
               cat.category_name
        FROM status_history h
        JOIN users admin ON h.updated_by = admin.user_id
        JOIN complaints cmp ON h.complaint_id = cmp.complaint_id
        JOIN categories cat ON cmp.category_id = cat.category_id
        ORDER BY h.updated_at DESC
        LIMIT 8
    """
    activities = query_db(sql)
    return jsonify({
        'success': True,
        'activities': activities
    }), 200
