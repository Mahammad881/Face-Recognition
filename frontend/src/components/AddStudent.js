import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { enrollStudent } from "../utils/api";

const MODEL_PATH = "/models";

function AddStudent() {
  const videoRef = useRef(null);
  

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");

  const [email, setEmail] = useState(""); // ✅ NEW
  const [department, setDepartment] = useState(""); // ✅ NEW

  const [descriptor, setDescriptor] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);


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
  }, []);

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
    // ✅ ADD HERE
    console.log("DATA:", {
      studentId,
      name,
      email,
      department,
      descriptor,
    });

    setMessage("Sending data to backend for enrollment...");

    try {
      await enrollStudent({
        studentId: studentId.trim(),
        name,
        email,
        department,
        faceDescriptor: JSON.stringify(descriptor)
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Enroll New Student</h2>

        {message && <p style={styles.status(message)}>Status: {message}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* INPUTS */}
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* CAMERA SECTION */}
          <div style={styles.section}>
            <p style={styles.step}>1. Position your face</p>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />

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

            {descriptor && (
              <p style={styles.success}>✅ Face captured successfully</p>
            )}
          </div>

          {/* SUBMIT */}
          <div style={styles.section}>
            <p style={styles.step}>2. Save Student</p>

            <button
              type="submit"
              disabled={!descriptor}
              style={{
                ...styles.primaryBtn,
                opacity: !descriptor ? 0.6 : 1,
                cursor: !descriptor ? "not-allowed" : "pointer",
              }}
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
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc", // ✅ SAME AS DASHBOARD
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "15px",
  },

  status: (msg) => ({
    textAlign: "center",
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "6px",
    fontWeight: "500",
    background: msg.startsWith("❌")
      ? "#ffe5e5"
      : msg.startsWith("✅")
        ? "#e6ffed"
        : "#e6f0ff",
  }),

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  step: {
    fontWeight: "bold",
    alignSelf: "flex-start",
  },

  video: {
    width: "100%",
    maxWidth: "350px",
    borderRadius: "8px",
    border: "2px solid #007bff",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  secondaryBtn: {
    padding: "10px 15px",
    background: "#f1f1f1",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },

  success: {
    color: "green",
    fontWeight: "500",
  },
};
export default AddStudent;
