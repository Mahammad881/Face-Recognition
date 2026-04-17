// src/components/AddStudentWithAutoRecognition.js
import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { enrollStudent, getStudentDescriptors, markPresent } from '../utils/api';

const MODEL_PATH = '/models';
const FACE_DETECTION_INTERVAL_MS = 1000;
const MIN_DISTANCE_THRESHOLD = 0.6;

function AddStudentWithAutoRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [descriptor, setDescriptor] = useState(null);
  const [status, setStatus] = useState('Loading models...');
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [recognizedName, setRecognizedName] = useState('');

  const token = localStorage.getItem('authToken');

  // --- Load models & start camera
  useEffect(() => {
    let currentStream;

    async function initModelsAndCamera() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        ]);
        setStatus('✅ Models loaded. Starting camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        currentStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setStatus('❌ Failed to load models or camera.');
      }
    }

    initModelsAndCamera();

    return () => {
      if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // --- Capture face descriptor
  const captureFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.paused || video.ended) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const result = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result) {
      setStatus('❌ No face detected. Adjust your position and try again.');
      return;
    }

    setDescriptor(Array.from(result.descriptor));
    setStatus('✅ Face captured! Ready to enroll.');
  };

  // --- Enroll student & setup matcher
  const handleEnroll = async () => {
    if (!studentId || !name || !descriptor) {
      setStatus('❌ Enter Student ID, Name and capture face first.');
      return;
    }

    try {
      await enrollStudent(
        { student_id: studentId, name, face_descriptor: JSON.stringify(descriptor) },
        token
      );
      setStatus(`✅ ${name} enrolled successfully!`);

      // Refresh student descriptors & create matcher
      const response = await getStudentDescriptors();
      const students = response.descriptors || [];
      setAllStudents(students);

      const labeledDescriptors = students.map(s => {
        return new faceapi.LabeledFaceDescriptors(
          String(s.student_id),
          [new Float32Array(s.face_descriptor)]
        );
      });
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, MIN_DISTANCE_THRESHOLD));
      setStudentId('');
      setName('');
      setDescriptor(null);

      setTimeout(() => startRecognition(), 1000); // Start recognition after 1s

    } catch (err) {
      console.error(err);
      setStatus(`❌ Enrollment failed: ${err.message}`);
    }
  };

  // --- Start recognition loop
  const startRecognition = () => {
    if (!faceMatcher || !videoRef.current) return;

    setStatus('🎯 Recognizing faces...');
    const interval = setInterval(async () => {
      const result = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) return;

      const bestMatch = faceMatcher.findBestMatch(result.descriptor);
      if (bestMatch.label !== 'unknown' && bestMatch.distance < MIN_DISTANCE_THRESHOLD) {
        const student = allStudents.find(s => String(s.student_id) === bestMatch.label);
        const studentName = student ? student.name : bestMatch.label;
        setRecognizedName(studentName);
        setStatus(`✅ Recognized: ${studentName}. Marking attendance...`);
        clearInterval(interval);
        try {
          await markPresent(bestMatch.label);
          setStatus(`✅ Attendance marked for ${studentName}`);
        } catch (err) {
          setStatus(`❌ Attendance marking failed: ${err.message}`);
        }
      }
    }, FACE_DETECTION_INTERVAL_MS);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Enroll & Auto-Recognize Student</h2>
      <p style={{ color: status.includes('❌') ? 'red' : 'green' }}>{status}</p>

      <input type="text" placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
      <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />

      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', border: '2px solid #007bff' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <button onClick={captureFace}>Capture Face</button>
      <button onClick={handleEnroll} disabled={!descriptor}>Enroll & Recognize</button>

      {recognizedName && <p>🎉 Student recognized: <strong>{recognizedName}</strong></p>}
    </div>
  );
}

export default AddStudentWithAutoRecognition;