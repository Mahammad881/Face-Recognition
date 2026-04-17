// src/components/attendance/FaceRecognitionKiosk.jsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import * as faceapi from "face-api.js";

const FaceRecognitionKiosk = ({ onAttendanceMarked }) => {

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState("Initializing system...");

  /**
   * Load AI models
   */
  const loadModels = useCallback(async () => {
    try {

      const MODEL_URL = "/models";

      setStatus("Loading AI face models...");

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setStatus("Models loaded successfully.");
      setLoading(false);

    } catch {
      setError("Failed to load face recognition models.");
    }
  }, []);

  /**
   * Start camera
   */
  const startVideo = useCallback(async () => {
    try {

      setStatus("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      setStatus("Camera ready. Please face the camera.");

    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available.");
    }
  }, []);

  /**
   * Initialize system
   */
  useEffect(() => {

    loadModels();
    startVideo();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };

  }, [loadModels, startVideo]);

  /**
   * Detect face
   */
  const detectFace = useCallback(async () => {

    if (!videoRef.current) return;

    setDetecting(true);
    setStatus("Scanning face...");

    try {

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detection) {

        setStatus("Face detected. Attendance marked ✅");
        onAttendanceMarked();

      } else {

        setStatus("No face detected. Please try again.");

      }

    } catch {
      setError("Face detection failed.");
    }

    setDetecting(false);

  }, [onAttendanceMarked]);

  /**
   * Loading UI
   */
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>🔄 Initializing Face Recognition</h2>
          <p>{status}</p>
        </div>
      </div>
    );
  }

  /**
   * Error UI
   */
  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.errorCard}>
          <h3>⚠ System Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  /**
   * Main UI
   */
  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <h2 style={styles.title}>🎓 Attendance Kiosk</h2>

        <p style={styles.status}>{status}</p>

        <div style={styles.cameraFrame}>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />

        </div>

        <button
          onClick={detectFace}
          disabled={detecting}
          style={styles.button}
        >
          {detecting ? "Scanning..." : "📸 Mark Attendance"}
        </button>

      </div>

    </div>

  );

};

/**
 * Prop validation
 */
FaceRecognitionKiosk.propTypes = {
  onAttendanceMarked: PropTypes.func,
};

FaceRecognitionKiosk.defaultProps = {
  onAttendanceMarked: () => {},
};

export default FaceRecognitionKiosk;


/**
 * Styles
 */
const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f9",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "420px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },

  errorCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    textAlign: "center",
    border: "2px solid #ef4444",
    color: "#ef4444",
  },

  title: {
    marginBottom: "10px",
  },

  status: {
    fontSize: "14px",
    marginBottom: "15px",
    color: "#555",
  },

  cameraFrame: {
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "15px",
  },

  video: {
    width: "100%",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },

};