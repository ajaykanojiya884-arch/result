// src/pages/Admin/AdminAddTeacher.jsx
import React, { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminAddTeacher() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!name || !userid || !password) {
      setMsg("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/teachers", {
        name,
        userid,
        password,
        email: email || null,
      });

      setMsg("Teacher added successfully!");
      if (createAnother) {
        setName("");
        setUserid("");
        setPassword("");
        setEmail("");
      } else {
        setTimeout(() => navigate("/admin"), 800);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to add teacher";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #eef3fb 100%)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <button onClick={() => navigate('/admin')} style={{ padding: '8px 12px', background: '#eee', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer' }}>⬅ Dashboard</button>
          <h2 style={{ margin: 0 }}>Add New Teacher</h2>
          <div style={{ width: 80 }} />
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
          <p style={{ marginTop: 0, marginBottom: 12, color: '#666' }}>Logged in as: <strong>{user?.userid || 'ADMIN'}</strong></p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / 3' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dfe6f3' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>User ID *</label>
              <input value={userid} onChange={(e) => setUserid(e.target.value)} placeholder="User ID" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dfe6f3' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dfe6f3' }} />
            </div>

            <div style={{ gridColumn: '1 / 3' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dfe6f3' }} />
            </div>

            <div style={{ gridColumn: '1 / 3', display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
              <button type="submit" disabled={loading} style={{ padding: '10px 18px', background: '#0066ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>{loading ? 'Adding...' : 'Save Teacher'}</button>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#444' }}>
                <input type="checkbox" checked={createAnother} onChange={(e) => setCreateAnother(e.target.checked)} /> Create another
              </label>
            </div>
          </form>

          {msg && (
            <div style={{ marginTop: 12, fontSize: 14, color: msg.includes('successfully') ? 'green' : 'red' }}>{msg}</div>
          )}
        </div>
      </div>
    </div>
  );
}

