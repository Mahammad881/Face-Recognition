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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 Enroll Student</h2>
        <p style={styles.status(message)}>{message}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* BASIC INFO */}
          <div style={styles.section}>
            <h4>Student Details</h4>

            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* CAMERA */}
          <div style={styles.section}>
            <h4>Face Capture</h4>

            <video ref={videoRef} autoPlay muted style={styles.video} />

            <button
              type="button"
              onClick={captureAndExtract}
              disabled={
                loadingModels || !studentId || !name || !email || !department
              }
              style={styles.secondaryBtn}
            >
              📸 Capture Face
            </button>
          </div>

          {/* SUBMIT */}
          <div style={styles.section}>
            <button
              type="submit"
              disabled={!descriptor}
              style={styles.primaryBtn}
            >
              🚀 Enroll Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  title: {
    textAlign: "center",
    marginBottom: "10px",
  },

  status: (msg) => ({
    textAlign: "center",
    marginBottom: "15px",
    fontWeight: "bold",
    color: msg.startsWith("❌")
      ? "red"
      : msg.startsWith("✅")
      ? "green"
      : "#007bff",
  }),

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  video: {
    width: "100%",
    borderRadius: "8px",
    border: "2px solid #007bff",
  },

  primaryBtn: {
    padding: "12px",
    background: "linear-gradient(90deg,#007bff,#0056d2)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  secondaryBtn: {
    padding: "10px",
    background: "#f1f1f1",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default AddStudent;
