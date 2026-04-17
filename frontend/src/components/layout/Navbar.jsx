import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const styles = {
    navbar: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 32px",
      background: "rgba(15, 23, 42, 0.92)",
      borderBottom: "1px solid rgba(148, 163, 184, 0.28)",
      color: "#e5e7eb",
      backdropFilter: "blur(16px)",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    logo: {
      fontSize: "18px",
      fontWeight: 600,
      letterSpacing: "-0.03em",
    },
    logoAccent: {
      color: "#6366f1",
    },
    links: {
      display: "flex",
      gap: "18px",
      alignItems: "center",
    },
    link: {
      color: "#cbd5f5",
      textDecoration: "none",
      fontSize: "13px",
      padding: "6px 10px",
      borderRadius: "999px",
      transition: "background 0.15s ease, color 0.15s ease",
    },
    user: {
      marginRight: "6px",
      fontSize: "13px",
      color: "#9ca3af",
    },
    logoutBtn: {
      padding: "6px 14px",
      border: "none",
      borderRadius: "999px",
      background:
        "linear-gradient(135deg, #ef4444, #f97316)",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 500,
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(248, 113, 113, 0.4)",
      transition:
        "transform 0.1s ease, box-shadow 0.1s ease, filter 0.1s ease",
    },
  };

  const handleLinkEnter = (e) => {
    e.currentTarget.style.background = "rgba(79, 70, 229, 0.2)";
    e.currentTarget.style.color = "#e5e7eb";
  };

  const handleLinkLeave = (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = "#cbd5f5";
  };

  const handleLogoutEnter = (e) => {
    e.currentTarget.style.filter = "brightness(1.05)";
    e.currentTarget.style.transform = "translateY(-1px)";
  };

  const handleLogoutLeave = (e) => {
    e.currentTarget.style.filter = "none";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.logo}>
        Smart{" "}
        <span style={styles.logoAccent}>
          Attendance
        </span>
      </div>

      <div style={styles.links}>
        <Link
          style={styles.link}
          to="/dashboard"
          onMouseEnter={handleLinkEnter}
          onMouseLeave={handleLinkLeave}
        >
          Dashboard
        </Link>
        <Link
          style={styles.link}
          to="/add_student"
          onMouseEnter={handleLinkEnter}
          onMouseLeave={handleLinkLeave}
        >
          Add Student
        </Link>
        <Link
          style={styles.link}
          to="/attendance-table"
          onMouseEnter={handleLinkEnter}
          onMouseLeave={handleLinkLeave}
        >
          Attendance
        </Link>

        <span style={styles.user}>
          👤 {user?.name || "Admin"}
        </span>

        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={handleLogoutEnter}
          onMouseLeave={handleLogoutLeave}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;