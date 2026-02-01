// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menu = [
    { key: 'teachers', label: 'Manage Teachers', to: '/admin/teachers' },
    { key: 'view-results', label: 'View Complete Result', to: '/admin/results' },
    { key: 'alloc', label: 'Allocate Subjects', to: '/admin/allocations' },
    { key: 'add-student', label: 'Add Student', to: '/admin/students/add' },
    { key: 'view-students', label: 'View Students', to: '/admin/students' },
  ];

  return (
    <div style={styles.container}>
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          {/* LOGO */}
          <div style={styles.logoBox}>
            <img src="/logo.jpg" alt="logo" style={styles.logoImg} />
            <h3 style={{ margin:0 }}>SIES<br />Junior College</h3>
          </div>

          <div style={{ fontSize: 12, marginBottom: 20, opacity: 0.85 }}>
            Logged in as<br />
            <strong>{user?.name}</strong>
          </div>

          {/* MENU */}
          {menu.map(m => (
            <button
              key={m.key}
              onClick={() => navigate(m.to)}
              style={styles.sideBtn}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* LOGOUT */}
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <h2 style={{ marginTop: 0 }}>Overview</h2>

        <div style={styles.cardGrid}>
          <div style={styles.card} onClick={() => navigate('/admin/teachers')}>
            <div style={styles.cardTitle}>Manage Teachers</div>
            <div style={styles.cardText}>Add, edit or remove teacher accounts</div>
          </div>

          <div style={styles.card} onClick={() => navigate('/admin/allocations')}>
            <div style={styles.cardTitle}>Allocate Subjects</div>
            <div style={styles.cardText}>Assign teachers to subjects and divisions</div>
          </div>

          <div style={styles.card} onClick={() => navigate('/admin/students/add')}>
            <div style={styles.cardTitle}>Add Student</div>
            <div style={styles.cardText}>Create student records quickly</div>
          </div>

          <div style={styles.card} onClick={() => navigate('/admin/students')}>
            <div style={styles.cardTitle}>View Students</div>
            <div style={styles.cardText}>Browse and export student lists</div>
          </div>
        </div>
      </main>
    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif"
  },

  sidebar: {
    width: 260,
    background: "linear-gradient(180deg, #0f1e54, #0b3c91)",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: 20
  },

  logoImg: {
    width: 100,
    height: 42,
    background: "white",
    borderRadius: 6,
    padding: 4,
    marginRight: 10
  },

  sideBtn: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    marginBottom: 8,
    background: "rgba(255,255,255,0.15)",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14
  },

  logoutBtn: {
    padding: "12px",
    background: "#c0392b",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: 24,
    background: "#f8fafc"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16
  },

  card: {
    padding: 16,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    cursor: "pointer"
  },

  cardTitle: {
    fontWeight: 800,
    marginBottom: 4
  },

  cardText: {
    fontSize: 12,
    color: "#6b7280"
  }
};