import React from "react";
import PropTypes from "prop-types";

const AttendanceTable = ({ records = [], loading = false }) => {
  const styles = {
    container: {
      background: "rgba(15, 23, 42, 0.9)",
      padding: "22px 20px",
      borderRadius: "18px",
      boxShadow: "0 20px 45px rgba(15, 23, 42, 0.85)",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      border: "1px solid rgba(148, 163, 184, 0.3)",
      color: "#e5e7eb",
      backdropFilter: "blur(14px)",
    },
    title: {
      marginBottom: "18px",
      fontSize: "18px",
      fontWeight: 600,
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      fontSize: "13px",
    },
    th: {
      background:
        "linear-gradient(135deg, #4f46e5, #6366f1)",
      color: "#f9fafb",
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: 500,
      position: "sticky",
      top: 0,
      zIndex: 1,
    },
    thFirst: {
      borderTopLeftRadius: "12px",
    },
    thLast: {
      borderTopRightRadius: "12px",
    },
    td: {
      padding: "10px 12px",
      borderBottom: "1px solid rgba(55, 65, 81, 0.8)",
    },
    row: {
      transition: "background 0.16s ease",
    },
    empty: {
      textAlign: "center",
      padding: "26px",
      color: "#9ca3af",
      fontSize: "13px",
    },
    loading: {
      textAlign: "center",
      padding: "20px",
      fontSize: "13px",
      color: "#9ca3af",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>
          Loading attendance records...
        </p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Attendance Records</h2>
        <p style={styles.empty}>
          No attendance records found.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Attendance Records</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thFirst }}>
                Student Name
              </th>
              <th style={styles.th}>Date</th>
              <th style={{ ...styles.th, ...styles.thLast }}>
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                style={styles.row}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(15, 23, 42, 0.85)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={styles.td}>
                  {record.student_name}
                </td>
                <td style={styles.td}>{record.date}</td>
                <td style={styles.td}>{record.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AttendanceTable.propTypes = {
  records: PropTypes.array,
  loading: PropTypes.bool,
};

export default AttendanceTable;