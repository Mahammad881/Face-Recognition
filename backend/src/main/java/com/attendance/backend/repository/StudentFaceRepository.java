package com.attendance.backend.repository;

import com.attendance.backend.entity.StudentFace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentFaceRepository extends JpaRepository<StudentFace, Long> {
}