import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(circle at top left, #4f46e533, #0f172a 60%, #020617)",
      padding: "16px",
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      background: "rgba(15, 23, 42, 0.96)",
      borderRadius: "18px",
      border: "1px solid rgba(148, 163, 184, 0.25)",
      boxShadow:
        "0 24px 60px rgba(15, 23, 42, 0.6), 0 0 0 1px rgba(15, 23, 42, 0.9)",
      padding: "32px 28px 28px",
      color: "#e5e7eb",
      backdropFilter: "blur(14px)",
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "999px",
      background: "rgba(37, 99, 235, 0.2)",
      color: "#93c5fd",
      fontSize: "11px",
      fontWeight: 500,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: "16px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 600,
      letterSpacing: "-0.03em",
      marginBottom: "4px",
      color: "#f9fafb",
    },
    subtitle: {
      fontSize: "13px",
      color: "#9ca3af",
      marginBottom: "24px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    label: {
      fontSize: "12px",
      color: "#9ca3af",
      marginBottom: "4px",
    },
    inputWrapper: {
      display: "flex",
      flexDirection: "column",
      textAlign: "left",
    },
    input: {
      width: "100%",
      padding: "10px 11px",
      borderRadius: "10px",
      border: "1px solid rgba(55, 65, 81, 0.9)",
      background: "rgba(15, 23, 42, 0.85)",
      color: "#e5e7eb",
      fontSize: "13px",
      outline: "none",
      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    },
    error: {
      fontSize: "12px",
      color: "#fca5a5",
      marginTop: "4px",
      minHeight: "16px",
    },
    button: {
      marginTop: "6px",
      width: "100%",
      padding: "10px 14px",
      borderRadius: "999px",
      border: "none",
      background:
        "linear-gradient(135deg, #4f46e5, #6366f1, #22c55e 120%)",
      color: "white",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow:
        "0 12px 30px rgba(79, 70, 229, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.5)",
      transition:
        "transform 0.1s ease, box-shadow 0.1s ease, filter 0.1s ease, opacity 0.1s ease",
    },
    buttonDisabled: {
      opacity: 0.7,
      cursor: "default",
      boxShadow: "none",
    },
    footer: {
      marginTop: "18px",
      fontSize: "11px",
      color: "#6b7280",
      textAlign: "center",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>
          <span>Smart Attendance</span>
        </div>

        <h2 style={styles.title}>Sign in to your panel</h2>
        <p style={styles.subtitle}>
          Manage students, face recognition and attendance in one place.
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) =>
                (e.target.style.boxShadow =
                  "0 0 0 1px #4f46e5, 0 0 0 4px rgba(79, 70, 229, 0.35)")
              }
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) =>
                (e.target.style.boxShadow =
                  "0 0 0 1px #4f46e5, 0 0 0 4px rgba(79, 70, 229, 0.35)")
              }
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          <div style={styles.error}>{error}</div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = "brightness(1.05)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(79, 70, 229, 0.4)";
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow =
                  "0 12px 30px rgba(79, 70, 229, 0.6)";
              }
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={styles.footer}>
          Face recognition powered Smart Attendance System
        </div>
      </div>
    </div>
  );
}

export default Login;