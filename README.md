# Smart Civic Issue Reporting System
### Web-Based Admin Dashboard & Municipal Complaint Management System
**Tezpur University Minor Project &bull; Master of Computer Applications (MCA)**

---

## 📌 Project Overview

The **Smart Civic Issue Reporting System** is a full-stack, responsive municipal governance platform designed for university campuses and urban administrative authorities (Tezpur University / Tezpur Municipal Board). 

While citizens register and lodge geo-tagged grievances via a mobile application (developed in Flutter), this **Web-Based Admin Dashboard** provides municipal engineers and campus administrators with an enterprise console to:
1. **Monitor & Audit** real-time civic issues across categories (Road Damage, Garbage & Waste, Drainage, Streetlights, Water Supply).
2. **Inspect Evidence** with photo previews and pinpoint geospatial coordinates.
3. **Interactive GIS Mapping** powered by **Leaflet.js & OpenStreetMap** with color-coded status pins.
4. **Enforce Resolution Workflows** (Submitted &rarr; Under Review &rarr; In Progress &rarr; Resolved) with mandatory administrative remarks and an immutable audit timeline.
5. **Manage Citizen Records** with full privacy protection (no plain-text passwords stored or exposed).
6. **Analyze Reporting Trends** via interactive **Chart.js** data visualizations and one-click **CSV data exports**.

---

## 🛠 Technology Stack

- **Backend:** Python Flask 3.0 (RESTful Architecture, Session Authentication, Blueprint Routing)
- **Database:** MySQL 8.0 (InnoDB, Foreign Key Constraints, Indexes, Parameterized Queries) with automated fallback to SQLite for zero-config evaluation.
- **Frontend:** HTML5, CSS3, Modern JavaScript (Vanilla ES6+ - lightweight, modular, no complex build frameworks needed)
- **Mapping:** Leaflet.js 1.9 & OpenStreetMap (Open-source, no paid API keys required)
- **Charts:** Chart.js 4.4 (Doughnut, Bar, Pie, and Curved Line charts)
- **Icons & Typography:** Font Awesome 6, Google Fonts Inter
- **Security:** `werkzeug.security` scrypt password hashing, session cookies, input sanitization, file extension checks.

---

## 📂 Project Architecture

```
Smart-Civic-Issue-System/
│
├── backend/
│   ├── app.py                     # Main Flask entrypoint, Blueprint registry & static serving
│   ├── config.py                  # Database and server configuration
│   ├── database.py                # Database interface with connection pooling & parameterized queries
│   ├── seed_db.py                 # Schema builder & realistic Tezpur campus dataset seeder
│   ├── requirements.txt           # Python dependencies
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py         # Admin login, logout & session checks
│   │   ├── dashboard_routes.py    # Live KPI stats, chart datasets, recent activity stream
│   │   ├── complaint_routes.py    # Search, filter, inspect, update status & audit history
│   │   ├── citizen_routes.py      # Citizen directory & submission history
│   │   ├── category_routes.py     # Civic category management
│   │   ├── report_routes.py       # Metrics aggregation & streaming CSV download
│   │   └── citizen_app_routes.py  # Future-ready citizen endpoints (for Flutter mobile app)
│   └── uploads/
│       └── complaints/            # Secure storage directory for complaint photos
│
├── admin_dashboard/               # Modern, responsive Admin Console
│   ├── index.html                 # Entry redirect
│   ├── login.html                 # Admin login with password toggle & demo autofill
│   ├── dashboard.html             # High-level overview, statistics cards & charts
│   ├── complaints.html            # Searchable, filterable complaint registry & campus map modal
│   ├── complaint-details.html     # Detailed complaint view, photo zoom, Leaflet map & status updater
│   ├── citizens.html              # Registered citizens directory & submission drawer
│   ├── reports.html               # Statistical charts & CSV export
│   ├── css/
│   │   └── style.css              # Custom styling (civic blue theme, cards, tables, badges)
│   ├── js/
│   │   ├── api.js                 # Centralized fetch wrapper, session auth & toast alerts
│   │   ├── auth.js                # Login submission & form validation
│   │   ├── dashboard.js           # Dashboard statistics & Chart.js rendering
│   │   ├── complaints.js          # Complaint table filtering, search & Leaflet map modal
│   │   ├── complaint-details.js   # Leaflet map pin, status update & audit timeline
│   │   ├── citizens.js            # Citizen table & modal submissions
│   │   └── reports.js             # Reports charts & CSV export controller
│   └── assets/                    # Sample evidence media & placeholders
│
├── database/
│   ├── schema.sql                 # MySQL schema DDL
│   └── seed.sql                   # MySQL raw seed dataset
│
├── test_system.py                 # Automated 17-point verification test suite
├── .env.example                   # Environment configuration template
├── .env                           # Local environment configuration
└── README.md                      # Complete setup and presentation documentation
```

---

## ⚡ Quick Start & Installation

### Step 1: Open Terminal in Project Folder
Ensure you are in the project root directory:
```bash
cd "c:\Users\asus\Desktop\MCA\MCA sem 3\Smart-Civic-Issue-System"
```

### Step 2: Set Up Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
.\venv\Scripts\activate.bat
```

### Step 3: Install Dependencies
```bash
pip install -r backend\requirements.txt
```

### Step 4: Configure Database
Open `.env` in the root folder to set your database preferences:
```ini
FLASK_APP=backend/app.py
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=smart-civic-issue-system-secret-key-tezu-2026

# Database Settings
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=civic_issue_db
```

> **Smart Database Resilience**:
> If MySQL is running and password matches, the system uses MySQL. If your local MySQL password has not been entered yet, the system gracefully uses the local SQLite store so that **the entire dashboard opens and runs without any crash!**

### Step 5: Seed Database with Initial Data
Run the database initialization script:
```bash
python backend\seed_db.py
```
This initializes the tables, creates default categories, creates the default admin, sample citizens, realistic Tezpur University civic complaints with GPS coordinates, and sample photos.

### Step 6: Start the Flask Application
```bash
python backend\app.py
```

Now open your web browser and visit:
👉 **http://localhost:5000/login.html**

---

## 🔑 Default Administrator Credentials

| Field | Value |
|---|---|
| **Portal URL** | [http://localhost:5000/login.html](http://localhost:5000/login.html) |
| **Email** | `admin@tezu.ac.in` |
| **Password** | `AdminPassword123` |
| **Role** | `admin` |

*(Tip: On the login page, click the **"Auto Fill"** button for instant demonstration during viva!)*

---

## 🌐 Complete REST API Endpoint Reference

### Admin Authentication
- `POST /api/admin/login` - Admin authentication with email & password (creates session)
- `POST /api/admin/logout` - Terminates session
- `GET /api/admin/me` - Validates logged-in administrator profile

### Dashboard Operations
- `GET /api/admin/dashboard/stats` - Live KPI counters (Total, Submitted, Under Review, In Progress, Resolved)
- `GET /api/admin/dashboard/charts` - Category and status chart distributions
- `GET /api/admin/dashboard/recent-complaints` - Latest complaints with citizen information
- `GET /api/admin/dashboard/activity` - Real-time audit stream of status updates and admin remarks

### Complaint Management
- `GET /api/admin/complaints` - Search by ID/citizen/address, filter by category/status, sort by date
- `GET /api/admin/complaints/<id>` - Full complaint details, citizen contact info & status history
- `POST /api/admin/complaints/<id>/status` - Update status (`Submitted`, `Under Review`, `In Progress`, `Resolved`) with administrative remark
- `GET /api/admin/complaints/<id>/history` - Complete audit timeline for specific complaint
- `GET /api/admin/complaints/locations` - Geospatial coordinates for Leaflet.js mapping

### Citizen Management
- `GET /api/admin/citizens` - List registered citizens, complaints count, phone, email (passwords masked)
- `GET /api/admin/citizens/<id>` - Citizen profile with full list of submitted complaints

### Reports & Analytics
- `GET /api/admin/reports/stats` - Monthly trends, resolution percentage & category metrics
- `GET /api/admin/reports/export-csv` - Direct CSV stream download of all complaint records

### Citizen Flutter App Integration (Future Ready)
- `POST /api/citizen/register` - Register citizen account (`name`, `email`, `phone`, `password`)
- `POST /api/citizen/login` - Citizen login authentication
- `POST /api/citizen/complaints` - Submit new complaint with photo upload, coordinates, category & address
- `GET /api/citizen/complaints/user/<user_id>` - Fetch citizen's submitted complaints
- `GET /api/citizen/complaints/<complaint_id>/track` - Real-time grievance tracking with audit timeline

---

## 🧪 Automated System Testing

Run the included automated verification suite anytime:
```bash
python test_system.py
```
This tests:
1. Health check & static HTML serving
2. Unauthorized access protection (HTTP 401)
3. Invalid credentials rejection
4. Admin session authentication (`/me`)
5. KPI statistics computation
6. Dynamic Chart.js aggregations
7. Filtering, searching, and sorting
8. Leaflet coordinate extraction
9. Status transition and immutable `status_history` logging
10. Password privacy in citizen directory
11. CSV export streaming
12. Flutter citizen endpoints

---

## 🎓 University Viva Presentation Walkthrough

When presenting this minor project to your professor and external examiners, follow this flow:

1. **Login Page (`login.html`)**:
   - Highlight secure session-based authentication and role enforcement (`role='admin'`).
   - Demonstrate the password visibility toggle and form validation.
   - Click "Auto Fill" to sign in with `admin@tezu.ac.in`.

2. **Dashboard Overview (`dashboard.html`)**:
   - Point out the 5 KPI metric cards computed directly from database queries.
   - Show the dynamic **Category Distribution** doughnut chart and **Status Breakdown** chart.
   - Show the live **Recent Updates** timeline on the right side.

3. **Complaints Registry (`complaints.html`)**:
   - Filter complaints by category (e.g., *Road Damage / Potholes*).
   - Filter by status (e.g., *In Progress*).
   - Type in the search box to find complaints by keyword or citizen name.
   - Click **"Campus Map View"** to show all complaints plotted as color-coded pins on Leaflet / OpenStreetMap.

4. **Complaint Details (`complaint-details.html?id=1`)**:
   - Show the uploaded photo evidence card and click it to open the enlarged modal.
   - Show the individual Leaflet pinpoint map centered on the issue coordinates.
   - Transition the status (e.g., from *Under Review* to *In Progress* or *Resolved*), enter an admin remark, and click **Save**.
   - Point out how the **Status Update Timeline** immediately appends the new event with admin name and timestamp.

5. **Citizen Management (`citizens.html`)**:
   - Search for a student/resident.
   - Click **"Submissions"** to display all complaints lodged by that specific citizen.
   - Explain how passwords are strictly hashed using `scrypt` and never exposed.

6. **Reports & Analytics (`reports.html`)**:
   - Show monthly complaint trends and resolution rates.
   - Click **"Download CSV Report Now"** to demonstrate immediate CSV download for municipal record-keeping.
