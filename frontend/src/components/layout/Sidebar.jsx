import { Link } from "react-router-dom";

const Sidebar = () => {

  return (
    <div style={{ width: "200px", background: "#eee", padding: "20px" }}>

      <ul>

        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/attendance">Attendance</Link>
        </li>

        <li>
          <Link to="/students">Students</Link>
        </li>

      </ul>

    </div>
  );
};

export default Sidebar;