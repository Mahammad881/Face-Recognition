package com.attendance.backend.service;

import com.attendance.backend.entity.Attendance;
import com.attendance.backend.entity.Student;
import com.attendance.backend.repository.AttendanceRepository;
import com.attendance.backend.repository.StudentRepository;

import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.data.domain.Sort;

import java.sql.Timestamp;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    // 💾 SAVE ATTENDANCE

    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    // 📋 GET ALL (latest first)
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll(
                Sort.by(Sort.Direction.DESC, "checkInTime"));
    }

    // ⏱️ CHECK DUPLICATE (recent)
    public long countRecentAttendance(@NonNull String studentId,
            @NonNull Timestamp time) {
        return attendanceRepository.countRecentAttendance(studentId, time);
    }

    // 👤 GET STUDENT NAME

    public String getStudentNameById(@NonNull String studentId) {

        if (studentId == null || studentId.trim().isEmpty()) {
            return "Unknown";
        }

        return studentRepository.findById(studentId.trim().toUpperCase())
                .map(Student::getName)
                .orElse("Unknown"); // ✅ FIXED
    }

    public Attendance getLastAttendance(String studentId) {
        return attendanceRepository.findTopByStudentIdOrderByCheckInTimeDesc(studentId);
    }

    public Attendance getById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
}