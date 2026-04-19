import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { applyThemeToBody } from "../utils/theme";

function Navbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isAuthenticated = localStorage.getItem("authToken");

  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    const current = localStorage.getItem("theme") || "light";
    const newTheme = current === "dark" ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    setDark(newTheme === "dark"); // 👈 instant UI update

    window.dispatchEvent(new Event("themeChange"));
  };
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      style={{
        ...styles.navbar,
        background: dark ? "#1e293b" : "rgba(255,255,255,0.7)",
      }}
    >
      <div style={styles.logo}>🎓 Smart Attendance</div>
      <div style={styles.links}>
        {(role === "ROLE_ADMIN" ||
          role === "ROLE_TEACHER" ||
          role === "ROLE_STAFF") && (
          <NavLink
            to="/face"
            style={({ isActive }) => ({
              ...styles.link,

              color: dark
                ? isActive
                  ? "#818cf8"
                  : "#cbd5f5"
                : isActive
                  ? "#6366f1"
                  : "#334155",

              borderBottom: isActive
                ? `2px solid ${dark ? "#818cf8" : "#6366f1"}`
                : "none",
            })}
          >
            Face Recognition
          </NavLink>
        )}

        {(role === "ROLE_ADMIN" ||
          role === "ROLE_TEACHER" ||
          role === "ROLE_STAFF") && (
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              ...styles.link,

              color: dark
                ? isActive
                  ? "#818cf8"
                  : "#cbd5f5"
                : isActive
                  ? "#6366f1"
                  : "#334155",

              borderBottom: isActive
                ? `2px solid ${dark ? "#818cf8" : "#6366f1"}`
                : "none",
            })}
          >
            Dashboard
          </NavLink>
        )}

        {role === "ROLE_ADMIN" && (
          <NavLink
            to="/add_student"
            style={({ isActive }) => ({
              ...styles.link,

              color: dark
                ? isActive
                  ? "#818cf8"
                  : "#cbd5f5"
                : isActive
                  ? "#6366f1"
                  : "#334155",

              borderBottom: isActive
                ? `2px solid ${dark ? "#818cf8" : "#6366f1"}`
                : "none",
            })}
          >
            Add Student
          </NavLink>
        )}

        {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER") && (
          <NavLink
            to="/attendance-table"
            style={({ isActive }) => ({
              ...styles.link,

              color: dark
                ? isActive
                  ? "#818cf8"
                  : "#cbd5f5"
                : isActive
                  ? "#6366f1"
                  : "#334155",

              borderBottom: isActive
                ? `2px solid ${dark ? "#818cf8" : "#6366f1"}`
                : "none",
            })}
          >
            Attendance Table
          </NavLink>
        )}
      </div>
      {/* RIGHT SIDE */}
      <div style={styles.rightSection}>
        {/* 🌙 Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: dark ? "#1e293b" : "#6366f1",
            color: "#fff",
            fontWeight: "600",
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
        <span style={styles.role}>{role ? role.replace("ROLE_", "") : ""}</span>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 40px",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #e2e8f0",
  },

  logo: {
    fontWeight: "700",
    fontSize: "20px",
    background: "linear-gradient(90deg,#6366f1,#4f46e5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  links: {
    display: "flex",
    gap: "25px",
  },

  link: {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "500",
    paddingBottom: "4px",
    transition: "0.3s",
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  role: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  logout: {
    padding: "6px 14px",
    border: "none",
    background: "linear-gradient(90deg,#ef4444,#dc2626)",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
