package com.attendance.backend.service;

import com.attendance.backend.entity.StudentFace;
import com.attendance.backend.repository.StudentFaceRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentFaceService {

    private final StudentFaceRepository studentFaceRepository;

    public StudentFaceService(StudentFaceRepository studentFaceRepository) {
        this.studentFaceRepository = studentFaceRepository;
    }

    public StudentFace saveFace(StudentFace face) {

    String studentId = face.getStudentId();

    if (studentId != null) {
        studentId = studentId.trim().toUpperCase();

        // 🔥 REMOVE PREFIX NUMBERS (IMPORTANT)
        studentId = studentId.replaceAll("^[0-9]+", "");

        face.setStudentId(studentId);
    }

    face.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

    return studentFaceRepository.save(face);
}

    public List<StudentFace> getAllFaces() {
        return studentFaceRepository.findAll();
    }

    // 🔥 MATCH FACE
    public String matchFace(List<Double> inputDescriptor) {

        List<StudentFace> faces = studentFaceRepository.findAll();

        double threshold = 0.75;

        for (StudentFace face : faces) {

            List<Double> dbDescriptor = convertJsonToList(face.getFaceDescriptor());

            // ✅ IMPORTANT FIX
            if (dbDescriptor.size() != inputDescriptor.size()) {
                continue;
            }

            double distance = calculateDistance(inputDescriptor, dbDescriptor);

            if (distance < threshold) {
                return face.getStudentId();
            }
        }

        return null;
    }

    // 🧮 Convert JSON String → List<Double>
    private List<Double> convertJsonToList(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, new TypeReference<List<Double>>() {
            });
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to List", e);
        }
    }

    // 🧮 Euclidean Distance
    private double calculateDistance(List<Double> d1, List<Double> d2) {
        double sum = 0;

        for (int i = 0; i < d1.size(); i++) {
            double diff = d1.get(i) - d2.get(i);
            sum += diff * diff;
        }

        return Math.sqrt(sum);
    }
}