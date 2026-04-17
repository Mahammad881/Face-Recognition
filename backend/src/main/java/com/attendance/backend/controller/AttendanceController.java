package com.attendance.backend.controller;

import com.attendance.backend.entity.Attendance;
import com.attendance.backend.service.AttendanceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
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

        Timestamp now = new Timestamp(System.currentTimeMillis());

        Attendance lastAttendance = attendanceService.getLastAttendance(studentId);

        // ✅ COOLDOWN CHECK
        if (lastAttendance != null && lastAttendance.getCheckInTime() != null) {

            long lastTime = lastAttendance.getCheckInTime().getTime();
            long currentTime = System.currentTimeMillis();

            long diffMinutes = (currentTime - lastTime) / (60 * 1000);

            if (diffMinutes < 60) {
                long remaining = 60 - diffMinutes;

                return ResponseEntity.ok(
                    Map.of(
                        "status", "cooldown",
                        "message", "Please come after " + remaining + " minutes",
                        "remainingMinutes", remaining
                    )
                );
            }
        }

        String studentName = attendanceService.getStudentNameById(studentId);

        if (studentName.equals("Unknown")) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid student ID: " + studentId));
        }

        Attendance attendance = new Attendance();
        attendance.setStudentId(studentId);
        attendance.setStudentName(studentName);
        attendance.setStatus("Present");
        attendance.setCheckInTime(now);

        attendanceService.saveAttendance(attendance);

        return ResponseEntity.ok(
            Map.of(
                "status", "success",
                "message", "Attendance marked",
                "studentId", studentId,
                "studentName", studentName
            )
        );
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