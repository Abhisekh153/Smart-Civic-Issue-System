import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'smart-civic-issue-system-secret-key-tezu-2026')
    
    # Database Settings
    DB_TYPE = os.getenv('DB_TYPE', 'mysql') # 'mysql' or 'sqlite'
    
    MYSQL_HOST = os.getenv('DB_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('DB_PORT', 3306))
    MYSQL_USER = os.getenv('DB_USER', 'root')
    MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '')
    MYSQL_DB = os.getenv('DB_NAME', 'civic_issue_db')
    
    # SQLite fallback file path (ensures instant zero-config run capability)
    SQLITE_PATH = os.path.join(BASE_DIR, 'database', 'civic_issue_db.sqlite')
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'backend', 'uploads', 'complaints')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max request limit
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    
    # Admin UI directory
    FRONTEND_DIR = os.path.join(BASE_DIR, 'admin_dashboard')
