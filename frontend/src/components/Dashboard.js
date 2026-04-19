// src/components/Dashboard.js

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardStats } from "../utils/api";

import { getUserFromToken } from "../utils/api";
import { applyThemeToBody } from "../utils/theme"; // 👈 ADD THIS

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
  const [dark, setDark] = useState(false);
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
  const getCardStyle = (dark) => ({
    ...styles.card,
    background: dark ? "#1e293b" : "rgba(255,255,255,0.7)",
    color: dark ? "#fff" : "#000",
  });

  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme") === "dark";
      setDark(savedTheme);
      applyThemeToBody(savedTheme);
    };

    applyTheme();
    window.addEventListener("themeChange", applyTheme);

    return () => window.removeEventListener("themeChange", applyTheme);
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
    <div
      style={{
        ...styles.container,
        background: dark
          ? "#0f172a"
          : "linear-gradient(135deg, #eef2ff, #f8fafc)",
        color: dark ? "#fff" : "#000",
      }}
    >
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <p
            style={{
              ...styles.cardTitle,
              color: dark ? "#cbd5f5" : "#64748b",
            }}
          >
            {new Date().toLocaleString()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Avatar */}
          <div style={styles.avatar}>{getInitials(name)}</div>

          {/* Text */}
          <div>
            <h1 style={styles.title}>
              K.H.KABBUR INSTITUTE OF ENGINEERING DHARWAD
            </h1>

            <p
              style={{
                ...styles.cardTitle,
                color: dark ? "#cbd5f5" : "#64748b",
              }}
            >
              {getGreeting()}, {name} ({role?.replace("ROLE_", "")})
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <p
            style={{
              ...styles.cardTitle,
              color: dark ? "#cbd5f5" : "#64748b",
            }}
          >
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div style={styles.stats}>
        <div
          style={{
            ...getCardStyle(dark),
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
          }}
        >
          <p style={styles.cardTitle}>👨‍🎓 Total Students</p>
          <p style={styles.number}>{stats.totalStudents}</p>
        </div>

        <div
          style={{
            ...getCardStyle(dark),
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
          }}
        >
          <p style={styles.cardTitle}>📅 Today's Attendance</p>
          <p style={styles.number}>{stats.todayAttendance}</p>
        </div>

        <div
          style={{
            ...getCardStyle(dark),
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
          }}
        >
          <p style={styles.cardTitle}>⚙️ System Status</p>
          <p style={styles.status}>🟢 {stats.systemStatus}</p>
        </div>
      </div>

      <div
        style={{
          ...getCardStyle(dark),
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER") && (
          <Link
            to="/attendance-table"
            style={{ ...styles.actionCard, ...styles.view }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
            }}
          >
            📋 View Attendance
          </Link>
        )}

        {role === "ROLE_ADMIN" && (
          <Link
            to="/add_student"
            style={{ ...styles.actionCard, ...styles.enroll }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
            }}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
            }}
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
    minHeight: "100vh",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: "600",
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
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    transition: "0.3s",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  actionCard: {
    padding: "18px",
    borderRadius: "14px",
    color: "white",
    textAlign: "center",
    textDecoration: "none",
    fontWeight: "600",
    transition: "0.3s",
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

  logout: {
    padding: "12px 25px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  footer: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
  },
  view: {
    background: "#3b82f6", // blue
  },
  enroll: {
    background: "#10b981", // green
  },

  kiosk: {
    background: "#6366f1", // purple
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
  },

  subtitle: {
    fontSize: "14px",
  },
  cardTitle: {
    fontSize: "14px",
    color: "#64748b",
  },

  number: {
    fontSize: "26px",
    fontWeight: "700",
  },

  status: {
    fontSize: "16px",
    fontWeight: "600",
  },

  note: {
    marginTop: "20px",
    fontSize: "14px",
  },
};
