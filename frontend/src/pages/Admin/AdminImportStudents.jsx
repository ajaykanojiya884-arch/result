import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AdminImportStudents() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("File selected:", selectedFile);
    setFile(selectedFile);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    setResult(null);

    console.log("Starting import with file:", file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log("Sending request to /admin/students/import");

      const response = await api.post("/admin/students/import", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Response received:", response);
      console.log("Response data:", response.data);

      setResult(response.data);
      alert(`Import completed! ${response.data.message}`);
      if (response.data.warnings && response.data.warnings.length > 0) {
        console.log("Warnings:", response.data.warnings);
      }
      // Redirect to View Students after successful import
      navigate("/admin/students");
    } catch (err) {
      console.error("Import error:", err);
      const errorMsg = err.response?.data?.error || "Failed to import students";
      let details = err.response?.data?.details;
      // Normalize details to be an array so rendering using .map is safe
      if (!Array.isArray(details)) {
        if (details === undefined || details === null) {
          details = [];
        } else {
          details = [details];
        }
      }
      console.error("Error message:", errorMsg);
      console.error("Error details:", details);
      setResult({ error: errorMsg, details });
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/students/add");
  };

  return (
    <>
      {/* Translucent Overlay */}
      <div style={styles.overlay} onClick={handleCancel}></div>
      
      {/* Modal */}
      <div style={styles.modal}>
        <div style={styles.card}>
          {/* Header Section */}
          <div style={styles.header}>
            <span style={styles.backLink} onClick={() => navigate("/admin/students/add")}>
              ← Back to Students
            </span>
            <h2 style={styles.title}>Import Students from Excel</h2>
          </div>

          {/* Instruction Text */}
          <div style={styles.instructions}>
            <p>Upload an Excel file with the following required columns in this order:</p>
            <ul style={styles.instructionList}>
              <li>Roll Number</li>
              <li>Name</li>
              <li>Division</li>
              <li>Optional Subject 1 (Hindi/IT)</li>
              <li>Optional Subject 2 (SP/Maths)</li>
            </ul>
            <p>The system will automatically assign default subjects (ENG, ECO, BK, OC) to all students.</p>
          </div>

          {/* File Upload Section */}
          <div style={styles.uploadSection}>
            <label style={styles.label}>Select Excel File (.xlsx or .xls)</label>
            <div style={styles.fileInputContainer}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={styles.fileInput}
                id="file-input"
              />
              <label htmlFor="file-input" style={styles.fileButton}>
                Choose file
              </label>
              <span style={styles.fileName}>
                {file ? file.name : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!file || uploading}
              style={{
                ...styles.importBtn,
                opacity: (!file || uploading) ? 0.6 : 1,
                cursor: (!file || uploading) ? "not-allowed" : "pointer"
              }}
            >
              {uploading ? "Importing..." : "Import Students"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div style={styles.result}>
              {result.message && <p style={styles.success}>{result.message}</p>}
              {result.error && <p style={styles.error}>{result.error}</p>}
              {result.details && result.details.length > 0 && (
                <div style={styles.details}>
                  <h4>Details:</h4>
                  <ul>
                    {result.details.map((detail, idx) => (
                      <li key={idx} style={styles.detailItem}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings && result.warnings.length > 0 && (
                <div style={styles.warnings}>
                  <h4>Warnings:</h4>
                  <ul>
                    {result.warnings.map((warning, idx) => (
                      <li key={idx} style={styles.warningItem}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    padding: "50px",
    width: "100%",
    maxWidth: "700px",
    minHeight: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "40px",
    gap: "30px",
  },
  backLink: {
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  instructions: {
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "40px",
    textAlign: "left",
  },
  instructionList: {
    margin: "10px 0",
    paddingLeft: "20px",
  },
  uploadSection: {
    marginBottom: "40px",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "15px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  fileInputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px 16px",
    backgroundColor: "#fafafa",
    maxWidth: "400px",
    margin: "0 auto",
  },
  fileInput: {
    display: "none",
  },
  fileButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.3s",
    flexShrink: 0,
  },
  fileName: {
    color: "#666",
    fontSize: "14px",
    flex: 1,
    textAlign: "right",
    marginLeft: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  cancelBtn: {
    flex: 1,
    padding: "14px 24px",
    backgroundColor: "#f8f9fa",
    color: "#333",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.3s",
  },
  importBtn: {
    flex: 1,
    padding: "14px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  result: {
    marginTop: "0",
    padding: "20px",
    borderRadius: "6px",
    backgroundColor: "#f8f9fa",
  },
  success: {
    color: "#28a745",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
  error: {
    color: "#dc3545",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
  details: {
    marginTop: "15px",
  },
  detailItem: {
    color: "#856404",
    margin: "5px 0",
  },
  warnings: {
    marginTop: "15px",
  },
  warningItem: {
    color: "#856404",
    margin: "5px 0",
  },
};