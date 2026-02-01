
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MarksheetTemplate from '../../components/MarksheetTemplate';
import html2pdf from 'html2pdf.js';

export default function StatementOfMarks() {
  useAuth();
  const { division, rollNo } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/admin/results', {
          params: { division, roll_no: rollNo }
        });
        let resultData = res.data;
        if (Array.isArray(resultData) && resultData.length > 0) {
          resultData = resultData[0];
        } else if (Array.isArray(resultData) && resultData.length === 0) {
            resultData = null;
        }
        setData(resultData);
      } catch (err) {
        console.error("Failed to fetch result", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [division, rollNo]);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    
    const opt = {
      margin: [5, 10, 5, 10], // top, left, bottom, right in mm
      filename: `Report_${division}_${data?.roll_no}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 }, // Higher scale for better clarity
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div>Loading report...</div>;
  if (!data) return <div>Student not found.</div>;

  return (
    <div>
      {/* Controls - Hidden during print */}
      <div className="no-print" style={{ padding: 20, textAlign: 'right', gap: 10, display: 'flex', justifyContent: 'flex-end', background: '#f5f5f5' }}>
        <button 
          onClick={() => window.print()} 
          style={btnStyle}
        >
          Print / Save as PDF (Browser)
        </button>
        <button 
          onClick={handleDownloadPDF} 
          style={{ ...btnStyle, background: '#d32f2f' }}
        >
          Download PDF (Direct)
        </button>
      </div>

      <style>{`
        @media print {
           .no-print { display: none !important; }
           /* Ensure body margin is reset */
           body { margin: 0; padding: 0; }
        }
      `}</style>
      
      {/* Template */}
      <MarksheetTemplate ref={reportRef} data={data} />
    </div>
  );
}

const btnStyle = {
  padding: '10px 16px', 
  fontSize: 14, 
  fontWeight: 'bold',
  cursor: 'pointer',
  background: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: 4
};
