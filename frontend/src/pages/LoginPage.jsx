// src/pages/LoginPage.jsx
import React from "react";
import LoginForm from "../components/auth/LoginForm";

const logoUrl = "/logo.jpg";         
const bgImage = "/college.jpg";    

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
        }}
      />

      <div
        style={{
          width: 420,
          background: "rgba(255,255,255,0.9)",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={logoUrl}
            alt="logo"
            style={{ width: 300, marginBottom: 10 }}
          />
          <h2 style={{ margin: 0, fontSize: 20 }}>
            Junior College Result Portal
          </h2>
          <p style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
            Secure Login
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
