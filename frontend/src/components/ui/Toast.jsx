// src/components/ui/Toast.jsx
import React from "react";
import styles from "./Toast.module.css";

/**
 * Simple Toast component that accepts message and type props
 * Used as a standalone toast notification (not context-based)
 */
export default function Toast({ message, type = "info" }) {
  // If no message, render nothing
  if (!message) {
    return null;
  }

  // Standalone implementation with message and type props
  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[type]}`}>
        <div className={styles.content}>{message}</div>
      </div>
    </div>
  );
}
