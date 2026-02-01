import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function GradeEntry({ subjectCode }) {
  useAuth();
  const navigate = useNavigate();

  const [allocations, setAllocations] = useState([]);
  const [division, setDivision] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAlloc() {
      try {
        const res = await api.get("/auth/me");
        const alloc = res.data.allocations || [];
        setAllocations(alloc);
        // try pick first allocation for this subject
        const pick = alloc.find((a) => a.subject_code === subjectCode);
        if (pick) {
          setDivision(pick.division);
        } else if (alloc.length) {
          setDivision(alloc[0].division);
        }
      } catch {
        setAllocations([]);
      }
    }
    loadAlloc();
  }, [subjectCode]);

  useEffect(() => {
    if (division) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division]);

  const fetchRows = async () => {
    if (!subjectCode || !division) return;
    setLoading(true);
    try {
      const res = await api.get("/teacher/grades", {
        params: { subject_code: subjectCode, division },
      });
      setRows(
        (res.data || [])
          .filter((r) => (studentRoll ? String(r.roll_no).startsWith(studentRoll) : true))
          .sort((a, b) => Number(a.roll_no) - Number(b.roll_no))
      );
    } catch (err) {
      setRows([]);
    }
    setLoading(false);
  };

  const onChangeGrade = (roll, val) => {
    setRows((prev) => prev.map((r) => (r.roll_no === roll ? { ...r, grade: val } : r)));
  };

  const saveAll = async () => {
    if (!window.confirm("Save grades?")) return;
    setLoading(true);
    try {
      const entries = rows.map((r) => ({ roll_no: r.roll_no, division: r.division, grade: r.grade }));
      await api.post("/teacher/grades", { subject_code: subjectCode, entries });
      alert("Saved");
      fetchRows();
    } catch (err) {
      alert(err.message || "Save failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9", padding: 40 }}>
      <div style={{ maxWidth: 1000, margin: "auto", background: "#fff", padding: 20, borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>{subjectCode} Grade Entry</h2>
        <button style={{ marginBottom: 12 }} onClick={() => navigate(-1)}>← Go Back</button>

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: 600 }}>Division</label>
            <select style={{ width: "100%", padding: 8 }} value={division} onChange={(e) => setDivision(e.target.value)}>
              <option value="">Select</option>
              {Array.from(new Set(allocations.map((a) => a.division))).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ width: 160 }}>
            <label style={{ display: "block", fontWeight: 600 }}>Roll filter</label>
            <input style={{ width: "100%", padding: 8 }} value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button style={{ padding: "8px 12px" }} onClick={fetchRows}>Search</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}

        {rows.length > 0 && (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#eee" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Roll</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.roll_no}>
                    <td style={{ padding: 8 }}>{r.roll_no}</td>
                    <td style={{ padding: 8 }}>{r.name}</td>
                          <td style={{ padding: 8, textAlign: "center" }}>
                            <select
                              style={{ width: 120, padding: 6 }}
                              value={r.grade ?? ""}
                              onChange={(e) => onChangeGrade(r.roll_no, e.target.value)}
                            >
                              <option value="">--</option>
                              {[
                                "A+",
                                "A",
                                "B+",
                                "B",
                                "C",
                                "D",
                                "E",
                                "F",
                              ].map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "right", marginTop: 12 }}>
              <button style={{ padding: "8px 12px" }} onClick={saveAll}>Save All</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
