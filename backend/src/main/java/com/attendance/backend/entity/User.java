package com.attendance.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // ✅ FIXED (bigint → Long)

    private String username;

    private String password;

    private String role;

    private String email;

    @Column(name = "created_at")
    private Timestamp createdAt;   // ✅ ADDED
}