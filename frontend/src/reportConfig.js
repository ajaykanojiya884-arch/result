
// Report Configuration
// Modify this file to change the header, footer, or static text of the report.

export const REPORT_CONFIG = {
  schoolName: "SIES JUNIOR COLLEGE OF COMMERCE",
  schoolAddress: "SRI CHANDRASEKARENDRA SARASWATHI VIDYAPURAM, PLOT I-C, SECTOR V, NERUL, NAVI MUMBAI 400706",
  reportTitle: "STATEMENT OF MARKS - XI STANDARD",
  examheldIn: "MARCH 2025",
  
  // Logo URL - Change this to your logo path
  // Options:
  // 1. Public image: "/images/sies-logo.png" (place logo in frontend/public/images/)
  // 2. External URL: "https://example.com/logo.png"
  // 3. Leave empty string "" to show placeholder
  logoUrl: "/images/sies.jpeg",
  
  // Footer Signatories
  signatories: [
    { label: "CLASS TEACHER" },
    { label: "VICE PRINCIPAL" },
    { label: "PRINCIPAL" }
  ],

  // Grading Key (displayed at the bottom)
  gradingInfo: [
    "GRADES OF EE: Grade A - 30 TO 50 , Grade B : 23 to 29 , Grade C : 18 to 22 , Grade D : less than equal to 17  AA :ABSENT / FEMALE",
    "GRADES OF PE : Grade A - 60% & ABOVE, Grade B – 45% to 59%, Grade C – 35% to 44% Grade D – 34% & BELOW Grade E – EXEMPTED, Grade H - Handicapped",
    "GRADE I WITH DISTINCTION- 75% and ABOVE, GRADE I - 60% to 74.99%, GRADE II - 45% to 59.50%, PASS CLASS - 35% to 44.99%, PROMOTED -- PASSED WITH CONDONATION"
  ]
};
