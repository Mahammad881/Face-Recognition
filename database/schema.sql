-- Smart Attendance System - Database Schema
-- Run this in MySQL to set up the database

CREATE DATABASE IF NOT EXISTS smart_attendance_db;
USE smart_attendance_db;

-- Users (teachers/admins)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') DEFAULT 'teacher',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students (enrolled for face recognition)
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  face_descriptor LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);
