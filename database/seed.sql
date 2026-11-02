-- ====================================================================
-- Smart Civic Issue Reporting System
-- Seed Data (MySQL)
-- Tezpur University Minor Project
-- ====================================================================

USE civic_issue_db;

-- 1. Seed Categories
INSERT INTO categories (category_id, category_name, description, icon) VALUES
(1, 'Road Damage / Potholes', 'Damaged asphalt, deep potholes, uneven road surfaces hindering traffic.', 'fa-road'),
(2, 'Garbage and Waste Management', 'Uncollected garbage, overflowing public waste bins, open dumpsites.', 'fa-trash-can'),
(3, 'Drainage Problems', 'Blocked culverts, overflowing storm drains, stagnant water clogging walkways.', 'fa-water'),
(4, 'Broken Streetlights', 'Flickering or unlit lampposts, exposed wiring, non-functional lighting poles.', 'fa-lightbulb'),
(5, 'Water Supply Problems', 'Pipeline bursts, low water pressure, contaminated supply or valve failure.', 'fa-faucet-drip')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 2. Seed Users
-- Password for admin: AdminPassword123
-- Password for citizens: CitizenPass123
INSERT INTO users (user_id, name, email, phone, password_hash, role) VALUES
(1, 'Campus Municipal Administrator', 'admin@tezu.ac.in', '+91 3712 267001', 'scrypt:32768:8:1$uH3y4j1o...$placeholder_use_seed_py_for_exact_hash', 'admin'),
(2, 'Rahul Sharma', 'rahul.sharma@gmail.com', '+91 98640 12345', 'scrypt:32768:8:1$placeholder', 'citizen'),
(3, 'Priya Das', 'priya.das@gmail.com', '+91 94350 67890', 'scrypt:32768:8:1$placeholder', 'citizen'),
(4, 'Anup Baruah', 'anup.baruah@gmail.com', '+91 97060 54321', 'scrypt:32768:8:1$placeholder', 'citizen'),
(5, 'Snigdha Kalita', 'snigdha.kalita@gmail.com', '+91 98540 98765', 'scrypt:32768:8:1$placeholder', 'citizen')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Seed Complaints
INSERT INTO complaints (complaint_id, user_id, category_id, description, image_path, latitude, longitude, address, status) VALUES
(1, 2, 1, 'Large deep pothole formed right in front of University Main Gate 1 after recent heavy monsoon rains. Vehicles are swerving abruptly causing accident risks.', 'uploads/complaints/pothole_gate1.jpg', 26.700650, 92.830620, 'Near Main Gate 1, Tezpur University Campus, Napaam, Tezpur', 'In Progress'),
(2, 3, 2, 'Solid waste bin overflowing near Nilachal Men\'s Hostel dining hall road. Stray cattle and dogs are scattering plastics across the lawn.', 'uploads/complaints/garbage_hostel.jpg', 26.702510, 92.834050, 'Opposite Nilachal Men\'s Hostel, East Campus, Tezpur University', 'Submitted'),
(3, 4, 3, 'Culvert drain is completely blocked by silt and dry branches causing rainwater backflow on the pathway between Academic Complex and Dean\'s office.', 'uploads/complaints/drainage_overflow.jpg', 26.704020, 92.829040, 'Pathway between Academic Building 1 and Dean Office, Tezpur University', 'Under Review'),
(4, 5, 4, 'Three continuous high-mast LED street lamps have been non-functional for past 4 days, causing total darkness on the library connecting walkway at night.', 'uploads/complaints/streetlight_avenue.jpg', 26.699030, 92.831510, 'Central Library Avenue Rd, Tezpur University, Napaam', 'Resolved'),
(5, 2, 5, 'Underground potable water supply pipeline joint is leaking near the main pump station, leading to low water pressure in department washrooms.', 'uploads/complaints/water_leak.jpg', 26.701550, 92.832280, 'Water Treatment & Supply Unit 2, Near Central Stores, Napaam', 'In Progress'),
(6, 4, 1, 'Severe asphalt erosion and bitumen depression on the approach bridge connecting Mission Chariali with Tezpur town.', 'uploads/complaints/pothole_gate1.jpg', 26.654210, 92.793540, 'Mission Chariali Junction Road, Tezpur, Assam 784001', 'Submitted'),
(7, 3, 2, 'Commercial vegetable waste and plastic bags dumping without clearance at Tezpur Chowk Bazar intersection.', 'uploads/complaints/garbage_hostel.jpg', 26.626810, 92.795820, 'Chowk Bazaar Main Road, Tezpur Urban Center, Assam', 'Resolved')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 4. Status History
INSERT INTO status_history (history_id, complaint_id, old_status, new_status, admin_remark, updated_by) VALUES
(1, 1, 'None', 'Submitted', 'Complaint submitted via citizen portal.', 1),
(2, 1, 'Submitted', 'Under Review', 'Verified by campus civil engineering cell. Site inspection dispatched.', 1),
(3, 1, 'Under Review', 'In Progress', 'Repair contractor team is deployed on site. Heavy machinery in operation.', 1),
(4, 2, 'None', 'Submitted', 'Complaint submitted via Citizen Mobile App.', 1),
(5, 3, 'None', 'Submitted', 'Complaint submitted via citizen portal.', 1),
(6, 3, 'Submitted', 'Under Review', 'Campus estate maintenance committee notified.', 1),
(7, 4, 'None', 'Submitted', 'Complaint submitted via citizen portal.', 1),
(8, 4, 'Submitted', 'In Progress', 'Electrical maintenance division dispatched with boom lift truck.', 1),
(9, 4, 'In Progress', 'Resolved', 'Replacement LED drivers installed. Walkway lighting restored and tested.', 1)
ON DUPLICATE KEY UPDATE admin_remark=VALUES(admin_remark);
