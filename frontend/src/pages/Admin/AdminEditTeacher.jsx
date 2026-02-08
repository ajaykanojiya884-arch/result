import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { showError, showSuccess } from "../../utils/dialogs";

export default function AdminEditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    userid: "",
    email: "",
    password: "",
    active: true,
  });
  const [showPassword, setShowPassword] = useState(true);

  const loadTeacher = useCallback(async () => {
    try {
      const res = await api.get("/admin/teachers");
      const teacher = res.data.find((t) => t.teacher_id === parseInt(id));

      if (!teacher) {
        showError("Teacher not found");
        navigate("/admin");
        return;
      }

      setForm({
        name: teacher.name,
        userid: teacher.userid,
        email: teacher.email || "",
        password: teacher.password || "",
        active: teacher.active,
      });
    } catch (err) {
      showError(err.response?.data?.error || "Failed to load teacher");
    }
  }, [id, navigate]);

  useEffect(() => {
    loadTeacher();
  }, [loadTeacher]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await api.put(`/admin/teachers/${id}`, payload);
      showSuccess("Teacher updated successfully");
      navigate("/admin/teachers");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to update teacher");
    }
  };

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "30px" }}>
      <div
        style={{
          background: "#fff",
          maxWidth: "650px",
          margin: "0 auto",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={() => navigate("/admin")}
          style={{
            marginBottom: "15px",
            padding: "8px 14px",
            background: "#eee",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ⬅  GO Back
        </button>

        <h2 style={{ textAlign: "center", marginBottom: 25, background:"#0066ff" }}>Edit Teacher</h2>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="NAME"
            style={input}
          />

          <label>User ID</label>
          <input
            name="userid"
            value={form.userid}
            onChange={handleChange}
            required
            placeholder="USER ID"
            style={input}
          />

          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            style={input}
          />

          <label>Password</label>
<div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}   // visible on load
    name="password"
    value={form.password}
    onChange={handleChange} required
    placeholder="password"
    style={{ ...input, paddingRight: 20 }}
  />

  <button
    type="button"
    onClick={() => setShowPassword((s) => !s)}
    style={showPwdBtn}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

<div style={{ fontSize: 5, color: "#666", marginTop: 6, marginBottom: 6 }}>
</div>

          <label style={{ marginTop:8  }}>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              style={{ marginRight: 6 }}
            />
            Active
          </label>

          <button type="submit" style={primaryBtn}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  marginBottom: "15px",
};

const primaryBtn = {
  width: "100%",
  padding: "12px",
  background: "#0066ff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "15px",
};

const showPwdBtn = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#0066ff",
};
