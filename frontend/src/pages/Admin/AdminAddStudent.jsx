import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AdminAddStudent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    roll_no: "",
    name: "",
    division: "",
    optional_subject: null,
    optional_subject_2: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/students", {
        roll_no: form.roll_no,
        name: form.name,
        division: form.division.toUpperCase(),
        // send null when no optional subject selected so backend stores None
        optional_subject: form.optional_subject || null,
        optional_subject_2: form.optional_subject_2 || null,
      });

      alert("Student added successfully");
      navigate("/admin/students");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add student");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.backLink} onClick={() => navigate("/admin")}>
            ← Dashboard
          </span>
          <h2 style={styles.title}>Add New Student</h2>
          <button style={styles.importBtn} onClick={() => navigate("/admin/students/import")}>
            Import Excel
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Roll Number</label>
          <input
            style={styles.input}
            name="roll_no"
            value={form.roll_no}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Student Name</label>
          <input
            style={styles.input}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Division</label>
          <input
            style={styles.input}
            name="division"
            value={form.division}
            onChange={handleChange}
            placeholder="A / B / C"
            required
          />

          <label style={styles.label}>Optional Subject 1</label>
          <select
            style={styles.input}
            name="optional_subject"
            value={form.optional_subject || "None"}
            onChange={(e) => handleChange({ target: { name: 'optional_subject', value: e.target.value === 'None' ? null : e.target.value } })}
          >
            <option value="None">None</option>
            <option value="HINDI">Hindi</option>
            <option value="IT">IT</option>
          </select>

          <label style={styles.label}>Optional Subject 2</label>
          <select
            style={styles.input}
            name="optional_subject_2"
            value={form.optional_subject_2 || "None"}
            onChange={(e) => handleChange({ target: { name: 'optional_subject_2', value: e.target.value === 'None' ? null : e.target.value } })}
          >
            <option value="None">None</option>
            <option value="MATHS">Mathematics</option>
            <option value="SP">SP</option>
          </select>

         
          <div style={styles.buttonRow}>
            <button type="submit" style={styles.saveBtn}>
              Save Student
            </button>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "420px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  backLink: {
    color: "#007bff",
    cursor: "pointer",
    fontSize: "14px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
  },
  importBtn: {
    background: "#28a745",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  label: {
    display: "block",
    marginTop: "12px",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },
  saveBtn: {
    flex: 1,
    background: "#007bff",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  cancelBtn: {
    flex: 1,
    background: "#eee",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
};