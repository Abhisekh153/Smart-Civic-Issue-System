-- ====================================================================
-- Smart Civic Issue Reporting System
-- Database Schema (MySQL)
-- Tezpur University Minor Project
-- ====================================================================

CREATE DATABASE IF NOT EXISTS civic_issue_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE civic_issue_db;

-- Drop tables in reverse order of foreign key dependencies if recreating
DROP TABLE IF EXISTS status_history;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- --------------------------------------------------------------------
-- 1. Table: users
-- Roles: 'admin', 'citizen'
-- --------------------------------------------------------------------
CREATE TABLE users (
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

-- --------------------------------------------------------------------
-- 2. Table: categories
-- Civic issue categories
-- --------------------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    icon VARCHAR(50) DEFAULT 'fa-triangle-exclamation'
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 3. Table: complaints
-- Statuses: 'Submitted', 'Under Review', 'In Progress', 'Resolved'
-- --------------------------------------------------------------------
CREATE TABLE complaints (
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
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_category (category_id),
    INDEX idx_complaint_user (user_id),
    INDEX idx_complaint_created (created_at)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. Table: status_history
-- Audit log of status transitions and administrative remarks
-- --------------------------------------------------------------------
CREATE TABLE status_history (
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
        REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_history_complaint (complaint_id)
) ENGINE=InnoDB;
