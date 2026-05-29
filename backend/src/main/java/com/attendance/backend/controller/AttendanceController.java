package com.attendance.backend.controller;

import com.attendance.backend.entity.Attendance;
import com.attendance.backend.service.AttendanceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

 @PostMapping("/present")
public ResponseEntity<?> markPresent(@RequestBody Map<String, String> body) {

    String studentId = body.get("studentId");

    if (studentId == null || studentId.trim().isEmpty()) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "Student ID missing"));
    }

    studentId = studentId.trim().toUpperCase();

    // ✅ Get student name
    String studentName = attendanceService.getStudentNameById(studentId);

    if ("Unknown".equals(studentName)){
        return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid student ID: " + studentId));
    }

    // ✅ CALL SERVICE (MAIN FIX 🔥)
    String result = attendanceService.markAttendance(studentId);

    if (result.equals("cooldown")) {
        return ResponseEntity.ok(
                Map.of(
                        "status", "cooldown",
                        "message", "Already marked within 1 hour"
                )
        );
    }

    if (result.equals("success")) {
        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "Attendance marked",
                        "studentId", studentId,
                        "studentName", studentName
                )
        );
    }

    return ResponseEntity.status(500).body(
            Map.of("message", "Something went wrong"));
}
    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance updatedData) {

        Attendance attendance = attendanceService.getById(id);

        attendance.setStudentName(updatedData.getStudentName());

        Attendance saved = attendanceService.saveAttendance(attendance);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok().body("Deleted successfully");
    }
}