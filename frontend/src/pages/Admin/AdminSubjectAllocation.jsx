import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/dialogs";

export default function AdminSubjectAllocation() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [form, setForm] = useState({
    teacher_id: "",
    subject_id: "",
    division: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tRes, sRes, aRes] = await Promise.all([
        api.get("/admin/teachers"),
        api.get("/subjects"),
        api.get("/admin/allocations"),
      ]);

      setTeachers(tRes.data);
      setSubjects(sRes.data);
      setAllocations(aRes.data);
    } catch (err) {
      showError(err.response?.data?.error || "Failed to load data");
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmAction("Are you sure you want to delete?");
    if (!ok) return;

    try {
      await api.delete(`/admin/allocations/${id}`);
      loadInitialData();
      showSuccess("Allocation deleted successfully");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/admin/allocations", {
        teacher_id: parseInt(form.teacher_id),
        subject_id: parseInt(form.subject_id),
        division: form.division.toUpperCase(),
      });

      setForm({ teacher_id: "", subject_id: "", division: "" });
      loadInitialData();
      showSuccess("Allocation saved successfully");
    } catch (err) {
      showError(err.response?.data?.error || "Allocation failed (duplicate?)");
    }
  };

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "30px" }}>
      <div
        style={{
          background: "#fff",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={headerRow}>
          <button onClick={() => navigate("/admin")} style={backBtn}>
            ⬅ Go Back
          </button>
          <h2 style={{ margin: 0 }}>Assign Teacher to Subject</h2>
          <div style={{ width: 80 }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "25px" }}>
          <select
            name="teacher_id"
            value={form.teacher_id}
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.teacher_id} value={t.teacher_id}>
                {t.name} ({t.userid})
              </option>
            ))}
          </select>

          <select
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.subject_code} — {s.subject_name}
              </option>
            ))}
          </select>

          <input
            name="division"
            placeholder="Division (A/B/C)"
            value={form.division}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <button type="submit" style={primaryBtn}>
            Allocate
          </button>
        </form>

        {/* Table */}
        <h3 style={{ marginBottom: 10 }}>Existing Allocations</h3>

        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#e8f0ff" }}>
              <th style={th}>Teacher</th>
              <th style={th}>Subject</th>
              <th style={th}>Division</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {allocations.map((a) => (
              <tr key={a.allocation_id} style={{ background: "#fafafa" }}>
                <td style={td}>{a.teacher_name}</td>
                <td style={td}>
                  {a.subject_code} — {a.subject_name}
                </td>
                <td style={td}>{a.division}</td>
                <td style={td}>
                  <button style={deleteBtn} onClick={() => handleDelete(a.allocation_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --- Shared Styles --- */
const backBtn = {
  padding: "8px 14px",
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginBottom: "12px",
};

const inputStyle = { ...selectStyle };

const primaryBtn = {
  width: "100%",
  padding: "12px",
  background: "#0066ff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const th = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const deleteBtn = {
  padding: "6px 10px",
  background: "#ff4d4d",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};
