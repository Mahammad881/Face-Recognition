import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { getStudentDescriptors, markPresent } from '../utils/api';

const MODEL_PATH = '/models';
const FACE_DETECTION_INTERVAL_MS = 500;
const MIN_DISTANCE_THRESHOLD = 0.55;
const COOLDOWN_MINUTES = 60; // 1 hour

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMatcherRef = useRef(null);
  const studentsRef = useRef([]);
  const smoothBoxesRef = useRef({});
  const nameOpacityRef = useRef({});

  const [status, setStatus] = useState('Initializing...');

  // --- Load models and students
  useEffect(() => {
    let stream;

    const setup = async () => {
      try {
        setStatus('⏳ Loading AI models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        ]);

        setStatus('⏳ Loading student data...');
        const descriptors = await getStudentDescriptors();

        if (!descriptors || descriptors.length === 0) {
          setStatus('⚠️ No students enrolled.');
          return;
        }

        // Store student info including lastMarked
        studentsRef.current = descriptors.map(s => ({ ...s, lastMarked: null }));

        const labeledDescriptors = descriptors.map(student =>
          new faceapi.LabeledFaceDescriptors(
            student.student_id,
            [new Float32Array(student.face_descriptor)]
          )
        );

        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, MIN_DISTANCE_THRESHOLD);

        setStatus('✅ Models loaded. Starting camera...');
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('✅ Camera started. Ready for recognition.');
      } catch (err) {
        console.error(err);
        setStatus('❌ Failed to load models or students.');
      }
    };

    setup();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // --- Detection loop with 1-hour cooldown
  useEffect(() => {
    if (!videoRef.current) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!faceMatcherRef.current || !video || video.paused || video.ended) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // fade all name opacities slightly
      for (const key in nameOpacityRef.current) {
        nameOpacityRef.current[key] = Math.max(0, nameOpacityRef.current[key] - 0.05);
      }

      detections.forEach(det => {
        const bestMatch = faceMatcherRef.current.findBestMatch(det.descriptor);
        const studentId = bestMatch.label;
        const student = studentsRef.current.find(s => s.student_id === studentId);
        const name = studentId !== 'unknown' ? student?.name || studentId : 'Unknown';

        // Smooth bounding box
        const box = det.detection.box;
        const prev = smoothBoxesRef.current[name] || { x: box.x, y: box.y };
        const smoothX = prev.x + (box.x - prev.x) * 0.3;
        const smoothY = prev.y + (box.y - prev.y) * 0.3;
        smoothBoxesRef.current[name] = { x: smoothX, y: smoothY };

        // Smooth opacity for fade-in
        nameOpacityRef.current[name] = Math.min(1, (nameOpacityRef.current[name] || 0) + 0.1);

        // Draw bounding box
        ctx.strokeStyle = studentId === 'unknown' ? 'red' : 'lime';
        ctx.lineWidth = 2;
        ctx.strokeRect(smoothX, smoothY, box.width, box.height);

        // Draw name
        ctx.globalAlpha = nameOpacityRef.current[name];
        ctx.font = '18px Arial';
        ctx.fillStyle = studentId === 'unknown' ? 'red' : 'lime';
        ctx.fillText(name, smoothX, smoothY - 10);
        ctx.globalAlpha = 1.0;

        // ✅ Attendance marking with 1-hour cooldown
        if (studentId !== 'unknown') {
          const now = new Date();
          if (!student.lastMarked || (now - student.lastMarked) / 60000 > COOLDOWN_MINUTES) {
            markPresent(studentId)
              .then(() => {
                student.lastMarked = now;
                setStatus(`✅ ${student.name}, attendance marked!`);
              })
              .catch(err => {
                console.error(`❌ Failed to mark attendance for ${student.name}`, err);
                setStatus(`❌ Failed to mark attendance for ${student.name}`);
              });
          } else {
            setStatus(`⏳ ${student.name}, already present. Try again after 1 hour`);
          }
        }
      });
    }, FACE_DETECTION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <h2>Smart Attendance Kiosk</h2>
      <p style={{ fontWeight: 'bold', color: '#007bff' }}>{status}</p>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: 640, height: 480, borderRadius: 12 }}
        />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>
    </div>
  );
};

export default FaceRecognition;