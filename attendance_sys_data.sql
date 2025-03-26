-- Create database if it doesn't exist with proper charset
CREATE DATABASE IF NOT EXISTS smart_attendance 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Switch to the database
USE smart_attendance;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  usn VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_email (email)
) ENGINE=InnoDB;

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usn VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teacher_email (email),
  INDEX idx_teacher_usn (usn)
) ENGINE=InnoDB;

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_usn VARCHAR(20) NOT NULL,
  teacher_id INT NOT NULL,
  qr_code VARCHAR(255) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_usn) 
    REFERENCES students(usn) 
    ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) 
    REFERENCES teachers(id) 
    ON DELETE CASCADE,
  INDEX idx_attendance_student (student_usn),
  INDEX idx_attendance_teacher (teacher_id),
  INDEX idx_attendance_timestamp (timestamp)
) ENGINE=InnoDB;



-- Sample teacher
INSERT INTO teachers (usn, name, email, subject, password) VALUES
('T001', 'John Smith', 'john.smith@school.edu', 'Mathematics', 'T001'),
('T002', 'Emma Johnson', 'emma.johnson@school.edu', 'Physics', 'T002'),
('T003', 'Michael Brown', 'michael.brown@school.edu', 'Chemistry', 'T003'),
('T004', 'Sophia Wilson', 'sophia.wilson@school.edu', 'Biology', 'T004'),
('T005', 'James Davis', 'james.davis@school.edu', 'English', 'T005'),
('T006', 'Olivia Miller', 'olivia.miller@school.edu', 'History', 'T006'),
('T007', 'William Taylor', 'william.taylor@school.edu', 'Geography', 'T007'),
('T008', 'Ava Anderson', 'ava.anderson@school.edu', 'Computer Science', 'T008'),
('T009', 'Ethan Thomas', 'ethan.thomas@school.edu', 'Economics', 'T009'),
('T010', 'Charlotte White', 'charlotte.white@school.edu', 'Political Science', 'T010');


-- Sample student
INSERT INTO students (usn, name, email, password) VALUES
('S001', 'Alice Johnson', 'alice.johnson@school.edu', 'S001'),
('S002', 'Bob Smith', 'bob.smith@school.edu', 'S002'),
('S003', 'Charlie Brown', 'charlie.brown@school.edu', 'S003'),
('S004', 'David Wilson', 'david.wilson@school.edu', 'S004'),
('S005', 'Emma Davis', 'emma.davis@school.edu', 'S005'),
('S006', 'Fiona Miller', 'fiona.miller@school.edu', 'S006'),
('S007', 'George Clark', 'george.clark@school.edu', 'S007'),
('S008', 'Hannah Lewis', 'hannah.lewis@school.edu', 'S008'),
('S009', 'Ian Walker', 'ian.walker@school.edu', 'S009'),
('S010', 'Jessica Hall', 'jessica.hall@school.edu', 'S010'),
('S011', 'Kevin Allen', 'kevin.allen@school.edu', 'S011'),
('S012', 'Laura Young', 'laura.young@school.edu', 'S012'),
('S013', 'Michael King', 'michael.king@school.edu', 'S013'),
('S014', 'Natalie Wright', 'natalie.wright@school.edu', 'S014'),
('S015', 'Oliver Scott', 'oliver.scott@school.edu', 'S015'),
('S016', 'Paula Adams', 'paula.adams@school.edu', 'S016'),
('S017', 'Quentin Baker', 'quentin.baker@school.edu', 'S017'),
('S018', 'Rachel Green', 'rachel.green@school.edu', 'S018'),
('S019', 'Samuel Carter', 'samuel.carter@school.edu', 'S019'),
('S020', 'Tina Evans', 'tina.evans@school.edu', 'S020'),
('S021', 'Umar Foster', 'umar.foster@school.edu', 'S021'),
('S022', 'Vera Gonzalez', 'vera.gonzalez@school.edu', 'S022'),
('S023', 'William Harris', 'william.harris@school.edu', 'S023'),
('S024', 'Xavier Hughes', 'xavier.hughes@school.edu', 'S024'),
('S025', 'Yvonne James', 'yvonne.james@school.edu', 'S025'),
('S026', 'Zachary Lopez', 'zachary.lopez@school.edu', 'S026'),
('S027', 'Amber Martinez', 'amber.martinez@school.edu', 'S027'),
('S028', 'Brian Nelson', 'brian.nelson@school.edu', 'S028'),
('S029', 'Catherine Ortiz', 'catherine.ortiz@school.edu', 'S029'),
('S030', 'Daniel Perez', 'daniel.perez@school.edu', 'S030'),
('S031', 'Eliza Quinn', 'eliza.quinn@school.edu', 'S031'),
('S032', 'Frank Reed', 'frank.reed@school.edu', 'S032'),
('S033', 'Grace Stewart', 'grace.stewart@school.edu', 'S033'),
('S034', 'Henry Thomas', 'henry.thomas@school.edu', 'S034'),
('S035', 'Isabella Underwood', 'isabella.underwood@school.edu', 'S035'),
('S036', 'Jack Vincent', 'jack.vincent@school.edu', 'S036'),
('S037', 'Kylie Watson', 'kylie.watson@school.edu', 'S037'),
('S038', 'Liam Xavier', 'liam.xavier@school.edu', 'S038'),
('S039', 'Mia Yates', 'mia.yates@school.edu', 'S039'),
('S040', 'Noah Zimmerman', 'noah.zimmerman@school.edu', 'S040');








-- Update teachers table
ALTER TABLE teachers 
MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Update students table
ALTER TABLE students 
MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Update sample data with hashed passwords (example for S001/S001 and T001/T001)
UPDATE students SET password = '$2y$10$VYAESkq4.5hQZf7h7bB1U.9z4tTkQ6WgN0wR3jXrL1Nkq9JmFbWZa' WHERE usn = 'S001';
UPDATE teachers SET password = '$2y$10$VYAESkq4.5hQZf7h7bB1U.9z4tTkQ6WgN0wR3jXrL1Nkq9JmFbWZa' WHERE usn = 'T001';
-- Repeat for all users with bcrypt hashed passwords (password = username)










CREATE TABLE IF NOT EXISTS manual_codes (
  teacher_id INT NOT NULL,
  code VARCHAR(6) PRIMARY KEY,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  INDEX idx_manual_code (code, expires_at)
);













CREATE TABLE IF NOT EXISTS qr_sessions (
  id VARCHAR(255) PRIMARY KEY,
  teacher_id INT NOT NULL,
  subject VARCHAR(100),
  expiry_time DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  INDEX idx_qr_session_expiry (expiry_time)
);

CREATE TABLE IF NOT EXISTS manual_codes (
  teacher_id INT NOT NULL,
  code VARCHAR(6) PRIMARY KEY,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  INDEX idx_manual_code_expiry (expires_at)
);