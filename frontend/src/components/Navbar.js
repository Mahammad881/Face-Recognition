import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isAuthenticated = localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav style={styles.navbar}>
     
      <div style={styles.logo}>
        🎓 Smart Attendance
      </div>

      <div style={styles.links}>

        {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER" || role === "ROLE_STAFF") && (
          <NavLink to="/face" style={styles.link}>
            Face Recognition
          </NavLink>
        )}

        {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER"|| role === "ROLE_STAFF" ) && (
          <NavLink to="/dashboard" style={styles.link}>
            Dashboard
          </NavLink>
        )}

        {role === "ROLE_ADMIN" && (
          <NavLink to="/add_student" style={styles.link}>
            Add Student
          </NavLink>
        )}

        {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER") && (
          <NavLink to="/attendance-table" style={styles.link}>
            Attendance Table
          </NavLink>
        )}

      </div>

      {/* RIGHT SIDE */}
      <div style={styles.rightSection}>
        <span style={styles.role}>
          {role ? role.replace("ROLE_", "") : ""}
        </span>

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
    background: "white",
    borderBottom: "1px solid #e2e8f0",
  },

  logo: {
    fontWeight: "700",
    fontSize: "18px",
    color: "#0f172a",
  },

  links: {
    display: "flex",
    gap: "25px",
  },

  link: {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "500",
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
    background: "#ef4444",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
};