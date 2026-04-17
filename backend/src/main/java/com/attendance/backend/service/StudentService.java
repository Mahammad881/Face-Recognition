package com.attendance.backend.service;

import com.attendance.backend.entity.Student;
import com.attendance.backend.repository.StudentRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student saveStudent(Student student) {

        if (student == null) {
            throw new RuntimeException("Student cannot be null");
        }

        String studentId = student.getStudentId();

        if (studentId == null || studentId.trim().isEmpty()) {
            throw new RuntimeException("Student ID cannot be empty");
        }

        studentId = studentId.trim().toUpperCase(java.util.Locale.ROOT);

        if (studentRepository.existsById(studentId)) {
            throw new RuntimeException("Student already exists with this ID");
        }

        student.setStudentId(studentId);
        student.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(String studentId) {

        if (studentId == null || studentId.trim().isEmpty()) {
            throw new RuntimeException("Invalid student ID");
        }

        String formattedId = studentId.trim().toUpperCase(java.util.Locale.ROOT);

        return studentRepository.findById(formattedId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }
}