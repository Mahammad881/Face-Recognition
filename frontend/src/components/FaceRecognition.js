// frontend/src/components/FaceRecognition.js
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { getStudentDescriptors, markPresent } from "../utils/api";
import { applyThemeToBody } from "../utils/theme"; // 👈 ADD THIS
const MODEL_PATH = "/models";
const MIN_DISTANCE_THRESHOLD = 0.5;
const DETECTION_INTERVAL = 500;
// ✅ ✅ ✅ ADD THIS HERE (ABOVE COMPONENT)

const getRemainingPeriodTime = (currentTime, startTime) => {
  const TOTAL_MS = 60 * 60 * 1000;

  const elapsed = currentTime - startTime;
  const remaining = Math.max(0, TOTAL_MS - elapsed);

  const mins = Math.floor(remaining / 60000);

  return `${mins} min`; // ✅ ONLY MINUTES
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
function FaceRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      let theme = localStorage.getItem("theme");

      // ✅ FIX: default theme
      if (!theme) {
        theme = "light";
        localStorage.setItem("theme", "light");
      }

      const isDark = theme === "dark";
      setDark(isDark);
      applyThemeToBody(isDark);
    };

    applyTheme();
    window.addEventListener("themeChange", applyTheme);

    return () => window.removeEventListener("themeChange", applyTheme);
  }, []);
  const [message, setMessage] = useState("⏳ Loading models...");
  const [faceMatcher, setFaceMatcher] = useState(null);
  const studentsRef = useRef([]);
  const detectingRef = useRef(false);
  const intervalRef = useRef(null);
  const messageRef = useRef("");
  const noFaceCountRef = useRef(0);
  const speakingRef = useRef(false);
  // ✅ ADD HERE
  const status = message.includes("✅")
    ? "success"
    : message.includes("⚠")
      ? "warning"
      : message.includes("❌")
        ? "error"
        : "idle";

  const [currentTime, setCurrentTime] = useState(Date.now());
  const currentTimeRef = useRef(currentTime);

  const PERIOD_START_TIME = useRef(
    new Date(new Date().setMinutes(0, 0, 0)), // start of current hour
  );
  const speak = (text) => {
    if (speakingRef.current) return;
    speakingRef.current = true;
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // 🎯 Select female voice
    const femaleVoice =
      voices.find(
        (v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("zira") || // Windows
          v.name.toLowerCase().includes("samantha") || // Mac
          v.name.toLowerCase().includes("google uk english female"),
      ) || voices[0];
    speech.voice = femaleVoice;
    speech.lang = femaleVoice.lang;
    // 🎯 Natural sound tuning
    speech.rate = 0.9;
    speech.pitch = 1.2;
    speech.onend = () => {
      speakingRef.current = false;
    };
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);
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
            const confidence = (1 - bestMatch.distance).toFixed(2);
            const box = detection.detection.box;

            const student = studentsRef.current.find(
              (s) => s.studentId === bestMatch.label,
            );

            if (
              bestMatch.label !== "unknown" &&
              bestMatch.distance < MIN_DISTANCE_THRESHOLD &&
              student
            ) {
              const now = Date.now();

              if (!student.lastMarked || now - student.lastMarked > 60000) {
                markPresent(student.studentId)
                  .then((res) => {
                    const remainingTime = getRemainingPeriodTime(
                      currentTimeRef.current,
                      PERIOD_START_TIME.current,
                    );

                    if (res.status === "cooldown") {
                      const msg = `${student.name}, already marked. ${remainingTime} left`;
                      setMessage(
                        `⏳ ${student.name} Already Present • ${remainingTime}`,
                      );
                      setTimeout(() => speak(msg), 300);
                    } else if (res.status === "success") {
                      student.lastMarked = now;

                      const msg = `${getGreeting()} ${student.name}, marked. ${remainingTime} left`;
                      setMessage(
                        `✅ ${student.name} marked • ${remainingTime}`,
                      );
                      setTimeout(() => speak(msg), 300);
                    } else {
                      setMessage(`⚠ ${student.name}: Unexpected`);
                    }
                  })
                  .catch((err) => {
                    setMessage(`❌ ${student.name}: ${err.message}`);
                  });
              }

              new faceapi.draw.DrawBox(box, {
                label: student.name,
              }).draw(canvas);
            } else {
              new faceapi.draw.DrawBox(box, {
                label: student ? `${student.name} (${confidence})` : "Unknown",
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
    <div
      style={{
        background: dark ? "#0f172a" : "#f1f5f9",
        color: dark ? "#fff" : "#000",

        display: "flex",
        flexDirection: "column",
        alignItems: "center", // 👈 CENTER horizontally
        justifyContent: "center",
        minHeight: "100vh", // 👈 FULL screen height
        textAlign: "center",
      }}
    >
      <h2>🎓 Smart Attendance Kiosk</h2>

      <div
        style={{
          padding: "8px 16px",
          borderRadius: "20px",
          background:
            status === "success"
              ? "#dcfce7"
              : status === "warning"
                ? "#fef3c7"
                : status === "error"
                  ? "#fee2e2"
                  : "#e5e7eb",
          color: "#000",
          fontWeight: "600",
          marginTop: "10px",
        }}
      >
        {message}
      </div>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginTop: "20px", // 👈 spacing
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="640"
          height="480"
          style={{
            borderRadius: "10px",

            border:
              status === "success"
                ? "4px solid #22c55e"
                : status === "warning"
                  ? "4px solid #f59e0b"
                  : status === "error"
                    ? "4px solid #ef4444"
                    : "4px solid transparent",

            boxShadow:
              status === "success"
                ? "0 0 20px rgba(34,197,94,0.6)"
                : status === "warning"
                  ? "0 0 20px rgba(245,158,11,0.6)"
                  : status === "error"
                    ? "0 0 20px rgba(239,68,68,0.6)"
                    : "none",

            transition: "0.3s",
          }}
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
