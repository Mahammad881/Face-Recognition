package com.attendance.backend.controller;

import com.attendance.backend.repository.StudentRepository;
import com.attendance.backend.repository.AttendanceRepository;

import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
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

    ZoneId zone = ZoneId.of("Asia/Kolkata");

    LocalDate today = LocalDate.now(zone); // ✅ IMPORTANT

    ZonedDateTime startOfDay = today.atStartOfDay(zone);
    ZonedDateTime endOfDay = startOfDay.plusDays(1);

    Timestamp start = Timestamp.valueOf(startOfDay.toLocalDateTime());
    Timestamp end = Timestamp.valueOf(endOfDay.toLocalDateTime());

    long todayAttendance = attendanceRepository.countTodayAttendance(start, end);

    Map<String, Object> response = new HashMap<>();
    response.put("totalStudents", totalStudents);
    response.put("todayAttendance", todayAttendance);
    response.put("systemStatus", "Active");

    return response;
}

}