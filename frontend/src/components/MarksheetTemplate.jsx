
import React, { forwardRef } from 'react';
import { REPORT_CONFIG } from '../reportConfig';

/**
 * Pure component to render a single student's marksheet.
 * Uses forwardRef so parent can capture it for PDF generation if needed.
 */
// ... (imports)

const MarksheetTemplate = forwardRef(({ data, style }, ref) => {
  if (!data) return null;

  // -- Helpers --
  const ORDER = ["ENG", "HINDI", "IT", "MARATHI", "FRENCH", "GERMAN", "ECO", "BK", "OC", "SP", "MATHS"];
  const GRADE_SUBJECTS = ["EVS", "PE"];

  const numericSubjects = data.subjects.filter(s => !GRADE_SUBJECTS.includes(s.code));
  const gradeSubjects = data.subjects.filter(s => GRADE_SUBJECTS.includes(s.code));

  // Sort numeric subjects
  numericSubjects.sort((a, b) => {
    const ia = ORDER.indexOf(a.code);
    const ib = ORDER.indexOf(b.code);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  
  // Sort grade subjects (EVS first)
  gradeSubjects.sort((a, b) => {
      if (a.code === 'EVS') return -1;
      if (b.code === 'EVS') return 1;
      return 0;
  });

  function getSubjName(code) {
    const MAP = {
        "ENG": "English",
        "HINDI": "Hindi",
        "IT": "Information Technology",
        "ECO": "Economics",
        "BK": "Book Keeping and Accountancy",
        "OC": "Organisation of Commerce and Management",
        "SP": "Secretarial Practice",
        "MATHS": "Mathematics",
        "EVS": "Environment Education & Water Security",
        "PE": "Physical Education"
    };
    return MAP[code] || code;
  }

  const totalMax = numericSubjects.length * 100;
  const totalObtained = numericSubjects.reduce((acc, s) => acc + (s.avg || 0), 0) + (data.total_grace || 0);

  return (
    <div ref={ref} className="marksheet-container" style={{ 
      fontFamily: '"Times New Roman", Times, serif', 
      padding: '10px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      color: '#000',
      background: 'white',
      ...style
    }}>
      <style>{`
        .report-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #000;
        }
        .report-table th, .report-table td {
          border: 1px solid #000;
          padding: 5px 4px;
          text-align: center;
          font-size: 13px;
          height: 24px;
        }
        .report-table th {
            font-weight: bold;
            background-color: transparent;
        }
        .left-align { text-align: left !important; padding-left: 8px !important; }
        .bold { font-weight: bold; }
        .sub-header { font-size: 11px; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', fontSize: '20px', fontWeight: '900' }}>{REPORT_CONFIG.schoolName}</h2>
        <div style={{ fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>{REPORT_CONFIG.schoolAddress}</div>
        <h3 style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>{REPORT_CONFIG.reportTitle}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '10px', fontWeight: 'bold', padding: '0 5px' }}>
             <div>INDEX NO: J16.15.017 &nbsp;&nbsp;&nbsp;&nbsp; UDISE NO: 27211007406</div> 
             <div></div>
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '2px', padding: '0 5px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
             <span>EXAMINATION HELD IN {REPORT_CONFIG.examheldIn}</span>
             <span style={{ position: 'absolute', right: 5 }}>Date: &nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;/20&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* Student Info Table */}
      <table className="report-table" style={{ marginBottom: '10px', borderBottom: 'none' }}>
        <tbody>
          <tr>
            <td className="left-align bold" style={{ width: '25%' }}>Examination Seat No</td>
            <td className="left-align bold" style={{ width: '50%' }}>Student Name</td> 
            <td className="left-align bold" style={{ width: '25%' }}>Result/ Grade</td>
          </tr>
          <tr>
            <td className="left-align bold" style={{ height: '30px', fontSize: '14px' }}>{data.roll_no}</td>
            <td className="left-align bold" style={{ textTransform: "uppercase", fontSize: '14px' }}>{data.name}</td>
            <td className="left-align bold" style={{ fontSize: '14px' }}>
                {data.overall_grade ? data.overall_grade : 
                 (data.percentage >= 35 ? "PASS" : "FAIL")}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Marks Table */}
      <table className="report-table">
        <thead>
          <tr style={{ height: '30px' }}>
            <th rowSpan={2} style={{ width: '30%' }}>SUBJECTS</th>
            <th colSpan={2}>U.T - I</th>
            <th colSpan={2}>TERMINAL</th>
            <th colSpan={2}>U.T. - II</th>
            <th colSpan={2}>ANNUAL</th>
            <th colSpan={4}>AVERAGE</th>
          </tr>
          <tr style={{ height: '25px' }}>
            {/* Sub headers */}
            <th className="sub-header" style={{ width: '5%' }}>MAX</th><th className="sub-header" style={{ width: '5%' }}>OBTN</th>
            <th className="sub-header" style={{ width: '5%' }}>MAX</th><th className="sub-header" style={{ width: '5%' }}>OBTN</th>
            <th className="sub-header" style={{ width: '5%' }}>MAX</th><th className="sub-header" style={{ width: '5%' }}>OBTN</th>
            <th className="sub-header" style={{ width: '5%' }}>MAX</th><th className="sub-header" style={{ width: '5%' }}>OBTN</th>
            
            <th className="sub-header" style={{ width: '5%' }}>MAX</th>
            <th className="sub-header" style={{ width: '5%' }}>MIN</th>
            <th className="sub-header" style={{ width: '5%' }}>AVG</th>
            <th className="sub-header" style={{ width: '5%' }}>Grace</th>
          </tr>
        </thead>
        <tbody>
          {/* Numeric Subjects Rows */}
          {numericSubjects.map(subj => (
            <tr key={subj.code}>
              <td className="left-align bold">
                  {getSubjName(subj.code)}
              </td>
              
              {/* UT1 */}
              <td>25</td><td>{subj.mark?.unit1 ?? ""}</td>
              {/* Terminal */}
              <td>50</td><td>{subj.mark?.term ?? ""}</td>
              {/* UT2 */}
              <td>25</td><td>{subj.mark?.unit2 ?? ""}</td>
              {/* Annual */}
              <td>100</td>
              <td>
                {(subj.mark?.annual != null || subj.mark?.internal != null) 
                  ? ((subj.mark?.annual || 0) + (subj.mark?.internal || 0)) 
                  : ""}
              </td>
              
              {/* Average */}
              <td>100</td>
              <td>35</td>
              <td className="bold">{Math.round(subj.avg || 0) || ""}</td>
              <td>{subj.grace > 0 ? subj.grace : ""}</td>
            </tr>
          ))}

          {/* Total Row */}
          <tr style={{ height: '30px', borderTop: '2px solid #000' }}>
            <td className="left-align bold">Total Marks (out of {totalMax})</td>
            <td colSpan={8} style={{ background: '#f9f9f9' }}></td> 
            
            <td></td> {/* Max */}
            <td></td> {/* Min */}
            {/* AVG column gets the Total Obtained */}
            <td className="bold">{Math.round(totalObtained)}</td>
            <td></td> {/* Grace */}
          </tr>
          
          {/* Grade Subjects (EVS, PE) */}
          {gradeSubjects.map(subj => (
             <tr key={subj.code}>
                 <td className="left-align bold">{getSubjName(subj.code)}</td>
                 <td colSpan={10}></td> {/* 8 cols + Max + Min = 10 cols empty? No. 
                    Columns: 
                    1 (Subj)
                    + 2 (UT1) + 2 (Term) + 2 (UT2) + 2 (Annual) = 8
                    + 4 (Avg) = 12 total columns.
                    Skipped: UT1(2), Term(2), UT2(2), Annual(2), Max(1), Min(1) = 10 columns.
                    Target: Avg(1)
                 */}
                 <td className="bold">{subj.grade}</td>
                 <td></td> {/* Grace */}
             </tr>
          ))}

        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', padding: '0 30px' }}>
          {REPORT_CONFIG.signatories.map((sig, idx) => (
              <div key={idx} style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>{sig.label}</div>
              </div>
          ))}
      </div>
      
      {/* Grading Key */}
      <div style={{ marginTop: '10px', fontSize: '9px', lineHeight: '1.3', color: '#333' }}>
          {REPORT_CONFIG.gradingInfo.map((line, idx) => (
              <div key={idx}>{line}</div>
          ))}
      </div>
    </div>
  );
});

export default MarksheetTemplate;
