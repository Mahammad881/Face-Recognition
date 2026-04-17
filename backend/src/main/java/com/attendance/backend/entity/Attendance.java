package com.attendance.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Table(name = "attendance")
@Data
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "check_in_time")
    private Timestamp checkInTime;

    private String status;

    @Column(name = "student_name") // ✅ FIXED
    private String studentName;
}