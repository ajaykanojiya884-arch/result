// src/pages/Teacher/UpdateMarks.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function UpdateMarks() {
  useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [allocations, setAllocations] = useState([]);
  const [division, setDivision] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [rows, setRows] = useState([]);
  const [chosenSubjectId, setChosenSubjectId] = useState("");
  const [chosenSubjectCode, setChosenSubjectCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const FIELD_LIMITS = { unit1: 25, unit2: 25, term: 50, annual: 80, internal: 20 };
  // Display/order: U1, Term, U2, Internal, Annual
  const FIELD_ORDER = ["unit1", "term", "unit2", "internal", "annual"];

  // Load teacher allocations
  useEffect(() => {
    async function loadAlloc() {
      const res = await api.get("/auth/me");
      const alloc = res.data.allocations || [];
      setAllocations(alloc);

      if (alloc.length) {
        setDivision(alloc[0].division);
        setChosenSubjectId(alloc[0].subject_id);
        setChosenSubjectCode(alloc[0].subject_code);
      }
    }
    loadAlloc();
  }, []);

  // detect URL params
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("subject_id")) setChosenSubjectId(q.get("subject_id"));
    if (q.get("division")) setDivision(q.get("division"));
  }, [location.search]);

  // Auto-fetch students when subject or division changes
  useEffect(() => {
    if (chosenSubjectId && division) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenSubjectId, division]);

  const fetchStudents = async () => {
    if (!chosenSubjectId || !division) return alert("Select subject & division");

    setLoading(true);
    try {
      const res = await api.get("/teacher/marks", {
        params: { subject_id: chosenSubjectId, division },
      });

      setRows(
        (res.data || [])
          .map((r) => ({
            ...r,
            mark: r.mark || { unit1: "", unit2: "", term: "", annual: "", internal: "" },
          }))
          .filter((r) => {
            if (!studentRoll) return true;
            return String(r.roll_no).startsWith(String(studentRoll));
          })
          .sort((a, b) => Number(a.roll_no) - Number(b.roll_no))
      );
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  const onChange = (roll, field, val) => {
    setRows((prev) =>
      prev.map((r) =>
        r.roll_no === roll ? { ...r, mark: { ...r.mark, [field]: val } } : r
      )
    );

    const n = Number(val);
    const key = roll + "_" + field;

    if (val === "" || (n >= 0 && n <= FIELD_LIMITS[field])) {
      setErrors((p) => {
        const x = { ...p };
        delete x[key];
        return x;
      });
    } else {
      setErrors((p) => ({ ...p, [key]: "Invalid" }));
    }
  };

  const saveAll = async () => {
    if (Object.keys(errors).length) return alert("Fix errors first");

    if (!window.confirm("Save all marks?")) return;

    setLoading(true);
    try {
      const entries = rows.map((r) => ({
        roll_no: r.roll_no,
        division,
        subject_id: Number(chosenSubjectId),
        ...Object.fromEntries(
            Object.keys(FIELD_LIMITS).map((f) => [f, Number(r.mark[f]) || 0])
        ),
      }));

      await api.post("/teacher/marks/batch", { entries });
      alert("Saved successfully");
      fetchStudents();
    } catch {
      alert("Save failed");
    }
    setLoading(false);
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={title}>Update Marks</h2>

        <button style={btnBack} onClick={() => navigate(-1)}>
          ← Go Back
        </button>

        <div style={grid}>
          <div>
            <label style={label}>Subject</label>
            <select
              style={input}
              value={chosenSubjectId}
              onChange={(e) => {
                const id = e.target.value;
                const obj = allocations.find((a) => String(a.subject_id) === id);

                setChosenSubjectId(id);
                setChosenSubjectCode(obj?.subject_code);
                setDivision(obj?.division || division);
              }}
            >
              <option value="">Select</option>
              {allocations.map((a) => (
                <option key={a.subject_id} value={a.subject_id}>
                  {a.subject_code} — {a.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Division</label>
            <select style={input} value={division} onChange={(e) => setDivision(e.target.value)}>
              {["A", "B", "C"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Roll No</label>
            <input style={input} value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button style={btnPrimary} onClick={fetchStudents}>
              Search
            </button>
          </div>
        </div>

        {loading && <div>Loading...</div>}

        {rows.length > 0 && (
          <>
            <div style={subTitle}>
              Subject: {chosenSubjectCode} | Division: {division}
            </div>

            <table style={table}>
              <thead style={thead}>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>U1</th>
                  <th>Term</th>
                  <th>U2</th>
                  <th>Internal</th>
                  <th>Annual</th>
                  <th>Total</th>
                  <th>Average</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.roll_no}>
                    <td>{r.roll_no}</td>
                    <td>{r.name}</td>
                    {FIELD_ORDER.map((f) => (
                      <td key={f}>
                        <input
                          type="number"
                          value={r.mark[f] ?? ""}
                          style={{ ...input, width: 70 }}
                          min={0}
                          max={FIELD_LIMITS[f]}
                          onChange={(e) => onChange(r.roll_no, f, e.target.value)}
                        />
                        {errors[r.roll_no + "_" + f] && <div style={err}>Invalid</div>}
                      </td>
                    ))}

                    <td style={{ textAlign: "center" }}>
                      {(() => {
                        const m = r.mark || {};
                        const u1 = Number(m.unit1) || 0;
                        const u2 = Number(m.unit2) || 0;
                        const term = Number(m.term) || 0;
                        const annual = Number(m.annual) || 0;
                        const internal = Number(m.internal) || 0;
                        const tot = u1 + u2 + term + annual + internal;
                        return tot || "-";
                      })()}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      {(() => {
                        const m = r.mark || {};
                        const u1 = Number(m.unit1) || 0;
                        const u2 = Number(m.unit2) || 0;
                        const term = Number(m.term) || 0;
                        const annual = Number(m.annual) || 0;
                        const internal = Number(m.internal) || 0;
                        const tot = u1 + u2 + term + annual + internal;
                        const avg = tot ? (tot / 2).toFixed(2) : "-";
                        return avg;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button style={btnSave} onClick={saveAll}>
                Save All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------- STYLES ---------------------- */
const page = { minHeight: "100vh", background: "#f4f6f9", padding: 40 };
const card = { maxWidth: 1200, margin: "auto", background: "#fff", padding: 24, borderRadius: 12 };
const title = { fontWeight: 800, marginBottom: 20 };
const subTitle = { fontWeight: 700, marginBottom: 10 };
const label = { fontWeight: 600, marginBottom: 6, display: "block" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 };
const input = { width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ccc" };
const btnPrimary = { padding: "10px 16px", background: "#0d6efd", color: "#fff", borderRadius: 6 };
const btnSave = { padding: "12px 18px", background: "#27ae60", color: "#fff", borderRadius: 6 };
const btnBack = { marginBottom: 15, background: "#555", color: "#fff", padding: "8px 12px", borderRadius: 6 };
const table = { width: "100%", borderCollapse: "collapse" };
const thead = { background: "#eee" };
const err = { color: "#c0392b", fontSize: 12 };
