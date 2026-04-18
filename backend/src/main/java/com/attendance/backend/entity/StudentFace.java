package com.attendance.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Table(name = "student_faces")
@Data
public class StudentFace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "face_descriptor", columnDefinition = "TEXT")
    private String faceDescriptor;

    @Column(name = "created_at")
    private Timestamp createdAt;
}