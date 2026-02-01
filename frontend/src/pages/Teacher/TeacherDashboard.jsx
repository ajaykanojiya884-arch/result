// src/pages/Teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("impersonate_token");
      if (token) {
        sessionStorage.setItem("impersonateToken", token);

        const teacherId = params.get("teacher_id");
        if (teacherId) sessionStorage.setItem("impersonateTeacherId", teacherId);

        const teacherName = params.get("teacher_name");
        if (teacherName) sessionStorage.setItem("impersonateTeacherName", teacherName);

        const adminBackupToken = params.get("admin_backup_token");
        const adminBackupUser = params.get("admin_backup_user");
        const adminReturnUrl = params.get("admin_return_url");
        if (adminBackupToken) sessionStorage.setItem("adminBackupAuthToken", adminBackupToken);
        if (adminBackupUser) sessionStorage.setItem("adminBackupUser", adminBackupUser);
        if (adminReturnUrl) sessionStorage.setItem("adminReturnUrl", adminReturnUrl);

        params.delete("impersonate_token");
        params.delete("teacher_id");
        params.delete("teacher_name");
        params.delete("admin_backup_token");
        params.delete("admin_backup_user");
        params.delete("admin_return_url");

        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (err) {}
  }, []);

  const impersonatedName = sessionStorage.getItem("impersonateTeacherName");
  const isImpersonating = Boolean(sessionStorage.getItem("impersonateToken"));
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeMsg, setChangeMsg] = useState(null);

  function backToAdmin() {
    try {
      const adminToken = sessionStorage.getItem("adminBackupAuthToken");
      const adminUser = sessionStorage.getItem("adminBackupUser");
      if (adminToken) localStorage.setItem("authToken", adminToken);
      if (adminUser) localStorage.setItem("user", adminUser);
    } catch (e) {}

    let returnUrl = sessionStorage.getItem("adminReturnUrl") || "/admin/teachers";

    try {
      sessionStorage.removeItem("impersonateToken");
      sessionStorage.removeItem("impersonateTeacherId");
      sessionStorage.removeItem("impersonateTeacherName");
      sessionStorage.removeItem("adminBackupAuthToken");
      sessionStorage.removeItem("adminBackupUser");
      sessionStorage.removeItem("adminReturnUrl");
    } catch (e) {}

    if (!/^https?:\/\//i.test(returnUrl)) {
      returnUrl = window.location.origin + returnUrl;
    }

    window.location.href = returnUrl;
  }

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div>
          {/* Logo */}
          <div style={styles.logoBox}>
            <img src="/logo.jpg" alt="logo" style={styles.logoImg} />
            <h3>SIES<br />Junior College</h3>
          </div>

          {user?.allocations && user.allocations.some((a) => (a.subject_eval_type || "MARKS") === "MARKS") && (
            <button
              style={styles.sideBtn}
              onClick={() => navigate("/teacher/add-marks")}
            >
              Add Marks
            </button>
          )}

          {user?.allocations && (() => {
            const allocs = user.allocations || [];
            const hasPE = allocs.some((a) => (a.subject_eval_type || "MARKS") === "GRADE" && a.subject_code === "PE");
            const hasEVS = allocs.some((a) => (a.subject_eval_type || "MARKS") === "GRADE" && a.subject_code === "EVS");
            return (
              <>
                {hasPE && (
                  <button style={styles.sideBtn} onClick={() => navigate("/teacher/pe-grade")}>
                    PE Grade Entry
                  </button>
                )}

                {hasEVS && (
                  <button style={styles.sideBtn} onClick={() => navigate("/teacher/evs-grade")}>
                    EVS Grade Entry
                  </button>
                )}
              </>
            );
          })()}

          <button
            style={styles.sideBtn}
            onClick={() => navigate("/teacher/subject-result")}
          >
            View Results
          </button>

          {isImpersonating && (
            <button style={styles.impersonateBtn} onClick={backToAdmin}>
              Back to Admin
            </button>
          )}
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        <h2>Teacher Dashboard</h2>

        <p>
          Welcome, <strong>{user?.userid}</strong>
        </p>

        {isImpersonating && (
          <div style={styles.impersonationNote}>
            Logged in as: {impersonatedName || user?.name} (Opened by Admin)
          </div>
        )}

        {/* Password change section */}
        <div style={{marginTop:20, maxWidth:420}}>
          <h4>Change Password</h4>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <input
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={{padding:8, borderRadius:6, border:'1px solid #ccc'}}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{padding:8, borderRadius:6, border:'1px solid #ccc'}}
            />
            <div style={{display:'flex',gap:8}}>
              <button
                disabled={changing}
                onClick={async () => {
                  try {
                    setChanging(true);
                    setChangeMsg(null);
                    const res = await api.post('/teacher/change-password', {
                      old_password: oldPassword,
                      new_password: newPassword
                    });
                    setChangeMsg({ok:true, text: res.data?.message || 'Password updated'});
                    setOldPassword(''); setNewPassword('');
                  } catch (err) {
                    setChangeMsg({ok:false, text: err.message || 'Failed to change password'});
                  } finally {
                    setChanging(false);
                  }
                }}
                style={{padding:'8px 12px', borderRadius:6, border:'none', background:'#0b63d6', color:'white'}}
              >
                {changing ? 'Saving...' : 'Change Password'}
              </button>
              <button style={{padding:'8px 12px', borderRadius:6}} onClick={() => { setOldPassword(''); setNewPassword(''); setChangeMsg(null); }}>
                Reset
              </button>
            </div>
            {changeMsg && (
              <div style={{color: changeMsg.ok ? 'green' : 'crimson', marginTop:6}}>{changeMsg.text}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES (UI ONLY) ---------- */

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif"
  },

  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg, #0f1e54, #0b3c91)",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px"
  },

  logoImg: {
    width: "42px",
    height: "42px",
    background: "white",
    borderRadius: "6px",
    padding: "4px",
    marginRight: "10px"
  },

  sideBtn: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    background: "rgba(255,255,255,0.15)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },

  impersonateBtn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "10px"
  },

  logoutBtn: {
    width: "100%",
    padding: "12px",
    background: "#c0392b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer"
  },

  main: {
    flex: 1,
    background: "#f8fafc",
    padding: "30px"
  },

  impersonationNote: {
    marginTop: "10px",
    color: "#b91c1c",
    fontWeight: 600
  }
};
