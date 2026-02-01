import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SubjectResult() {
  useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [allocations, setAllocations] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [division, setDivision] = useState('A');
  const [divisions, setDivisions] = useState(['A','B','C']);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Load teacher subjects + query params
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/auth/me');
        const alloc = res.data.allocations || [];
        setAllocations(alloc);

        const qp = new URLSearchParams(location.search);
        const sid = qp.get('subject_id');
        const divq = qp.get('division');

        if (sid) setSubjectId(sid);
        if (divq) setDivision(divq);
        if (!sid && alloc.length > 0) setSubjectId(alloc[0].subject_id);

      } catch {
        setAllocations([]);
      }
    }
    load();
  }, [location.search]);

  // fetch divisions based on subject (backend determines visibility)
  useEffect(() => {
    async function loadDivs() {
      if (!subjectId) return;
      try {
        const res = await api.get('/teacher/divisions', { params: { subject_id: subjectId } });
        setDivisions(res.data || []);
        if (!divisions.includes(division) && (res.data || []).length > 0) {
          setDivision((res.data || [])[0]);
        }
      } catch {
        // fallback to default divisions
        setDivisions(['A','B','C']);
      }
    }
    loadDivs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  // Load marks
  useEffect(() => {
    async function loadMarks() {
      if (!subjectId || !division) return;
      setLoading(true);
      try {
        const res = await api.get('/teacher/marks', {
          params: { subject_id: subjectId, division }
        });
        // Sort rows by numeric part of roll_no when possible (natural numeric order)
        const data = res.data || [];
        function rollKey(v) {
          if (v === null || v === undefined) return '';
          const s = String(v);
          const m = s.match(/(\d+)/);
          if (m) return Number(m[1]);
          return s.toLowerCase();
        }
        data.sort((a, b) => {
          const ka = rollKey(a.roll_no);
          const kb = rollKey(b.roll_no);
          if (typeof ka === 'number' && typeof kb === 'number') return ka - kb;
          return String(a.roll_no).localeCompare(String(b.roll_no));
        });
        setRows(data);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
  }, [subjectId, division]);

  return (
    <div style={{ padding: 20, fontFamily: "Segoe UI" }}>

      {/* 🔵 HEADER */}
      <div
        style={{
          background: "#1e88e5",
          padding: "14px 20px",
          borderRadius: 10,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          boxShadow: "0 3px 10px rgba(0,0,0,0.20)"
        }}
      >
        <button
          onClick={() => navigate('/teacher')}
          style={{
            background: "white",
            color: "#1e88e5",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        >
          ← Go Back
        </button>

        <h2 style={{ margin: 0, fontWeight: 700 }}>Subject Results</h2>

        <div style={{ width: 100 }}></div>
      </div>

      {/* 🟦 FILTER CARD */}
      <div
        style={{
          background: "#f7faff",
          padding: 18,
          borderRadius: 10,
          border: "1px solid #dfe6ee",
          marginBottom: 20,
          display: "flex",
          gap: 20,
          alignItems: "flex-end"
        }}
      >
        {/* SUBJECT */}
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600, marginBottom: 5, display: "block" }}>Subject</label>
          <select
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            style={selectStyle}
          >
            <option value="">-- Select --</option>
            {allocations.map(a => (
              <option key={a.subject_id} value={a.subject_id}>
                {a.subject_code} — {a.subject_name}
              </option>
            ))}
          </select>
        </div>

        {/* DIVISION */}
        <div style={{ width: 180 }}>
          <label style={{ fontWeight: 600, marginBottom: 5, display: "block" }}>Division</label>
          <select
            value={division}
            onChange={e => setDivision(e.target.value)}
            style={selectStyle}
          >
            {divisions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* SEARCH */}
        <div style={{ width: 180 }}>
          <label style={{ fontWeight: 600, marginBottom: 5, display: "block" }}>Search Roll</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Enter roll no"
            style={inputStyle}
          />
        </div>
      </div>

      {/* 🔄 LOADING */}
      {loading && (
        <div style={{ fontSize: 16, color: "#555" }}>Loading...</div>
      )}

      {/* ⚠ NO DATA */}
      {!loading && rows.length === 0 && (
        <div
          style={{
            background: "#fff3cd",
            padding: 12,
            border: "1px solid #ffeeba",
            color: "#856404",
            borderRadius: 8,
            marginTop: 10
          }}
        >
          No marks found for the selected subject/division.
        </div>
      )}

      {/* 📄 MARKS TABLE */}
      {!loading && rows.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 3px 10px rgba(0,0,0,0.10)"
          }}
        >
          <thead>
            <tr style={{ background: "#e8f1ff" }}>
              <th style={thLeft}>Roll</th>
              <th style={thLeft}>Name</th>
              <th style={thCenter}>Unit1</th>
              <th style={thCenter}>Unit2</th>
              <th style={thCenter}>Terminal</th>
              <th style={thCenter}>Annual</th>
              <th style={thCenter}>Internal</th>
            </tr>
          </thead>

          <tbody>
            {rows
              .filter(r => !search || String(r.roll_no).includes(search))
              .map(r => (
                <tr
                  key={r.roll_no}
                  style={rowStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f4f9ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                  <td style={tdLeft}>{r.roll_no}</td>
                  <td style={tdLeft}>{r.name}</td>
                  <td style={tdCenter}>{r.mark.unit1 ?? "-"}</td>
                  <td style={tdCenter}>{r.mark.unit2 ?? "-"}</td>
                  <td style={tdCenter}>{r.mark.term ?? "-"}</td>
                  <td style={tdCenter}>{r.mark.annual ?? "-"}</td>
                  <td
                    style={{
                      ...tdCenter,
                      color: (r.mark.internal || r.mark.grace) ? "#c0392b" : "#444",
                      fontWeight: (r.mark.internal || r.mark.grace) ? 700 : 400
                    }}
                  >
                    { (r.mark.internal !== undefined && r.mark.internal !== null) ? r.mark.internal : (r.mark.grace ?? 0) }
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ----------------- REUSABLE STYLES ----------------- */

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  border: "1px solid #c5ccd3",
  background: "white",
  fontSize: 14
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  border: "1px solid #c5ccd3",
  background: "white",
  fontSize: 14
};

const thLeft = {
  padding: 12,
  textAlign: "left",
  fontWeight: 700,
  borderBottom: "1px solid #d7dfe7"
};

const thCenter = {
  padding: 12,
  textAlign: "center",
  fontWeight: 700,
  borderBottom: "1px solid #d7dfe7"
};

const tdLeft = {
  padding: 12,
  textAlign: "left",
  borderBottom: "1px solid #f0f0f0"
};

const tdCenter = {
  padding: 12,
  textAlign: "center",
  borderBottom: "1px solid #f0f0f0"
};

const rowStyle = {
  transition: "0.20s"
};
