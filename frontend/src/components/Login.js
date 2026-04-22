// frontend/src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import "./Login.css";
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "380px",
    padding: "35px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "5px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "25px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg,#007bff,#0056d2)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    letterSpacing: "0.5px",
    transition: "all 0.2s ease",
  },

  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "10px",
  },

  footer: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#888",
  },
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        username: username.trim(),
        password: password.trim(),
      });

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", data.role);

      await new Promise((resolve) => setTimeout(resolve, 100));

      setUsername("");
      setPassword("");

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>Smart Attendance</div>
        <div style={styles.subtitle}>Admin Panel Login</div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
            aria-label="Username"
          />

          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              aria-label="Password"
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                padding: "6px",
                cursor: "pointer",
                zIndex: 2,
                color: "#000",
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
            }}
          >
            {loading ? "⏳ Authenticating..." : "Login"}
          </button>
        </form>

        <div style={styles.footer}>Smart Attendance System © 2026</div>
      </div>
    </div>
  );
}

export default Login;
