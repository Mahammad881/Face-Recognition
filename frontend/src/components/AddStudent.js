import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { enrollStudent } from "../utils/api";
import { useNavigate } from "react-router-dom";

const MODEL_PATH = "/models";

function AddStudent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");

  const [email, setEmail] = useState(""); // ✅ NEW
  const [department, setDepartment] = useState(""); // ✅ NEW

  const [descriptor, setDescriptor] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let currentStream;

    async function setupCameraAndModels() {
      try {
        setMessage("⏳ Loading AI models for enrollment...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        ]);
        setLoadingModels(false);
        setMessage("✅ Models loaded. Starting camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        currentStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Setup failed:", error);
        setMessage("❌ Could not load models or access camera.");
      }
    }

    setupCameraAndModels();

    return () => {
      if (currentStream)
        currentStream.getTracks().forEach((track) => track.stop());
    };
  }, [navigate]);

  const captureAndExtract = async () => {
    if (loadingModels) {
      setMessage("Models are still loading...");
      return;
    }

    if (!studentId || !name || !email || !department) {
      setMessage("Please fill all fields first.");
      return;
    }

    const video = videoRef.current;

    if (!video || video.paused || video.ended) {
      setMessage("Camera stream is not active.");
      return;
    }

    setMessage("📸 Capturing multiple face samples...");

    const descriptors = [];

    for (let i = 0; i < 5; i++) {
      const result = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (result) {
        descriptors.push(Array.from(result.descriptor));
      }

      await new Promise((res) => setTimeout(res, 300));
    }

    if (descriptors.length < 3) {
      setMessage("❌ Face capture failed. Try again with better lighting.");
      setDescriptor(null);
      return;
    }

    setDescriptor(descriptors);
    setMessage("✅ Multiple face samples captured!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descriptor) {
      setMessage("Please capture a face first.");
      return;
    }

    setMessage("Sending data to backend for enrollment...");

    try {
      await enrollStudent({
        studentId: studentId.trim(),
        name: name.trim(),
        email: email.trim(), // ✅ NEW
        department: department.trim(), // ✅ NEW
        faceDescriptor: JSON.stringify(descriptor),
      });

      setMessage(`✅ Student Enrolled Successfully (${name})`);

      setStudentId("");
      setName("");
      setEmail(""); // ✅ reset
      setDepartment(""); // ✅ reset
      setDescriptor(null);

      window.dispatchEvent(new Event("student-enrolled"));
    } catch (err) {
      console.error(err);
      setMessage(`❌ Enrollment failed: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Enroll New Student</h2>

      <p
        style={{
          color: message.startsWith("❌")
            ? "red"
            : message.startsWith("✅")
              ? "green"
              : "blue",
        }}
      >
        Status: {message}
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* ✅ NEW FIELDS */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />

        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          1. Position your face in the camera frame
        </p>

        <div style={{ textAlign: "center" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              maxWidth: "400px",
              border: "2px solid #007bff",
              borderRadius: "4px",
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <button
          type="button"
          onClick={captureAndExtract}
          disabled={
            loadingModels || !studentId || !name || !email || !department
          }
        >
          Capture Face & Extract Descriptor
        </button>

        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          2. Enroll Student
        </p>

        <button type="submit" disabled={!descriptor}>
          Enroll Student (Save to Database)
        </button>
      </form>
    </div>
  );
}

export default AddStudent;
