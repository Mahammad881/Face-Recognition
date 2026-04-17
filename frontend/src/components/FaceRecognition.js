// frontend/src/components/FaceRecognition.js

import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { getStudentDescriptors, markPresent } from "../utils/api";

const MODEL_PATH = "/models";
const MIN_DISTANCE_THRESHOLD = 0.45;
const DETECTION_INTERVAL = 500;

function FaceRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [message, setMessage] = useState("⏳ Loading models...");
  const [faceMatcher, setFaceMatcher] = useState(null);

  const studentsRef = useRef([]);
  const detectingRef = useRef(false);
  const intervalRef = useRef(null);
  const messageRef = useRef("");
  const noFaceCountRef = useRef(0);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // ✅ LOAD MODELS + CAMERA
  useEffect(() => {
    let stream;

    const setup = async () => {
      try {
        setMessage("⏳ Loading AI models...");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        ]);

        setMessage("✅ Models loaded. Starting camera...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        videoRef.current.srcObject = stream;
        // ✅ ADD HERE
        videoRef.current.onplay = () => console.log("🎥 Video started");

        await loadStudents();
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load models or camera.");
      }
    };

    setup();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ FIXED LOAD STUDENTS (MAIN FIX HERE 🔥)
  const loadStudents = async () => {
    try {
      const data = await getStudentDescriptors();

      console.log("🔥 RAW DATA:", data);

      if (!data || !data.length) {
        setMessage("⚠ No students enrolled yet.");
        return;
      }

      studentsRef.current = data.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        descriptor: s.descriptor,
        lastMarked: null,
      }));

      const labeledDescriptors = [];

      data.forEach((student) => {
        try {
          let descriptor = student.descriptor;

          if (!descriptor) return;

          // ✅ FIX 1: Proper JSON parse
          if (typeof descriptor === "string") {
            descriptor = JSON.parse(descriptor);
          }
          // ✅ handle single OR multiple descriptors
          const descriptorList = Array.isArray(descriptor[0])
            ? descriptor
            : [descriptor];

          const floatDescriptors = descriptorList.map(
            (d) => new Float32Array(d.map((v) => Number(v))),
          );

          labeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(
              student.studentId,
              floatDescriptors,
            ),
          );
        } catch (err) {
          console.error("❌ Parse failed:", student.name, err);
        }
      });

      console.log("✅ FINAL COUNT:", labeledDescriptors.length);

      if (!labeledDescriptors.length) {
        setMessage("❌ No valid face data found.");
        return;
      }

      const matcher = new faceapi.FaceMatcher(
        labeledDescriptors,
        MIN_DISTANCE_THRESHOLD,
      );

      setFaceMatcher(matcher);

      setMessage(`✅ Loaded ${labeledDescriptors.length} student(s)`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load student data.");
    }
  };

  // ✅ DETECTION LOOP
  useEffect(() => {
    if (!faceMatcher || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const startDetection = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const displaySize = { width: 640, height: 480 };
      faceapi.matchDimensions(canvas, displaySize);

      intervalRef.current = setInterval(async () => {
        if (detectingRef.current) return;
        detectingRef.current = true;

        try {
          const detections = await faceapi
            .detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
                scoreThreshold: 0.6,
              }),
            )
            .withFaceLandmarks(true)
            .withFaceDescriptors();

          const resized = faceapi.resizeResults(detections, displaySize);

          if (resized.length === 0) {
            noFaceCountRef.current++;

            if (noFaceCountRef.current > 5) {
              setMessage("⚠ No face detected");
            }
          } else {
            noFaceCountRef.current = 0;
          }

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          resized.forEach((detection) => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            const box = detection.detection.box;

            if (
              bestMatch.label !== "unknown" &&
              bestMatch.distance < MIN_DISTANCE_THRESHOLD
            ) {
              const student = studentsRef.current.find(
                (s) => s.studentId === bestMatch.label,
              );

              if (!student) return;
              const now = Date.now();

              if (!student.lastMarked || now - student.lastMarked > 5000) {
                markPresent(student.studentId)
                  .then((res) => {
                    if (res.status === "cooldown") {
                      setMessage(`⏳ ${student.name}: ${res.message}`);
                    } else if (res.status === "success") {
                      student.lastMarked = now;
                      setMessage(`✅ ${student.name} marked present`);
                    } else {
                      setMessage(`⚠ ${student.name}: Unexpected response`);
                    }
                  })
                  .catch((err) => {
                    setMessage(`❌ ${student.name}: ${err.message}`);
                  });
              }

              new faceapi.draw.DrawBox(box, {
                label: bestMatch.label,
              }).draw(canvas);
            } else {
              new faceapi.draw.DrawBox(box, {
                label: "Unknown",
              }).draw(canvas);
            }
          });
        } catch (err) {
          console.error("Detection error:", err);
        }
        
        detectingRef.current = false;
      }, DETECTION_INTERVAL);
    };

    // ✅ THIS WAS MISSING
    if (video.readyState === 4) {
      setTimeout(startDetection, 500);
    } else {
      video.onloadeddata = () => {
        setTimeout(startDetection, 500);
      };
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [faceMatcher]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>🎓 Smart Attendance Kiosk</h2>

      <p style={{ color: "#007bff", fontWeight: "bold" }}>{message}</p>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="640"
          height="480"
          style={{ borderRadius: "10px" }}
        />

        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export default FaceRecognition;
