import os
import sqlite3
import pymysql
import pymysql.cursors
from backend.config import Config

_active_engine = None

def get_mysql_connection():
    """Attempt connecting to MySQL database."""
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        port=Config.MYSQL_PORT,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        charset='utf8mb4'
    )

def get_sqlite_connection():
    """Connect to SQLite database as reliable fallback/local store."""
    os.makedirs(os.path.dirname(Config.SQLITE_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def test_mysql_available():
    """Check if MySQL connection works with configured credentials."""
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            connect_timeout=2
        )
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DB}` CHARACTER SET utf8mb4;")
        conn.select_db(Config.MYSQL_DB)
        conn.close()
        return True
    except Exception as e:
        print(f"[Database] MySQL connection notice: {e}")
        return False

def get_db_connection():
    """Get active database connection based on environment and availability."""
    global _active_engine
    
    if Config.DB_TYPE == 'mysql':
        if _active_engine == 'sqlite':
            return get_sqlite_connection(), 'sqlite'
            
        try:
            conn = get_mysql_connection()
            _active_engine = 'mysql'
            return conn, 'mysql'
        except Exception as e:
            if _active_engine != 'sqlite':
                print(f"[Database] MySQL not reachable ({e}). Gracefully falling back to SQLite for uninterrupted operation.")
                _active_engine = 'sqlite'
            return get_sqlite_connection(), 'sqlite'
    else:
        _active_engine = 'sqlite'
        return get_sqlite_connection(), 'sqlite'

def query_db(query, args=(), one=False):
    """
    Execute a SELECT query with parameterized inputs and return dictionary list or single dict.
    Supports both MySQL (%s) and SQLite (?) automatically.
    """
    conn, engine = get_db_connection()
    try:
        if engine == 'sqlite':
            # Translate %s to ? for SQLite
            sql_query = query.replace('%s', '?')
            cur = conn.cursor()
            cur.execute(sql_query, args)
            rows = [dict(row) for row in cur.fetchall()]
            cur.close()
            return (rows[0] if rows else None) if one else rows
        else:
            with conn.cursor() as cur:
                cur.execute(query, args)
                rows = cur.fetchall()
                return (rows[0] if rows else None) if one else rows
    finally:
        conn.close()

def execute_db(query, args=(), commit=True):
    """
    Execute an INSERT, UPDATE, or DELETE query with parameterized inputs.
    Returns the last inserted row id or affected rows.
    """
    conn, engine = get_db_connection()
    try:
        if engine == 'sqlite':
            sql_query = query.replace('%s', '?')
            cur = conn.cursor()
            cur.execute(sql_query, args)
            if commit:
                conn.commit()
            last_id = cur.lastrowid
            cur.close()
            return last_id
        else:
            with conn.cursor() as cur:
                cur.execute(query, args)
                if commit:
                    conn.commit()
                last_id = cur.lastrowid
                return last_id
    finally:
        conn.close()

def init_tables():
    """Ensure database tables exist on startup."""
    conn, engine = get_db_connection()
    try:
        if engine == 'sqlite':
            cur = conn.cursor()
            cur.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'citizen')) DEFAULT 'citizen' NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT DEFAULT 'fa-triangle-exclamation'
            );

            CREATE TABLE IF NOT EXISTS complaints (
                complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                image_path TEXT,
                latitude REAL,
                longitude REAL,
                address TEXT NOT NULL,
                status TEXT CHECK(status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved')) DEFAULT 'Submitted' NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS status_history (
                history_id INTEGER PRIMARY KEY AUTOINCREMENT,
                complaint_id INTEGER NOT NULL,
                old_status TEXT NOT NULL,
                new_status TEXT NOT NULL,
                admin_remark TEXT,
                updated_by INTEGER NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
                FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE CASCADE
            );
            """)
            conn.commit()
            cur.close()
            print("[Database] SQLite tables verified/initialized.")
        else:
            with conn.cursor() as cur:
                cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(120) NOT NULL UNIQUE,
                    phone VARCHAR(20) NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'citizen') DEFAULT 'citizen' NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_role (role),
                    INDEX idx_user_email (email)
                ) ENGINE=InnoDB;
                """)
                cur.execute("""
                CREATE TABLE IF NOT EXISTS categories (
                    category_id INT AUTO_INCREMENT PRIMARY KEY,
                    category_name VARCHAR(100) NOT NULL UNIQUE,
                    description VARCHAR(255) NULL,
                    icon VARCHAR(50) DEFAULT 'fa-triangle-exclamation'
                ) ENGINE=InnoDB;
                """)
                cur.execute("""
                CREATE TABLE IF NOT EXISTS complaints (
                    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    category_id INT NOT NULL,
                    description TEXT NOT NULL,
                    image_path VARCHAR(255) NULL,
                    latitude DECIMAL(10, 8) NULL,
                    longitude DECIMAL(11, 8) NULL,
                    address VARCHAR(255) NOT NULL,
                    status ENUM('Submitted', 'Under Review', 'In Progress', 'Resolved') DEFAULT 'Submitted' NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) 
                        REFERENCES users(user_id) ON DELETE CASCADE,
                    CONSTRAINT fk_complaints_category FOREIGN KEY (category_id) 
                        REFERENCES categories(category_id) ON DELETE RESTRICT,
                    INDEX idx_complaint_status (status)
                ) ENGINE=InnoDB;
                """)
                cur.execute("""
                CREATE TABLE IF NOT EXISTS status_history (
                    history_id INT AUTO_INCREMENT PRIMARY KEY,
                    complaint_id INT NOT NULL,
                    old_status VARCHAR(50) NOT NULL,
                    new_status VARCHAR(50) NOT NULL,
                    admin_remark TEXT NULL,
                    updated_by INT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) 
                        REFERENCES complaints(complaint_id) ON DELETE CASCADE,
                    CONSTRAINT fk_history_admin FOREIGN KEY (updated_by) 
                        REFERENCES users(user_id) ON DELETE CASCADE
                ) ENGINE=InnoDB;
                """)
            conn.commit()
            print("[Database] MySQL tables verified/initialized.")
    finally:
        conn.close()
