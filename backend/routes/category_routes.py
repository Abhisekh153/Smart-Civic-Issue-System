from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db
from backend.routes.auth_routes import admin_required

category_bp = Blueprint('category_bp', __name__, url_prefix='/api/admin/categories')

@category_bp.route('', methods=['GET'])
def get_categories():
    """Retrieve all civic issue categories with complaint counts."""
    sql = """
        SELECT c.category_id, c.category_name, c.description, c.icon,
               COUNT(cmp.complaint_id) as complaint_count
        FROM categories c
        LEFT JOIN complaints cmp ON c.category_id = cmp.category_id
        GROUP BY c.category_id, c.category_name, c.description, c.icon
        ORDER BY c.category_id ASC
    """
    categories = query_db(sql)
    return jsonify({
        'success': True,
        'categories': categories
    }), 200

@category_bp.route('', methods=['POST'])
@admin_required
def create_category():
    """Add a new civic category."""
    data = request.get_json() or {}
    category_name = data.get('category_name', '').strip()
    description = data.get('description', '').strip()
    icon = data.get('icon', 'fa-triangle-exclamation').strip()

    if not category_name:
        return jsonify({'success': False, 'message': 'Category name is required.'}), 400

    existing = query_db("SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(%s)", (category_name,), one=True)
    if existing:
        return jsonify({'success': False, 'message': 'Category with this name already exists.'}), 409

    cat_id = execute_db(
        "INSERT INTO categories (category_name, description, icon) VALUES (%s, %s, %s)",
        (category_name, description, icon)
    )

    return jsonify({
        'success': True,
        'message': f'Category "{category_name}" created successfully.',
        'category_id': cat_id
    }), 201
