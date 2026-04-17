import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const styles = {
    container: {
      padding: "8px 4px",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#e5e7eb",
    },
    title: {
      marginBottom: "24px",
      fontSize: "22px",
      fontWeight: 600,
      letterSpacing: "-0.03em",
    },
    subtitle: {
      fontSize: "13px",
      color: "#9ca3af",
      marginTop: "4px",
      marginBottom: "24px",
    },
    cards: {
      display: "flex",
      gap: "18px",
      marginBottom: "32px",
      flexWrap: "wrap",
    },
    card: {
      flex: "1",
      minWidth: "220px",
      background:
        "radial-gradient(circle at top right, #1d263b, #020617)",
      padding: "18px 16px",
      borderRadius: "16px",
      border: "1px solid rgba(148, 163, 184, 0.25)",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.6)",
    },
    cardLabel: {
      fontSize: "13px",
      color: "#9ca3af",
    },
    number: {
      fontSize: "28px",
      fontWeight: 700,
      marginTop: "8px",
      color: "#f9fafb",
    },
    quickActionsHeader: {
      fontSize: "16px",
      fontWeight: 500,
      marginBottom: "14px",
      color: "#e5e7eb",
    },
    actions: {
      display: "flex",
      gap: "14px",
      flexWrap: "wrap",
    },
    actionBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "999px",
      background:
        "linear-gradient(135deg, #4f46e5, #6366f1)",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      boxShadow: "0 10px 24px rgba(79, 70, 229, 0.5)",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      transition:
        "transform 0.1s ease, box-shadow 0.1s ease, filter 0.1s ease",
    },
    secondaryBtn: {
      background:
        "linear-gradient(135deg, #22c55e, #16a34a)",
      boxShadow: "0 10px 24px rgba(34, 197, 94, 0.45)",
    },
    tertiaryBtn: {
      background:
        "linear-gradient(135deg, #0ea5e9, #6366f1)",
      boxShadow: "0 10px 24px rgba(14, 165, 233, 0.45)",
    },
  };

  const handleHoverEnter = (e) => {
    e.currentTarget.style.filter = "brightness(1.06)";
    e.currentTarget.style.transform = "translateY(-1px)";
  };

  const handleHoverLeave = (e) => {
    e.currentTarget.style.filter = "none";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <div style={styles.container}>
      <div>
        <h1 style={styles.title}>
          Welcome {user?.name || "Admin"} 👋
        </h1>
        <p style={styles.subtitle}>
          Monitor student presence, run face recognition and review daily
          attendance from a single dashboard.
        </p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Students</div>
          <div style={styles.number}>120</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Today's Attendance</div>
          <div style={styles.number}>85</div>
        </div>
      </div>

      <h2 style={styles.quickActionsHeader}>Quick actions</h2>

      <div style={styles.actions}>
        <button
          style={styles.actionBtn}
          onClick={() => navigate("/add_student")}
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
        >
          <span>➕</span>
          <span>Add student</span>
        </button>

        <button
          style={{ ...styles.actionBtn, ...styles.secondaryBtn }}
          onClick={() => navigate("/")}
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
        >
          <span>📷</span>
          <span>Start face recognition</span>
        </button>

        <button
          style={{ ...styles.actionBtn, ...styles.tertiaryBtn }}
          onClick={() => navigate("/attendance-table")}
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
        >
          <span>📋</span>
          <span>View attendance</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;