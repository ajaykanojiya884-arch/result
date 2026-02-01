// src/pages/Admin/AdminViewCompleteResult.jsx

/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminViewCompleteResult() {
  useAuth();
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [division, setDivision] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollInput, setRollInput] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function loadDivs() {
      try {
        const res = await api.get('/admin/divisions');
        setDivisions(res.data || []);
        if ((res.data || []).length > 0) setDivision(res.data[0]);
      } catch (err) {
        console.error(err);
      }
    }
    loadDivs();
  }, []);

  useEffect(() => {
    if (!division) return;
    loadDivisionResults({ division });
  }, [division]);

  async function loadDivisionResults({ division: d, roll_no } = {}) {
    setLoading(true);
    try {
      const params = {};
      if (d) params.division = d;
      if (roll_no) params.roll_no = roll_no;
      const res = await api.get('/admin/results', { params });
      const data = res.data || [];
      if (Array.isArray(data)) {
        // Sort by roll number numerically
        data.sort((a, b) => {
          const rA = parseInt(a.roll_no, 10);
          const rB = parseInt(b.roll_no, 10);
          if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
          return a.roll_no.localeCompare(b.roll_no);
        });
        setRows(data);
        // Do NOT auto-select student
        setSelectedStudent(null);
      } else if (data && typeof data === 'object') {
        setRows([data]);
        setSelectedStudent(data);
      } else {
        setRows([]);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error(err);
      setRows([]);
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  }

  const selectedRow =
    rows.find((r) => r.roll_no === selectedStudent?.roll_no) ||
    rows[0] ||
    null;

  return (
    <div style={{ padding: 20 }}>

      {/* ✅ GO BACK BUTTON */}
      <button
        onClick={() => navigate('/admin')}
        style={{
          padding: "8px 16px",
          background: "#1e88e5",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: 15,
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}
      >
        ← Go Back
      </button>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>College Results</h2>
          <div style={{ fontSize: 12, color: '#666' }}>Official Marksheet</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: '#2c3e50' }}>View Complete Result (Admin)</div>
          
          {/* Print Button */}
          <button
            onClick={() => {
              if (!division || !selectedRow) return alert("Select a student to print");
              const url = `/admin/print-result/${division}/${selectedRow.roll_no}`;
              window.open(url, '_blank');
            }}
            style={{
              marginTop: 8,
              marginLeft: 10,
              padding: "8px 12px",
              background: "#607d8b",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13
            }}
          >
            Print Statement
          </button>

          {/* Batch Print Button */}
          {division && (
              <button
                onClick={() => {
                  window.open(`/admin/batch-print/${division}`, '_blank');
                }}
                style={{
                  marginTop: 8,
                  marginLeft: 10,
                  padding: "8px 12px",
                  background: "#e65100",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13
                }}
              >
                Batch Print Division
              </button>
          )}

          {/* Download Excel Button */}
          {division && (
              <button
                onClick={async () => {
                  try {
                    const response = await api.get(`/admin/results/export-excel?division=${division}`, {
                      responseType: 'blob'
                    });
                    
                    // Create a temporary URL for the blob
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Results_Division_${division}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Excel export failed:', err);
                    alert('Failed to download Excel file. Please try again.');
                  }
                }}
                style={{
                  marginTop: 8,
                  marginLeft: 10,
                  padding: "8px 12px",
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                📥 Download Excel
              </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 20, alignItems: 'flex-end' }}>
        
        {/* Division */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 600 }}>Division</label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            style={{ minWidth: 180, padding: "8px", borderRadius: 6 }}
          >
            <option value="">-- Select division --</option>
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Roll Search */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 600 }}>Roll No</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              value={rollInput}
              onChange={(e) => setRollInput(e.target.value)}
              placeholder="Enter roll number"
              style={{
                minWidth: 180,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            />
            <button
              onClick={() => {
                if (!division) return alert('Please select a Division first');
                if (!rollInput) return alert('Enter Roll Number');
                loadDivisionResults({ division, roll_no: rollInput });
              }}
              style={{
                padding: "8px 14px",
                background: "#1565c0",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && <div style={{ fontWeight: 600 }}>Loading...</div>}

      {/* No Data */}
      {!loading && rows.length === 0 && (
        <div style={{ color: "#666" }}>No results available.</div>
      )}

      {/* Student Result Card */}
      {!loading && selectedRow && (
        <div style={{
          marginTop: 16,
          border: '1px solid #e6e9ee',
          padding: 16,
          borderRadius: 8,
          background: '#ffffff',
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          
          {/* Student Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0 }}>{selectedRow.roll_no} - {selectedRow.name}</h3>
              <div style={{ color: '#555' }}>
                Division: <strong>{selectedRow.division}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#2c3e50" }}>Grand Total</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>
                {selectedRow.final_total ?? "-"}
              </div>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                Percentage:{" "}
                <span style={{ fontWeight: 800, color: "#2980b9" }}>
                  {selectedRow.percentage ?? "-"}%
                </span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
                Max Marks: 600
              </div>
            </div>
          </div>

          {/* Subject Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
              <tr style={{ background: "#f7faff" }}>
                <th style={{ padding: 10, textAlign: "left" }}>Subject</th>
                <th style={{ padding: 10, textAlign: "right" }}>Annual Marks</th>
                <th style={{ padding: 10, textAlign: "right" }}>Grace</th>
                <th style={{ padding: 10, textAlign: "right" }}>Final</th>
              </tr>
            </thead>
            <tbody>
              {selectedRow.subjects.map((s) => {
                const finalVal = s.final;
                const finalColor = (typeof finalVal === 'number' && finalVal < 35) ? '#c0392b' : '#d35400';
                return (
                  <tr key={s.code} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 10 }}>{s.code}</td>
                    <td style={{ padding: 10, textAlign: "right", fontWeight: 700 }}>
                      {s.grade ? s.grade : (s.avg ?? "-")}
                    </td>
                    <td style={{ padding: 10, textAlign: "right" }}>
                      {s.grade ? "-" : (s.grace ?? 0)}
                    </td>
                    <td style={{ padding: 10, textAlign: "right", fontWeight: 700, color: finalColor }}>
                      {s.grade ? "-" : (s.final ?? "-")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Buttons */}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowDetails((d) => !d)}
              style={{
                padding: "8px 12px",
                background: "#546e7a",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {showDetails ? "Hide" : "Show"} Detailed Marks
            </button>


          </div>

          {/* Detailed Marks */}
          {showDetails && (
            <div style={{ marginTop: 16 }}>
              <h4>Detailed Marks Breakdown (Annual Marks = Internal + Final Exam)</h4>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th style={{ padding: 8, textAlign: "left" }}>Subject</th>
                      <th style={{ padding: 8, textAlign: "right" }}>Internal</th>
                      <th style={{ padding: 8, textAlign: "right" }}>Final Exam</th>
                      <th style={{ padding: 8, textAlign: "right" }}>Annual Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRow.subjects.map((s) => {
                      const internal = s.mark?.internal ?? 0;
                      const finalExam = s.mark?.annual ?? 0;
                      const annualTotal = internal + finalExam;
                      
                      return (
                        <tr key={`detail-${s.code}`} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: 8 }}>{s.code}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>{internal || "-"}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>{finalExam || "-"}</td>
                          <td style={{ padding: 8, textAlign: "right", fontWeight: 700 }}>{annualTotal || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
          )}

          {/* Pass/Fail Section */}
          {/* <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 6 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#666" }}>Grand Total: <strong>{selectedRow.final_total ?? "-"}</strong> / {selectedRow.subjects?.length * 10 || "-"}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Percentage: <strong>{selectedRow.percentage ?? "-"}%</strong></div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Subjects: {selectedRow.percentage != null ? 6 : (selectedRow.subjects?.length || 0)}</div>
            </div>
          </div> */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <div>
              <strong>Grade: </strong>
            </div>

            <div style={{ fontWeight: 900, color: selectedRow.percentage >= 35 ? "#27ae60" : "#c0392b" }}>
              <span style={{ color: "#27ae60" }}>
                {selectedRow.overall_grade ? selectedRow.overall_grade : gradeFor(selectedRow.percentage)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Division Table */}
      {!loading && rows.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <h4>Division Students</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 8 }}>Roll</th>
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8, textAlign: "right" }}>Final Total</th>
                <th style={{ padding: 8, textAlign: "right" }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.roll_no}
                  onClick={() => setSelectedStudent(r)}
                  style={{ cursor: "pointer", borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: 8 }}>{r.roll_no}</td>
                  <td style={{ padding: 8 }}>{r.name}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{r.final_total ?? "-"}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{r.percentage ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function gradeFor(p) {
  if (p == null) return '-';
  const n = Number(p);
  if (Number.isNaN(n)) return '-';
  if (n >= 75) return 'A+';
  if (n >= 60) return 'A';
  if (n >= 50) return 'B';
  if (n >= 35) return 'C';
  return 'F';
}