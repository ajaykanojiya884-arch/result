import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/dialogs";

export default function AdminTeacherList() {
  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/teachers");
        if (mounted) setTeachers(res.data || []);
      } catch (err) {
        if (mounted) setTeachers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const deleteTeacher = async (id) => {
    const ok = await confirmAction("Are you sure you want to delete this teacher?");
    if (!ok) return;
    try {
      await api.delete(`/admin/teachers/${id}`);
      const res = await api.get("/admin/teachers");
      setTeachers(res.data || []);
      showSuccess("Teacher deleted successfully");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to delete teacher");
    }
  };

  const openAsTeacher = async (id) => {
    try {
      const res = await api.post(`/admin/teachers/${id}/impersonate`);
      const { token, teacher } = res.data;
      if (!token) return alert("Failed to impersonate");

      // Always return admin to the Admin Dashboard (not the teacher area)
      const currentReturn = '/admin';
      const adminBackupToken = localStorage.getItem("authToken") || "";
      const adminBackupUser = localStorage.getItem("user") || "";

      const url = `${window.location.origin}/teacher?impersonate_token=${encodeURIComponent(
        token
      )}&teacher_id=${encodeURIComponent(teacher.teacher_id)}&teacher_name=${encodeURIComponent(
        teacher.name
      )}&admin_backup_token=${encodeURIComponent(adminBackupToken)}&admin_backup_user=${encodeURIComponent(
        adminBackupUser
      )}&admin_return_url=${encodeURIComponent(currentReturn)}`;

      // Open in same tab so browser Back returns to Admin (teacher list)
      window.location.href = url;
    } catch (err) {
      alert("Failed to open teacher panel");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => navigate('/admin')} style={styles.btnBack}>⬅ Go Back</button>
            <h2 style={{ margin: 0 }}>Teachers List</h2>
          </div>

          <div>
            <button onClick={() => navigate('/admin/teachers/add')} style={styles.btnPrimaryAdd}>+ Add New Teacher</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}

        {!loading && teachers.length === 0 && (
          <div style={styles.emptyState}>
            <p>No teachers found</p>
            <button onClick={() => navigate('/admin/teachers/add')} style={styles.btnPrimaryAdd}>Create First Teacher</button>
          </div>
        )}

        {!loading && teachers.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>User ID</th>
                  <th style={styles.th}>Active</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((t) => (
                  <tr key={t.teacher_id} style={styles.tableRow} onMouseEnter={e => (e.currentTarget.style.background = '#fbfdff')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={styles.td}>{t.name}</td>
                    <td style={styles.td}>{t.userid}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: t.active ? '#e6ffed' : '#fff0f0', color: t.active ? '#137333' : '#c62828' }}>
                        {t.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button style={styles.btnEdit} onClick={() => navigate(`/admin/teachers/edit/${t.teacher_id}`)}>Edit</button>
                      <button style={styles.btnDelete} onClick={() => deleteTeacher(t.teacher_id)}>Delete</button>
                      <button style={styles.btnPreview} onClick={() => openAsTeacher(t.teacher_id)}>Open as Teacher</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== STYLES ============== */
const styles = {
  page: {
    padding: "30px 20px",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: "100vh",
  },

  card: {
    background: "#fff",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "35px",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  },

  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #f0f0f0",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#222",
    letterSpacing: "-0.5px",
  },

  btnBack: {
    padding: "9px 16px",
    background: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    color: "#555",
  },

  statsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "15px",
    borderBottom: "1px solid #f0f0f0",
  },

  statCount: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  statLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
  },

  statValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#667eea",
  },

  btnPrimaryAdd: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: "11px 24px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  },

  btnSecondary: {
    background: "#667eea",
    color: "#fff",
    padding: "11px 24px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },

  centerMessage: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
    fontSize: "16px",
  },

  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "#666",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0",
    fontSize: "14px",
  },

  tableHeader: {
    background: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },

  th: {
    padding: "15px 14px",
    textAlign: "left",
    fontWeight: "600",
    color: "#555",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  tableRow: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s",
  },

  td: {
    padding: "14px",
    color: "#333",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 11px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  btnEdit: {
    padding: "7px 11px",
    marginRight: "6px",
    background: "#e3f2fd",
    border: "1px solid #90caf9",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
    color: "#1976d2",
  },

  btnDelete: {
    padding: "7px 11px",
    marginRight: "6px",
    background: "#ffebee",
    border: "1px solid #ef5350",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#c62828",
    transition: "all 0.2s",
  },

  btnPreview: {
    padding: "7px 11px",
    marginRight: "6px",
    background: "#f3e5f5",
    border: "1px solid #ce93d8",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#7b1fa2",
    transition: "all 0.2s",
  },
};
