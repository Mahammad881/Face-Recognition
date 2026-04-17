package com.attendance.backend.controller;

import com.attendance.backend.entity.Student;
import com.attendance.backend.entity.StudentFace;
import com.attendance.backend.service.StudentFaceService;
import com.attendance.backend.service.StudentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService; // ✅ ADD THIS
    private final StudentFaceService studentFaceService;

    public StudentController(StudentService studentService,
            StudentFaceService studentFaceService) {
        this.studentService = studentService;
        this.studentFaceService = studentFaceService;
    }

    // ✅ Add Student
    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        try {
            Student saved = studentService.saveStudent(student);
            return ResponseEntity.status(201).body(saved);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }

    // ✅ GET ALL STUDENTS (no descriptors here)
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    // ✅ Get Student by ID
    @GetMapping("/descriptors")
    public List<Map<String, Object>> getStudentDescriptors() {

        List<Student> students = studentService.getAllStudents();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Student student : students) {

            if (student.getStudentId() == null)
                continue;

            Optional<StudentFace> faceOpt = studentFaceService
                    .getAllFaces()
                    .stream()
                    .filter(f -> f.getStudentId() != null &&
                            f.getStudentId().trim().toUpperCase().replaceAll("^[0-9]+", "")
                                    .equals(student.getStudentId().trim().toUpperCase()))
                    .findFirst();

            if (faceOpt.isPresent()) {
                StudentFace face = faceOpt.get();

                if (face.getFaceDescriptor() == null)
                    continue;

                Map<String, Object> map = new HashMap<>();
                map.put("studentId", student.getStudentId());
                map.put("name", student.getName());
                map.put("descriptor", face.getFaceDescriptor());

                result.add(map);
            }
        }

        return result;
    }

    @GetMapping("/test")
    public String test() {
        return "Student Controller Working";
    }
}