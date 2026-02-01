import React from "react";
import { useAuth } from "../../context/AuthContext";
import BatchSelector from "./BatchSelector";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header" style={styles.header}>
      <style>{`
        @media print {
          .app-header { display: none !important; }
        }
      `}</style>
      <div style={styles.left}>SIES College — Result Analysis</div>
      <div style={styles.center}></div>
      <div style={styles.right}>
        <BatchSelector />
        {user && (
          <div style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{user.name}</span>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
  left: { fontWeight: 700 },
  center: {},
  right: { display: "flex", alignItems: "center" },
  logoutBtn: { padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer" },
};
