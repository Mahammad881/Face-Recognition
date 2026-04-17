import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { enrollStudent } from "../../utils/api";

const MODEL_PATH = "/models";

function AddStudent() {

  const videoRef = useRef(null);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [descriptor, setDescriptor] = useState(null);
  const [status, setStatus] = useState("Loading models...");
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {

    let stream;

    const init = async () => {

      try {

        setStatus("Loading AI models...");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_PATH),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
        ]);

        setStatus("Starting camera...");

        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if(videoRef.current){
          videoRef.current.srcObject = stream;
        }

        setLoading(false);
        setStatus("Camera ready. Enter student details.");

      } catch (error) {

        console.error(error);
        setStatus("Initialization failed. Check camera permission.");

      }

    };

    init();

    return () => {
      if(stream){
        stream.getTracks().forEach(track => track.stop());
      }
    };

  }, []);

  const captureFace = async () => {

    if(!studentId || !name){
      setStatus("Enter student ID and name first.");
      return;
    }

    if (!videoRef.current || videoRef.current.readyState < 2) {
      setStatus("Camera not ready yet. Please wait a second and try again.");
      return;
    }

    try{

      setCapturing(true);
      setStatus("Detecting face...");

      const result = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.4
          })
        )
        .withFaceLandmarks(true) // use tiny landmark model
        .withFaceDescriptor();

      if(!result){
        setStatus("No face detected. Try again.");
        setCapturing(false);
        return;
      }

      const faceDescriptor = Array.from(result.descriptor);

      setDescriptor(faceDescriptor);
      setStatus("Face captured successfully.");

    }
    catch(error){

      console.error(error);
      setStatus("Face capture failed.");

    }
    finally{
      setCapturing(false);
    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if(!descriptor){
      setStatus("Capture face before enrolling.");
      return;
    }

    try{

      setStatus("Saving student...");

      await enrollStudent({
        student_id:studentId,
        name,
        face_descriptor:descriptor
      });

      setStatus("Student enrolled successfully!");

      setStudentId("");
      setName("");
      setDescriptor(null);

      window.dispatchEvent(new Event("student-enrolled"));

    }
    catch(error){

      console.error(error);
      setStatus("Enrollment failed.");

    }

  };

  const styles = {

    page:{
      background:"#f4f6f8",
      minHeight:"100vh",
      padding:"40px",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      fontFamily:"Arial"
    },

    card:{
      background:"#fff",
      padding:"30px",
      borderRadius:"12px",
      width:"420px",
      boxShadow:"0 8px 25px rgba(0,0,0,0.08)"
    },

    title:{
      marginBottom:"20px",
      textAlign:"center"
    },

    input:{
      width:"100%",
      padding:"10px",
      marginBottom:"12px",
      borderRadius:"6px",
      border:"1px solid #ddd"
    },

    video:{
      width:"100%",
      borderRadius:"10px",
      marginTop:"10px",
      marginBottom:"15px",
      border:"1px solid #eee"
    },

    captureBtn:{
      width:"100%",
      padding:"10px",
      background:"#2563eb",
      color:"#fff",
      border:"none",
      borderRadius:"6px",
      cursor:"pointer",
      marginBottom:"10px"
    },

    enrollBtn:{
      width:"100%",
      padding:"10px",
      background:"#16a34a",
      color:"#fff",
      border:"none",
      borderRadius:"6px",
      cursor:"pointer"
    },

    status:{
      textAlign:"center",
      marginBottom:"15px",
      fontSize:"14px",
      color:"#555"
    }

  };

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <h2 style={styles.title}>🎓 Enroll Student</h2>

        <p style={styles.status}>{status}</p>

        <form onSubmit={handleSubmit}>

          <input
            style={styles.input}
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e)=>setStudentId(e.target.value)}
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />

          <button
            type="button"
            style={styles.captureBtn}
            onClick={captureFace}
            disabled={loading || capturing}
          >
            {capturing ? "Capturing..." : "📸 Capture Face"}
          </button>

          <button
            type="submit"
            style={styles.enrollBtn}
            disabled={!descriptor}
          >
            ✅ Enroll Student
          </button>

        </form>

      </div>

    </div>

  );

}

export default AddStudent;