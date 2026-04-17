import React, { useEffect, useState, useMemo } from "react";
import {
  getAttendanceRecords,
  deleteAttendanceRecord,
  updateAttendanceRecord,
} from "../utils/api";

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
  if (loading) return <p style={center}>Loading...</p>;
  if (error) return <p style={{ ...center, color: "red" }}>{error}</p>;

 return (
  <div style={container}>
    <div style={card}>

      {/* HEADER */}
      <div style={header}>
        <h2 style={title}>📊 Attendance Dashboard</h2>
        <span style={badge}>
          {filteredRecords.length} Records
        </span>
      </div>

      {/* FILTER */}
      <div style={filterBar}>
        <input
          type="text"
          placeholder="🔍 Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={input}
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={input}
        />

        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedDate("");
          }}
          style={{
            ...secondaryBtn,
            background: isFilterActive ? "#2563eb" : "#e5e7eb",
            color: isFilterActive ? "#fff" : "#555",
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
        <div style={editPanel}>
          <input
            value={editingRecord.studentName || ""}
            onChange={(e) =>
              setEditingRecord((prev) => ({
                ...prev,
                studentName: e.target.value,
              }))
            }
            style={input}
          />

          <button onClick={handleUpdate} style={primaryBtn}>
            {saving ? "Saving..." : "Save"}
          </button>

          <button onClick={() => setEditingRecord(null)} style={secondaryBtn}>
            Cancel
          </button>
        </div>
      )}

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th>ID</th>
              <th>Name</th>
              <th>Time</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length ? (
              filteredRecords.map((r) => {
                const date = new Date(r.checkInTime);

                return (
                  <tr key={r.id} style={row}>
                    <td style={tdBold}>{r.studentId}</td>
                    <td style={td}>{r.studentName}</td>
                    <td style={td}>{date.toLocaleTimeString()}</td>
                    <td style={td}>{date.toLocaleDateString()}</td>

                    <td style={td}>
                      <div style={actionGroup}>
                        <button
                          onClick={() => handleEdit(r)}
                          style={editBtn}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleDelete(r.id)}
                          style={deleteBtn}
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
                <td colSpan="5" style={emptyState}>
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

const row = {
  borderBottom: "1px solid #eee",
  transition: "0.2s",
  cursor: "pointer",
};
const container = {
  background: "#f1f5f9",
  minHeight: "100vh",
  padding: "30px",
};

const center = {
  textAlign: "center",
  marginTop: "40px",
  fontSize: "16px",
  color: "#555",
};

const card = {
  background: "#fff",
  borderRadius: "14px",
  padding: "25px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const title = {
  fontSize: "22px",
  fontWeight: "600",
};

const badge = {
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "500",
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  minWidth: "180px",
};

const filterBar = {
  display: "flex",
  gap: "12px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const editPanel = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  background: "#f8fafc",
  padding: "10px",
  borderRadius: "8px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRow = {
  background: "#f8fafc",
  textAlign: "left",
};
const td = {
  padding: "12px",
  fontSize: "14px",
};

const tdBold = {
  ...td,
  fontWeight: "600",
};

const actionGroup = {
  display: "flex",
  gap: "8px",
};

const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
};

const secondaryBtn = {
  background: "#e5e7eb",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
};

const editBtn = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const emptyState = {
  textAlign: "center",
  padding: "20px",
  color: "#999",
};
export default AttendanceTable;
