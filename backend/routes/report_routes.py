import csv
import io
from flask import Blueprint, jsonify, Response
from backend.database import query_db
from backend.routes.auth_routes import admin_required

report_bp = Blueprint('report_bp', __name__, url_prefix='/api/admin/reports')

@report_bp.route('/stats', methods=['GET'])
@admin_required
def get_report_stats():
    """Retrieve comprehensive reporting and analytics data."""
    total = query_db("SELECT COUNT(*) as count FROM complaints", one=True)['count']
    resolved = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'", one=True)['count']
    pending = total - resolved
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    # Category stats
    cat_sql = """
        SELECT c.category_name, COUNT(cmp.complaint_id) as count
        FROM categories c
        LEFT JOIN complaints cmp ON c.category_id = cmp.category_id
        GROUP BY c.category_id, c.category_name
        ORDER BY count DESC
    """
    category_stats = query_db(cat_sql)

    # Status distribution
    status_sql = """
        SELECT status, COUNT(*) as count
        FROM complaints
        GROUP BY status
    """
    status_stats = query_db(status_sql)

    # Monthly trends (last 6 months or all records)
    monthly_sql = """
        SELECT strftime('%Y-%m', created_at) as month_period, COUNT(*) as count
        FROM complaints
        GROUP BY month_period
        ORDER BY month_period ASC
    """
    try:
        monthly_trends = query_db(monthly_sql)
    except Exception:
        # Fallback for MySQL DATE_FORMAT
        mysql_monthly = """
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month_period, COUNT(*) as count
            FROM complaints
            GROUP BY month_period
            ORDER BY month_period ASC
        """
        monthly_trends = query_db(mysql_monthly)

    return jsonify({
        'success': True,
        'summary': {
            'total': total,
            'resolved': resolved,
            'pending': pending,
            'resolution_rate': resolution_rate
        },
        'category_stats': category_stats,
        'status_stats': status_stats,
        'monthly_trends': monthly_trends
    }), 200

@report_bp.route('/export-csv', methods=['GET'])
@admin_required
def export_complaints_csv():
    """Generate and stream a CSV file containing all complaint records."""
    sql = """
        SELECT cmp.complaint_id, cmp.status, cmp.description, cmp.address,
               cmp.latitude, cmp.longitude, cmp.created_at, cmp.updated_at,
               u.name as citizen_name, u.email as citizen_email, u.phone as citizen_phone,
               cat.category_name
        FROM complaints cmp
        JOIN users u ON cmp.user_id = u.user_id
        JOIN categories cat ON cmp.category_id = cat.category_id
        ORDER BY cmp.created_at DESC
    """
    complaints = query_db(sql)

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write Header
    writer.writerow([
        'Complaint ID', 'Status', 'Category', 'Citizen Name', 'Citizen Email',
        'Citizen Phone', 'Address', 'Latitude', 'Longitude', 'Created At',
        'Updated At', 'Description'
    ])

    for c in complaints:
        writer.writerow([
            c['complaint_id'],
            c['status'],
            c['category_name'],
            c['citizen_name'],
            c['citizen_email'],
            c['citizen_phone'] or 'N/A',
            c['address'],
            c['latitude'] or '',
            c['longitude'] or '',
            c['created_at'],
            c['updated_at'],
            c['description']
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={
            'Content-Disposition': 'attachment; filename=smart_civic_complaints_report.csv',
            'Content-Type': 'text/csv; charset=utf-8'
        }
    )
