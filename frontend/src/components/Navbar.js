import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.navbar}>

      <div style={styles.logo}>
        🎓 Smart Attendance
      </div>

      <div style={styles.links}>

        <NavLink to="/face" style={styles.link}>
          Face Recognition
        </NavLink>

        <NavLink to="/dashboard" style={styles.link}>
          Dashboard
        </NavLink>

        <NavLink to="/add_student" style={styles.link}>
          Add Student
        </NavLink>

        <NavLink to="/attendance-table" style={styles.link}>
          Attendance Table
        </NavLink>

      </div>

    </nav>
  );
}

export default Navbar;

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 30px",
    background: "#1e293b",
    color: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
  },

  logo: {
    fontSize: "18px",
    fontWeight: "bold"
  },

  links: {
    display: "flex",
    gap: "20px"
  },

  link: {
    textDecoration: "none",
    color: "white",
    fontWeight: "500"
  }
};