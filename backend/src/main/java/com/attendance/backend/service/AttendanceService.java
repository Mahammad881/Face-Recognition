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

    // ✅ 🔥 MAIN FIX: MARK ATTENDANCE WITH 1 HOUR LIMIT
   public String markAttendance(String studentId) {

    if (studentId == null || studentId.trim().isEmpty()) {
        return "error";
    }

    studentId = studentId.trim().toUpperCase();

    Timestamp oneHourAgo = new Timestamp(System.currentTimeMillis() - (60 * 60 * 1000));

    long count = attendanceRepository.countRecentAttendance(studentId, oneHourAgo);

    if (count > 0) {
        return "cooldown";
    }

    // ✅ GET NAME
    String studentName = getStudentNameById(studentId);

    Attendance attendance = new Attendance();
    attendance.setStudentId(studentId);
    attendance.setStudentName(studentName); // ✅ ADD THIS
    attendance.setStatus("Present");        // ✅ ADD THIS
    attendance.setCheckInTime(new Timestamp(System.currentTimeMillis()));

    attendanceRepository.save(attendance);

    return "success";
}
    // 📋 GET ALL (latest first)
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll(
                Sort.by(Sort.Direction.DESC, "checkInTime"));
    }

    // ⏱️ CHECK DUPLICATE (optional)
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
                .orElse("Unknown");
    }

    public Attendance getLastAttendance(String studentId) {
        return attendanceRepository
                .findTopByStudentIdOrderByCheckInTimeDesc(studentId);
    }

    public Attendance getById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
    public Attendance saveAttendance(Attendance attendance) {
    return attendanceRepository.save(attendance);
}
}