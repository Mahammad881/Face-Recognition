import React, { useEffect, useState, useMemo } from "react";
import {
  getAttendanceRecords,
  deleteAttendanceRecord,
  updateAttendanceRecord,
} from "../utils/api";
import { applyThemeToBody } from "../utils/theme";

const AttendanceTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const isFilterActive = searchTerm || selectedDate;

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await getAttendanceRecords();
      setRecords(Array.isArray(data) ? data : data.records || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = selectedDate
        ? new Date(r.checkInTime).toISOString().split("T")[0] === selectedDate
        : true;

      return matchesSearch && matchesDate;
    });
  }, [records, searchTerm, selectedDate]);

  const [dark, setDark] = useState(false);
  const styles = getStyles(dark);

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

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await deleteAttendanceRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (record) => {
    setEditingRecord({ ...record });
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const updated = await updateAttendanceRecord(
        editingRecord.id,
        editingRecord,
      );

      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );

      setEditingRecord(null);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  if (loading) return <p style={styles.center}>Loading...</p>;
  if (error) return <p style={{ ...styles.center, color: "red" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>📊 Attendance Dashboard</h2>
          <span style={styles.badge}>{filteredRecords.length} Records</span>
        </div>

        {/* FILTER */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="🔍 Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.input}
          />

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedDate("");
            }}
            style={{
              ...styles.secondaryBtn,
              background: isFilterActive
                ? "#2563eb"
                : styles.secondaryBtn.background,
              color: isFilterActive ? "#fff" : styles.secondaryBtn.color,
              cursor: isFilterActive ? "pointer" : "not-allowed",
              opacity: isFilterActive ? 1 : 0.6,
            }}
            disabled={!isFilterActive}
          >
            Reset
          </button>
        </div>

        {/* EDIT PANEL */}
        {editingRecord && (
          <div style={styles.editPanel}>
            <input
              value={editingRecord.studentName || ""}
              onChange={(e) =>
                setEditingRecord((prev) => ({
                  ...prev,
                  studentName: e.target.value,
                }))
              }
              style={styles.input}
            />

            <button onClick={handleUpdate} style={styles.primaryBtn}>
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => setEditingRecord(null)}
              style={styles.secondaryBtn}
            >
              Cancel
            </button>
          </div>
        )}

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length ? (
                filteredRecords.map((r) => {
                  const date = new Date(r.checkInTime);

                  return (
                    <tr
                      key={r.id}
                      style={styles.row}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = dark
                          ? "#1e293b"
                          : "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={styles.tdBold}>{r.studentId}</td>
                      <td style={styles.td}>{r.studentName}</td>
                      <td style={styles.td}>{date.toLocaleTimeString()}</td>
                      <td style={styles.td}>{date.toLocaleDateString()}</td>

                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <div style={styles.actionGroup}>
                          <button
                            onClick={() => handleEdit(r)}
                            style={styles.editBtn}
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() => handleDelete(r.id)}
                            style={styles.deleteBtn}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>
                    🚫 No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const getStyles = (dark) => {
  const td = {
    padding: "12px",
    fontSize: "14px",
    color: dark ? "#e2e8f0" : "#000",
  };

  return {
    container: {
      background: dark ? "#0f172a" : "#f1f5f9",
      minHeight: "100vh",
      padding: "30px",
      color: dark ? "#fff" : "#000",
    },

    card: {
      background: dark ? "#1e293b" : "#fff",
      borderRadius: "14px",
      padding: "25px",
    },

    header: {
      // ✅ FIXED
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },

    badge: {
      background: dark ? "#1e3a8a" : "#e0f2fe",
      color: dark ? "#bfdbfe" : "#0369a1",
      padding: "6px 12px",
      borderRadius: "20px",
    },

    input: {
      padding: "10px",
      borderRadius: "8px",
      border: dark ? "1px solid #334155" : "1px solid #ddd",
      background: dark ? "#0f172a" : "#fff",
      color: dark ? "#fff" : "#000",
    },

    editPanel: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      background: dark ? "#334155" : "#f8fafc",
      padding: "10px",
      borderRadius: "8px",
    },

    theadRow: {
      background: dark ? "#334155" : "#f8fafc",
    },

    row: {
      borderBottom: dark ? "1px solid #334155" : "1px solid #eee",
      cursor: "pointer",
      transition: "background 0.2s ease", // 👈 ADD THIS
    },
    td,
    tdBold: {
      ...td,
      fontWeight: "600",
    },
    center: {
      textAlign: "center",
      marginTop: "40px",
      fontSize: "16px",
      color: dark ? "#cbd5f5" : "#555",
    },

    filterBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
    },

    actionGroup: {
      display: "flex",
      gap: "8px",
      justifyContent: "center", // 👈 ADD THIS
    },

    primaryBtn: {
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
    },

    secondaryBtn: {
      background: dark ? "#334155" : "#e5e7eb",
      color: dark ? "#fff" : "#000",
      border: "none",
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    editBtn: {
      background: "#22c55e",
      color: "#fff",
      border: "none",
      padding: "6px 10px",
      borderRadius: "6px",
    },

    deleteBtn: {
      background: "#ef4444",
      color: "#fff",
      border: "none",
      padding: "6px 10px",
      borderRadius: "6px",
    },

    emptyState: {
      textAlign: "center",
      padding: "20px",
      color: dark ? "#94a3b8" : "#999",
    },

    th: {
      padding: "12px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      borderBottom: dark ? "1px solid #475569" : "1px solid #ddd",
      color: dark ? "#cbd5f5" : "#334155",
    },
  };
};
export default AttendanceTable;
