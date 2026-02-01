import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminViewStudents() {
  const navigate = useNavigate();
  const [loadDivision, setLoadDivision] = useState(""); 
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⭐ LOAD DATA FROM BACKEND
  const handleLoadData = async () => {
    try {
      setLoading(true);

      const url = loadDivision
        ? `/admin/students?division=${loadDivision.toUpperCase()}`
        : "/admin/students";

      const res = await api.get(url);

      // ⭐ SORT BY ROLL NUMBER
      const sorted = [...res.data].sort((a, b) => {
        const r1 = parseInt(a.roll_no);
        const r2 = parseInt(b.roll_no);
        return r1 - r2;
      });

      setStudents(sorted);
    } catch {
      alert("Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentSubjects = async (s) => {
    setSelectedStudent(s);
    setStudentSubjects([]);
    await fetchStudentSubjects(api, s.roll_no, s.division, setStudentSubjects, setLoadingSubjects);
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => navigate("/admin")}
            style={{
              padding: "8px 14px",
              background: "#eee",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ⬅ Go Back
          </button>

          <h2 style={{ margin: 0 }}>View Students</h2>
          <div style={{ width: 80 }} />
        </div>

        {/* ⭐ LOAD DATA SECTION ONLY */}
        <div style={{ marginBottom: 25 }}>
          <label style={{ fontWeight: "bold" }}>Load Data (Division):</label>
          <div style={{ display: "flex", gap: "10px", marginTop: 5 }}>
            <input
              placeholder="A / B / C or empty for ALL"
              value={loadDivision}
              onChange={(e) => setLoadDivision(e.target.value)}
              style={{
                width: "200px",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleLoadData}
              style={{
                padding: "10px 20px",
                background: "#4a6cf7",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Load Data
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <p>Loading...</p>}

        {/* No Data */}
        {!loading && students.length === 0 && <p>No students found.</p>}

        {/* Table */}
        {students.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 15,
            }}
          >
            <thead>
              <tr style={{ background: "#e8f0ff" }}>
                <th style={th}>Roll Number</th>
                <th style={th}>Name</th>
                <th style={th}>Division</th>
                <th style={th}>Optional Subject 1</th>
                <th style={th}>Optional Subject 2</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, idx) => (
                <tr
                  key={idx}
                  style={{ background: "#fafafa", cursor: "pointer" }}
                  onClick={() => loadStudentSubjects(s)}
                  title="Click to view subjects"
                >
                  <td style={td}>{s.roll_no}</td>
                  <td style={td}>{s.name}</td>
                  <td style={td}>{s.division}</td>
                  <td style={td}>{s.optional_subject || "-"}</td>
                  <td style={td}>{s.optional_subject_2 || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Student Subjects Modal */}
        {selectedStudent && (
          <div style={{ marginTop: 20, background: "#fff", padding: 16, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{selectedStudent.roll_no} - {selectedStudent.name}</strong>
                <div style={{ fontSize: 12, color: "#666" }}>Division: {selectedStudent.division}</div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ padding: "6px 10px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>

            {loadingSubjects ? (
              <p>Loading subjects...</p>
            ) : (
              <table style={{ width: "100%", marginTop: 12 }} border="1" cellPadding="6">
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={th}>Code</th>
                    <th style={th}>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSubjects.map((sub) => (
                    <tr key={sub.subject_id}>
                      <td style={td}>{sub.subject_code}</td>
                      <td style={td}>{sub.subject_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchStudentSubjects(api, roll_no, division, setSubjects, setLoading) {
  setLoading(true);
  try {
    const res = await api.get(`/teacher/student-marks?roll_no=${roll_no}&division=${division}`);
    setSubjects(res.data.subjects || []);
  } catch (err) {
    alert("Failed to load student subjects");
    setSubjects([]);
  } finally {
    setLoading(false);
  }
}

const th = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};
