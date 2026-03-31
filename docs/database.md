-- =========================
-- USERS
-- =========================
CREATE TABLE users (
id CHAR(36) PRIMARY KEY,
full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NULL, -- Changed from NOT NULL to NULL for Google Sign-In
  fcm_token VARCHAR(255) NULL, -- Stores Firebase Cloud Messaging token
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL
);
 
-- =========================
-- BUSINESSES
-- =========================
CREATE TABLE businesses (
id CHAR(36) PRIMARY KEY,
name VARCHAR(255) NOT NULL,
category ENUM('barber', 'salon', 'dentist', 'other') NOT NULL,
lat DECIMAL(10,7) NOT NULL,
lng DECIMAL(10,7) NOT NULL,
address TEXT NOT NULL,
description TEXT,
main_image VARCHAR(255) NULL,
gallery JSON NULL,
rating_avg DECIMAL(3,2) DEFAULT 0,
rating_count INT DEFAULT 0,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL
);

-- =========================
-- BUSINESS HOURS
-- =========================
CREATE TABLE business_hours (
id CHAR(36) PRIMARY KEY,
business_id CHAR(36),
day_of_week TINYINT,
start_time TIME NOT NULL,
end_time TIME NOT NULL,
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- =========================
-- SERVICES
-- =========================
CREATE TABLE services (
id CHAR(36) PRIMARY KEY,
business_id CHAR(36),
name VARCHAR(255) NOT NULL,
description TEXT,
duration_min INT NOT NULL,
buffer_min INT DEFAULT 0,
price DECIMAL(10,2),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- =========================
-- STAFF
-- =========================
CREATE TABLE staff (
id CHAR(36) PRIMARY KEY,
business_id CHAR(36),
user_id CHAR(36),
name VARCHAR(255) NOT NULL,
bio TEXT,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- STAFF SERVICES
-- =========================
CREATE TABLE staff_services (
staff_id CHAR(36),
service_id CHAR(36),
PRIMARY KEY (staff_id, service_id),
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- =========================
-- STAFF SCHEDULES
-- =========================
CREATE TABLE staff_schedules (
id CHAR(36) PRIMARY KEY,
staff_id CHAR(36),
day_of_week TINYINT,
start_time TIME,
end_time TIME,
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- =========================
-- AVAILABILITY OVERRIDES
-- =========================
CREATE TABLE availability_overrides (
id CHAR(36) PRIMARY KEY,
staff_id CHAR(36),
start_at DATETIME NOT NULL,
end_at DATETIME NOT NULL,
is_available BOOLEAN NOT NULL,
reason TEXT,
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- =========================
-- APPOINTMENTS
-- =========================
CREATE TABLE appointments (
id CHAR(36) PRIMARY KEY,
user_id CHAR(36),
business_id CHAR(36),
staff_id CHAR(36),
service_id CHAR(36),

start_time DATETIME NOT NULL,
end_time DATETIME NOT NULL,

booked_price DECIMAL(10,2),
status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
reminder_sent TINYINT(1) DEFAULT 0, -- Track if the 1-hour cron reminder fired
expires_at DATETIME,

notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,

FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (business_id) REFERENCES businesses(id),
FOREIGN KEY (staff_id) REFERENCES staff(id),
FOREIGN KEY (service_id) REFERENCES services(id),

INDEX idx_staff_time (staff_id, start_time, end_time)
);

-- =========================
-- APPOINTMENT LOGS
-- =========================
CREATE TABLE appointment_logs (
id CHAR(36) PRIMARY KEY,
appointment_id CHAR(36),
action VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- =========================
-- REVIEWS
-- =========================
CREATE TABLE reviews (
id CHAR(36) PRIMARY KEY,
appointment_id CHAR(36) UNIQUE,
user_id CHAR(36),
business_id CHAR(36),
staff_id CHAR(36),
rating INT CHECK (rating BETWEEN 1 AND 5),
comment TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (appointment_id) REFERENCES appointments(id),
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (business_id) REFERENCES businesses(id),
FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- =========================
-- FAVORITES
-- =========================
CREATE TABLE favorites (
user_id CHAR(36),
business_id CHAR(36),
PRIMARY KEY (user_id, business_id),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id CHAR(36) NOT NULL,
title VARCHAR(255) NOT NULL,
body TEXT NOT NULL,
is_read TINYINT(1) DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


and then we appended data with this command

-- ==========================================================
-- SECTION 1: CLEANING DATA (Use this to reset)
-- ==========================================================
-- Using DELETE instead of TRUNCATE to avoid Foreign Key constraint errors (#1701)
-- in MariaDB/MySQL.

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM notifications;
DELETE FROM favorites;
DELETE FROM reviews;
DELETE FROM appointment_logs;
DELETE FROM appointments;
DELETE FROM availability_overrides;
DELETE FROM staff_schedules;
DELETE FROM staff_services;
DELETE FROM staff;
DELETE FROM services;
DELETE FROM business_hours;
DELETE FROM businesses;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- SECTION 2: POPULATING DATA (Development Seed)
-- ==========================================================

-- 1. USERS (Clients)
SET @u1 = UUID();
SET @u2 = UUID();
INSERT INTO users (id, full_name, phone, email) VALUES
(@u1, 'Ahmed Ali', '01001234567', 'ahmed@example.com'),
(@u2, 'Sara Hassan', '01119876543', 'sara@example.com');

-- 2. BUSINESSES
SET @b1 = UUID(); -- Barber Shop 1
SET @b2 = UUID(); -- Barber Shop 2
INSERT INTO businesses (id, name, category, lat, lng, address, description, main_image, gallery) VALUES
(@b1, 'Gentle Cut Barber', 'barber', 30.0444, 31.2357, 'Downtown, Cairo', 'The best classic fades in town.',
'https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877410/salon1_teqiwf.jpg',
'["https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877410/haircut1_yik9qp.jpg", "https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877409/haircut11_knzarw.jpg", "https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877410/haircut111_twufhp.jpg"]'),
(@b2, 'Elite Grooming Lounge', 'barber', 30.0131, 31.2089, 'Maadi, Street 9', 'Premium grooming and beard styling.',
'https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877411/salon2_jjiagh.jpg',
'["https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877410/haircut2_ujfqk1.jpg", "https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877410/haircut22_rfpioz.jpg", "https://res.cloudinary.com/dlauqvbe4/image/upload/v1774877410/haircut222_wte6fi.jpg"]');

-- 3. BUSINESS HOURS (General shop hours)
INSERT INTO business_hours (id, business_id, day_of_week, start_time, end_time) VALUES
(UUID(), @b1, 1, '09:00:00', '21:00:00'), -- Monday
(UUID(), @b1, 2, '09:00:00', '21:00:00'), -- Tuesday
(UUID(), @b2, 1, '10:00:00', '18:00:00'); -- Monday

-- 4. SERVICES
SET @s1 = UUID(); -- Haircut
SET @s2 = UUID(); -- Beard
SET @s3 = UUID(); -- Hair & Beard Combo
INSERT INTO services (id, business_id, name, duration_min, price, buffer_min) VALUES
(@s1, @b1, 'Classic Haircut', 30, 150.00, 5),
(@s2, @b1, 'Beard Trim', 20, 80.00, 0),
(@s3, @b2, 'VIP Hair & Beard Combo', 45, 250.00, 15);

-- 5. STAFF
SET @st1 = UUID(); -- Master Barber (Shop 1)
SET @st2 = UUID(); -- Senior Barber (Shop 2)
INSERT INTO staff (id, business_id, name, bio) VALUES
(@st1, @b1, 'Omar The Blade', 'Specialist in classic scissor cuts.'),
(@st2, @b2, 'Hassan Stylist', 'Expert in modern fades and beard sculpting.');
-- 6. STAFF SERVICES (Who does what)
INSERT INTO staff_services (staff_id, service_id) VALUES
(@st1, @s1),
(@st1, @s2),
(@st2, @s3);

-- 7. STAFF SCHEDULES (When they actually work)
INSERT INTO staff_schedules (id, staff_id, day_of_week, start_time, end_time) VALUES
(UUID(), @st1, 1, '09:00:00', '15:00:00'), -- Monday Morning Shift
(UUID(), @st2, 1, '10:00:00', '18:00:00'); -- Monday Full Day

-- 8. APPOINTMENTS (Test Data)
SET @apt1 = UUID();
INSERT INTO appointments (id, user_id, business_id, staff_id, service_id, start_time, end_time, booked_price, status) VALUES
(@apt1, @u1, @b1, @st1, @s1, '2023-10-25 10:00:00', '2023-10-25 10:30:00', 150.00, 'confirmed');

-- 9. REVIEWS & FAVORITES
INSERT INTO reviews (id, appointment_id, user_id, business_id, staff_id, rating, comment) VALUES
(UUID(), @apt1, @u1, @b1, @st1, 5, 'Great haircut, very professional!');

INSERT INTO favorites (user_id, business_id) VALUES
(@u1, @b1);
