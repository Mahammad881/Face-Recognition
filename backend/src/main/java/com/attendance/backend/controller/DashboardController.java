package com.attendance.backend.controller;

import com.attendance.backend.repository.StudentRepository;
import com.attendance.backend.repository.AttendanceRepository;

import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;

    public DashboardController(StudentRepository studentRepository,
                               AttendanceRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping("/stats")
public Map<String, Object> getStats() {

    long totalStudents = studentRepository.count();

    LocalDate today = LocalDate.now();

    Timestamp start = Timestamp.valueOf(today.atStartOfDay());
    Timestamp end = Timestamp.valueOf(today.plusDays(1).atStartOfDay()); // ✅ FIX

    long todayAttendance = attendanceRepository.countTodayAttendance(start, end);

    Map<String, Object> response = new HashMap<>();
    response.put("totalStudents", totalStudents);
    response.put("todayAttendance", todayAttendance);
    response.put("systemStatus", "Active");

    return response;
}
}