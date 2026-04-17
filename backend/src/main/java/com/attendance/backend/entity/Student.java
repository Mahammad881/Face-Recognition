package com.attendance.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "students")
@Data
public class Student {

    @Id
    @Column(name = "student_id")
    private String studentId;

    private String name;

    private String email;

    private String department;

    @Column(name = "created_at")
    private java.sql.Timestamp createdAt;
}