package com.attendance.backend.repository;

import com.attendance.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.checkInTime BETWEEN :start AND :end")
    long countTodayAttendance(@Param("start") Timestamp start,
            @Param("end") Timestamp end);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.checkInTime >= :time")
    long countRecentAttendance(@Param("studentId") String studentId,
            @Param("time") Timestamp time);

    // ✅ NEW (IMPORTANT)
    Attendance findTopByStudentIdOrderByCheckInTimeDesc(String studentId);
}