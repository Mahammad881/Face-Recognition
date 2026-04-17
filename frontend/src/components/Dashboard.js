// src/components/Dashboard.js

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardStats } from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("authToken");

  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    systemStatus: "Loading...",
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        console.log("API DATA:", data); // 👈 ADD THIS
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadStats();

    const interval = setInterval(loadStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <p>
          Please <Link to="/login">log in</Link> to access the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎓 Smart Attendance Dashboard</h1>

      <div style={styles.stats}>
        <div style={styles.card}>
          <h3>Total Students</h3>
          <p style={styles.number}>{stats.totalStudents}</p>
        </div>

        <div style={styles.card}>
          <h3>Today's Attendance</h3>
          <p style={styles.number}>{stats.todayAttendance}</p>
        </div>

        <div style={styles.card}>
          <h3>System Status</h3>
          <p style={styles.status}>🟢 {stats.systemStatus}</p>
        </div>
      </div>

      <div style={styles.actions}>
        <Link
          to="/attendance-table"
          style={{ ...styles.actionCard, ...styles.view }}
        >
          📋 View Attendance
        </Link>

        <Link
          to="/add_student"
          style={{ ...styles.actionCard, ...styles.enroll }}
        >
          ➕ Enroll Student
        </Link>

        <Link to="/face" style={{ ...styles.actionCard, ...styles.kiosk }}>
          📷 Start Face Recognition
        </Link>
      </div>

      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logout}>
          🚪 Logout
        </button>
      </div>

      <p style={styles.note}>
        Attendance kiosk runs on the home page: <Link to="/">/ (Home)</Link>
      </p>
    </div>
  );
}

export default Dashboard;

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    background: "#f4f6f9",
    minHeight: "100vh",
  },

  title: {
    marginBottom: "30px",
    color: "#1e293b",
  },

  stats: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
  },

  card: {
    flex: 1,
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  number: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "10px",
  },

  status: {
    fontSize: "20px",
    marginTop: "10px",
  },

  actions: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
  },

  actionCard: {
    flex: 1,
    padding: "25px",
    textAlign: "center",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
    color: "white",
    transition: "transform 0.2s ease",
  },

  view: {
    background: "#3b82f6",
  },

  enroll: {
    background: "#10b981",
  },

  kiosk: {
    background: "#6366f1",
  },

  footer: {
    marginBottom: "20px",
  },

  logout: {
    padding: "10px 20px",
    border: "none",
    background: "#ef4444",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },

  note: {
    color: "#555",
  },
};
