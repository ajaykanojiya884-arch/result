// src/App.js
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes";
import Toast from "./components/ui/Toast";
import Header from "./components/layout/Header";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toast />
        <Header />
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
