
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MarksheetTemplate from '../../components/MarksheetTemplate';
import html2pdf from 'html2pdf.js';

export default function BatchPrint() {
  useAuth();
  const { division } = useParams();
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchBatch() {
      try {
        // We can reuse the results endpoints. 
        // If we fetch by division, we might get summary list. 
        // We need full details for each student.
        // /admin/results?division=X usually returns summary objects.
        // But let's check if the summary objects have enough data.
        // Based on previous reads, the `/content/admin_results` endpoint logic: 
        // It iterates and builds full data for each student in the division response.
        
        const res = await api.get('/admin/results', { params: { division } });
        // Sort by roll number - ensure numeric sort if looks numeric
        const sorted = (res.data || []).sort((a, b) => {
            const rA = parseInt(a.roll_no, 10);
            const rB = parseInt(b.roll_no, 10);
            if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
            return a.roll_no.localeCompare(b.roll_no);
        });
        setStudentsData(sorted);
      } catch (err) {
        console.error("Batch load failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBatch();
  }, [division]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleBatchDownload = () => {
      const element = document.getElementById('batch-container');
      const opt = {
          margin: [0, 0, 0, 0], // Zero margin for batch to let individual templates handle their padding
          filename: `Batch_Report_${division}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 1.5, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
          pagebreak: { mode: ['css', 'legacy'] } // standard page break
      };
      html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div>Loading batch data...</div>;
  if (!studentsData.length) return <div>No students found for division {division}</div>;

  return (
    <div>
      <div className="no-print" style={{ padding: 20, background: '#eee', marginBottom: 20 }}>
        <h2>Batch Print: Division {division} ({studentsData.length} students)</h2>
        <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} style={btnStyle}>Print All (Browser)</button>
            <button onClick={handleBatchDownload} style={{ ...btnStyle, background: '#d32f2f' }}>Download All PDF</button>
        </div>
        <p style={{ fontSize: 13, color: '#666' }}>
            Tip: Use "Print All" and select "Save as PDF" for best results.
        </p>
      </div>

      <div id="batch-container">
        {studentsData.map((student, idx) => (
          <div key={student.roll_no} className="page-break" style={{ 
              width: '100%', 
              // Min height A4 landscape approx 210mm in pixels ~ 794px, 
              // but purely relying on content + break is better. 
              // Ensure no overflow.
          }}>
             <MarksheetTemplate data={student} style={{ margin: 0, padding: '10px' }} />
          </div>
        ))}
      </div>
      
      <style>{`
        @media print {
            .no-print { display: none !important; }
            .page-break { page-break-after: always; break-after: page; }
            body { margin: 0; padding: 0; }
        }
        /* For html2pdf interaction */
        .page-break {
            page-break-after: always;
            break-after: page;
        }
      `}</style>
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
