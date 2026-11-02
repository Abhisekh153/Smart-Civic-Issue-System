import os
import sys
from pathlib import Path
from werkzeug.security import generate_password_hash

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import Config
from backend.database import init_tables, query_db, execute_db

def create_sample_images():
    """Create sample complaint demonstration images if they don't exist."""
    upload_dir = Config.UPLOAD_FOLDER
    os.makedirs(upload_dir, exist_ok=True)
    
    sample_files = {
        'pothole_gate1.jpg': 'Road Damage - Pothole near Gate 1',
        'garbage_hostel.jpg': 'Garbage overflow near Hostel Block',
        'drainage_overflow.jpg': 'Blocked Drainage near Academic Complex',
        'streetlight_avenue.jpg': 'Broken Streetlight near Library Rd',
        'water_leak.jpg': 'Water Supply Pipe Leakage'
    }
    
    # We will write lightweight valid JPEG/SVG or minimalist image representation
    # Creating valid dummy PNG files for instant preview
    # Simple 1x1 or SVG/data url mock
    svg_template = """<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#1e293b"/>
  <rect x="20" y="20" width="560" height="360" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="300" cy="150" r="45" fill="#0284c7" opacity="0.8"/>
  <path d="M285 150 L295 160 L315 140" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>
  <text x="300" y="230" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#f8fafc" text-anchor="middle">{title}</text>
  <text x="300" y="260" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Smart Civic Issue Reporting System - Tezpur University</text>
  <text x="300" y="320" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Photo Evidence Captured via Citizen Mobile App</text>
</svg>"""

    for filename, title in sample_files.items():
        filepath = os.path.join(upload_dir, filename)
        if not os.path.exists(filepath):
            # Write svg or compatible image
            # Since browsers render images, let's also write an .svg version and fallback
            svg_path = filepath.replace('.jpg', '.svg')
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(svg_template.format(title=title))
            # Also write same bytes to .jpg so path works directly in <img> tags
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(svg_template.format(title=title))

def seed_database():
    """Initializes tables and seeds users, categories, and initial complaints."""
    print("=" * 60)
    print("Seeding Smart Civic Issue Reporting System Database...")
    print("=" * 60)
    
    init_tables()
    create_sample_images()
    
    # 1. Seed Categories
    categories = [
        ("Road Damage / Potholes", "Damaged asphalt, deep potholes, uneven road surfaces hindering traffic.", "fa-road"),
        ("Garbage and Waste Management", "Uncollected garbage, overflowing public waste bins, open dumpsites.", "fa-trash-can"),
        ("Drainage Problems", "Blocked culverts, overflowing storm drains, stagnant water clogging walkways.", "fa-water"),
        ("Broken Streetlights", "Flickering or unlit lampposts, exposed wiring, non-functional lighting poles.", "fa-lightbulb"),
        ("Water Supply Problems", "Pipeline bursts, low water pressure, contaminated supply or valve failure.", "fa-faucet-drip")
    ]
    
    for name, desc, icon in categories:
        existing = query_db("SELECT category_id FROM categories WHERE category_name = %s", (name,), one=True)
        if not existing:
            execute_db(
                "INSERT INTO categories (category_name, description, icon) VALUES (%s, %s, %s)",
                (name, desc, icon)
            )
            print(f"[Category Added] {name}")
    
    # 2. Seed Users
    # Default Admin
    admin_email = "admin@tezu.ac.in"
    existing_admin = query_db("SELECT user_id FROM users WHERE email = %s", (admin_email,), one=True)
    if not existing_admin:
        admin_pass_hash = generate_password_hash("AdminPassword123")
        admin_id = execute_db(
            """INSERT INTO users (name, email, phone, password_hash, role)
               VALUES (%s, %s, %s, %s, %s)""",
            ("Campus Municipal Administrator", admin_email, "+91 3712 267001", admin_pass_hash, "admin")
        )
        print(f"[Admin Created] {admin_email} (ID: {admin_id})")
    else:
        admin_id = existing_admin['user_id']
        print(f"[Admin Exists] {admin_email} (ID: {admin_id})")
        
    # Sample Citizens
    citizens_data = [
        ("Rahul Sharma", "rahul.sharma@gmail.com", "+91 98640 12345", "Student, Dept of CSE"),
        ("Priya Das", "priya.das@gmail.com", "+91 94350 67890", "Research Scholar, Env Science"),
        ("Anup Baruah", "anup.baruah@gmail.com", "+91 97060 54321", "Resident, Staff Quarters"),
        ("Snigdha Kalita", "snigdha.kalita@gmail.com", "+91 98540 98765", "Student, Dept of MCA")
    ]
    
    citizen_ids = []
    for name, email, phone, _ in citizens_data:
        existing_citizen = query_db("SELECT user_id FROM users WHERE email = %s", (email,), one=True)
        if not existing_citizen:
            cit_hash = generate_password_hash("CitizenPass123")
            cid = execute_db(
                """INSERT INTO users (name, email, phone, password_hash, role)
                   VALUES (%s, %s, %s, %s, %s)""",
                (name, email, phone, cit_hash, "citizen")
            )
            citizen_ids.append(cid)
            print(f"[Citizen Created] {name} ({email})")
        else:
            citizen_ids.append(existing_citizen['user_id'])

    # 3. Seed Sample Complaints
    cat_map = {c['category_name']: c['category_id'] for c in query_db("SELECT category_id, category_name FROM categories")}
    
    sample_complaints = [
        {
            "user_id": citizen_ids[0],
            "category_id": cat_map.get("Road Damage / Potholes", 1),
            "description": "Large deep pothole formed right in front of University Main Gate 1 after recent heavy monsoon rains. Vehicles are swerving abruptly causing accident risks.",
            "image_path": "uploads/complaints/pothole_gate1.jpg",
            "latitude": 26.700650,
            "longitude": 92.830620,
            "address": "Near Main Gate 1, Tezpur University Campus, Napaam, Tezpur",
            "status": "In Progress"
        },
        {
            "user_id": citizen_ids[1],
            "category_id": cat_map.get("Garbage and Waste Management", 2),
            "description": "Solid waste bin overflowing near Nilachal Men's Hostel dining hall road. Stray cattle and dogs are scattering plastics across the lawn.",
            "image_path": "uploads/complaints/garbage_hostel.jpg",
            "latitude": 26.702510,
            "longitude": 92.834050,
            "address": "Opposite Nilachal Men's Hostel, East Campus, Tezpur University",
            "status": "Submitted"
        },
        {
            "user_id": citizen_ids[2],
            "category_id": cat_map.get("Drainage Problems", 3),
            "description": "Culvert drain is completely blocked by silt and dry branches causing rainwater backflow on the pathway between Academic Complex and Dean's office.",
            "image_path": "uploads/complaints/drainage_overflow.jpg",
            "latitude": 26.704020,
            "longitude": 92.829040,
            "address": "Pathway between Academic Building 1 and Dean Office, Tezpur University",
            "status": "Under Review"
        },
        {
            "user_id": citizen_ids[3],
            "category_id": cat_map.get("Broken Streetlights", 4),
            "description": "Three continuous high-mast LED street lamps have been non-functional for past 4 days, causing total darkness on the library connecting walkway at night.",
            "image_path": "uploads/complaints/streetlight_avenue.jpg",
            "latitude": 26.699030,
            "longitude": 92.831510,
            "address": "Central Library Avenue Rd, Tezpur University, Napaam",
            "status": "Resolved"
        },
        {
            "user_id": citizen_ids[0],
            "category_id": cat_map.get("Water Supply Problems", 5),
            "description": "Underground potable water supply pipeline joint is leaking near the main pump station, leading to low water pressure in department washrooms.",
            "image_path": "uploads/complaints/water_leak.jpg",
            "latitude": 26.701550,
            "longitude": 92.832280,
            "address": "Water Treatment & Supply Unit 2, Near Central Stores, Napaam",
            "status": "In Progress"
        },
        {
            "user_id": citizen_ids[2],
            "category_id": cat_map.get("Road Damage / Potholes", 1),
            "description": "Severe asphalt erosion and bitumen depression on the approach bridge connecting Mission Chariali with Tezpur town.",
            "image_path": "uploads/complaints/pothole_gate1.jpg",
            "latitude": 26.654210,
            "longitude": 92.793540,
            "address": "Mission Chariali Junction Road, Tezpur, Assam 784001",
            "status": "Submitted"
        },
        {
            "user_id": citizen_ids[1],
            "category_id": cat_map.get("Garbage and Waste Management", 2),
            "description": "Commercial vegetable waste and plastic bags dumping without clearance at Tezpur Chowk Bazar intersection.",
            "image_path": "uploads/complaints/garbage_hostel.jpg",
            "latitude": 26.626810,
            "longitude": 92.795820,
            "address": "Chowk Bazaar Main Road, Tezpur Urban Center, Assam",
            "status": "Resolved"
        }
    ]
    
    # Check if complaints already seeded
    existing_complaints = query_db("SELECT COUNT(*) as count FROM complaints", one=True)
    if existing_complaints and existing_complaints['count'] == 0:
        for comp in sample_complaints:
            cid = execute_db(
                """INSERT INTO complaints 
                   (user_id, category_id, description, image_path, latitude, longitude, address, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (comp['user_id'], comp['category_id'], comp['description'], comp['image_path'],
                 comp['latitude'], comp['longitude'], comp['address'], comp['status'])
            )
            print(f"[Complaint Created] ID: {cid} | Status: {comp['status']} | {comp['address']}")
            
            # Initial history
            execute_db(
                """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
                   VALUES (%s, %s, %s, %s, %s)""",
                (cid, 'None', 'Submitted', 'Complaint submitted via citizen portal.', admin_id)
            )
            
            # If status progressed, add realistic audit entry
            if comp['status'] == 'Under Review':
                execute_db(
                    """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (cid, 'Submitted', 'Under Review', 'Verified by campus civil engineering cell. Site inspection dispatched.', admin_id)
                )
            elif comp['status'] == 'In Progress':
                execute_db(
                    """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (cid, 'Submitted', 'Under Review', 'Inspection complete. Work order issued.', admin_id)
                )
                execute_db(
                    """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (cid, 'Under Review', 'In Progress', 'Repair contractor team is deployed on site. Heavy machinery in operation.', admin_id)
                )
            elif comp['status'] == 'Resolved':
                execute_db(
                    """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (cid, 'Submitted', 'In Progress', 'Field technicians assigned directly.', admin_id)
                )
                execute_db(
                    """INSERT INTO status_history (complaint_id, old_status, new_status, admin_remark, updated_by)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (cid, 'In Progress', 'Resolved', 'Issue successfully rectified, tested, and confirmed clear by estate office.', admin_id)
                )
        print("[Complaints Seeded Successfully]")
    else:
        print("[Notice] Complaints table already populated. Skipping insert.")

    print("=" * 60)
    print("Database initialization & seeding complete!")
    print(f"Default Admin Login: {admin_email} | Password: AdminPassword123")
    print("=" * 60)

if __name__ == '__main__':
    seed_database()
