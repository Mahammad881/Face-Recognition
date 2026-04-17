package com.attendance.backend.controller;

import com.attendance.backend.entity.StudentFace;
import com.attendance.backend.service.StudentFaceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student_faces")
public class StudentFaceController {

    private final StudentFaceService studentFaceService;

    public StudentFaceController(StudentFaceService studentFaceService) {
        this.studentFaceService = studentFaceService;
    }

    // ✅ Save Face
    @PostMapping
    public ResponseEntity<?> saveFace(@RequestBody StudentFace face) {
        try {
            StudentFace saved = studentFaceService.saveFace(face);
            return ResponseEntity.status(201).body(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "Failed to save face")
            );
        }
    }

    // ✅ Get All Faces
    @GetMapping
    public ResponseEntity<List<StudentFace>> getAllFaces() {
        return ResponseEntity.ok(studentFaceService.getAllFaces());
    }

    // 🔥 Face Match API
    @PostMapping("/match")
    public ResponseEntity<?> matchFace(@RequestBody Map<String, Object> body) {

        try {
            if (body.get("descriptor") == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Descriptor is required")
                );
            }

            // ✅ SAFE CONVERSION
            List<Double> descriptor = ((List<?>) body.get("descriptor"))
                    .stream()
                    .map(val -> Double.parseDouble(val.toString()))
                    .collect(Collectors.toList());

            String studentId = studentFaceService.matchFace(descriptor);

            if (studentId == null) {
                return ResponseEntity.status(404).body(
                        Map.of("message", "No match found")
                );
            }

            return ResponseEntity.ok(
                    Map.of("studentId", studentId)
            );

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "Face matching failed")
            );
        }
    }
}