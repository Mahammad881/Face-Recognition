import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { enrollStudent } from "../utils/api";

const MODEL_PATH = "/models";

function AddStudent() {
  const videoRef = useRef(null);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  const [descriptor, setDescriptor] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let currentStream;

    async function setup() {
      try {
        setMessage("⏳ Loading AI models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        ]);

        setLoadingModels(false);
        setMessage("✅ Models loaded. Camera starting...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        currentStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load models or camera");
      }
    }

    setup();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureAndExtract = async () => {
    if (loadingModels) return setMessage("Models still loading...");
    if (!studentId || !name || !email || !department)
      return setMessage("Fill all fields first");

    const video = videoRef.current;

    if (!video || video.paused)
      return setMessage("Camera not active");

    setMessage("📸 Capturing face samples...");

    const descriptors = [];

    for (let i = 0; i < 5; i++) {
      const result = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (result) descriptors.push(Array.from(result.descriptor));

      await new Promise((r) => setTimeout(r, 300));
    }

    if (descriptors.length < 3) {
      setDescriptor(null);
      return setMessage("❌ Try again with better lighting");
    }

    setDescriptor(descriptors);
    setMessage("✅ Face captured successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descriptor) return setMessage("Capture face first");

    setSubmitting(true);
    setMessage("Saving student...");

    try {
      await enrollStudent({
        studentId: studentId.trim(),
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        faceDescriptor: JSON.stringify(descriptor),
      });

      setMessage(`✅ Student ${name} enrolled`);
      setStudentId("");
      setName("");
      setEmail("");
      setDepartment("");
      setDescriptor(null);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 Enroll Student</h2>

        {message && <p style={styles.status(message)}>{message}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <h4>Student Details</h4>

            <input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={styles.input}
              required
            />

            <input
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
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.section}>
            <h4>Face Capture</h4>

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={styles.video}
            />

            <button
              type="button"
              onClick={captureAndExtract}
              disabled={
                loadingModels ||
                !studentId ||
                !name ||
                !email ||
                !department
              }
              style={styles.secondaryBtn}
            >
              📸 Capture Face
            </button>

            {descriptor && (
              <p style={{ color: "green", textAlign: "center" }}>
                ✅ Face captured
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!descriptor || submitting}
            style={{
              ...styles.primaryBtn,
              opacity: !descriptor ? 0.6 : 1,
              cursor: !descriptor ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Enrolling..." : "🚀 Enroll Student"}
          </button>
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
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  title: {
    textAlign: "center",
  },

  status: (msg) => ({
    textAlign: "center",
    padding: "10px",
    borderRadius: "6px",
    margin: "10px 0",
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

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
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
    fontWeight: "bold",
  },

  secondaryBtn: {
    padding: "10px",
    background: "#f1f1f1",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
};

export default AddStudent;