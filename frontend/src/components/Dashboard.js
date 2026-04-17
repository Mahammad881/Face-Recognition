// src/components/Dashboard.js

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardStats } from "../utils/api";

import { getUserFromToken } from "../utils/api"; // 👈 ADD THIS

function Dashboard() {
  const navigate = useNavigate();
  const user = getUserFromToken(); // ✅ FIRST
  const isAuthenticated = !!user; // ✅ THEN USE IT

  const name = user?.sub || "User";
  const role = user?.role || "";

  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    systemStatus: "Loading...",
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
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
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Avatar */}
          <div style={styles.avatar}>{getInitials(name)}</div>

          {/* Text */}
          <div>
            <h1 style={styles.title}>
              K.H.KABBUR INSTITUTE OF ENGINEERING DHARWAD
            </h1>

            <p style={styles.subtitle}>
              {getGreeting()}, {name} ({role?.replace("ROLE_", "")})
            </p>
          </div>
        </div>

        <p style={styles.subtitle}>{new Date().toLocaleString()}</p>
      </div>

      <div style={styles.stats}>
        <div
          style={styles.card}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-6px) scale(1.02)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0) scale(1)")
          }
        >
          <p style={styles.cardTitle}>Total Students</p>
          <p style={styles.number}>{stats.totalStudents}</p>
        </div>

        <div
          style={styles.card}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-6px) scale(1.02)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0) scale(1)")
          }
        >
          <p style={styles.cardTitle}>Today's Attendance</p>
          <p style={styles.number}>{stats.todayAttendance}</p>
        </div>

        <div
          style={styles.card}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-6px) scale(1.02)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0) scale(1)")
          }
        >
          <p style={styles.cardTitle}>System Status</p>
          <p style={styles.status}>🟢 {stats.systemStatus}</p>
        </div>
      </div>

      <div style={styles.actions}>
        {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER") && (
          <Link
            to="/attendance-table"
            style={{ ...styles.actionCard, ...styles.view }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-6px) scale(1.02)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0) scale(1)")
            }
          >
            📋 View Attendance
          </Link>
        )}

        {role === "ROLE_ADMIN" && (
          <Link
            to="/add_student"
            style={{ ...styles.actionCard, ...styles.enroll }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-6px) scale(1.02)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0) scale(1)")
            }
          >
            ➕ Enroll Student
          </Link>
        )}

        {(role === "ROLE_ADMIN" ||
          role === "ROLE_TEACHER" ||
          role === "ROLE_STAFF") && (
          <Link
            to="/face"
            style={{ ...styles.actionCard, ...styles.kiosk }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-6px) scale(1.02)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0) scale(1)")
            }
          >
            📷 Start Face Recognition
          </Link>
        )}
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
    fontFamily: "Inter, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  greeting: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600",
  },

  roleBadge: {
    background: "#e0f2fe",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#0369a1",
  },

  time: {
    color: "#64748b",
    fontSize: "14px",
  },

  avatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    transition: "0.3s",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  actionCard: {
    padding: "20px",
    borderRadius: "12px",
    background: "#3b82f6",
    color: "white",
    textAlign: "center",
    textDecoration: "none",
    fontWeight: "600",
  },

  actionCardGreen: {
    padding: "20px",
    borderRadius: "12px",
    background: "#10b981",
    color: "white",
    textAlign: "center",
    textDecoration: "none",
  },

  actionCardPurple: {
    padding: "20px",
    borderRadius: "12px",
    background: "#6366f1",
    color: "white",
    textAlign: "center",
    textDecoration: "none",
  },
}; 