# Marksheet Layout Updates – Official SIES Format

## Overview
The marksheet layout in `BatchPrint.jsx` and `MarksheetTemplate.jsx` has been updated to follow an official, print-ready academic format matching authentic SIES (Sundarrao Hari Singhania Education Society) standards.

## Key Improvements

### 1. **Professional Header Layout**
- **Logo Placement (Left-Aligned)**: SIES logo placeholder positioned on the left side (80px wide)
- **Centered Content**: School name, address, and "STATEMENT OF MARKS – XI STANDARD" perfectly centered
- **Balanced Symmetry**: Right spacer (80px) maintains visual balance with logo
- **Print-Proof Design**: Header prevented from page breaks during printing

### 2. **Auto-Generated Date Field**
- **Dynamic Date Generation**: Date field now auto-generates using the current system date
- **Clean Format**: Displays as `DD/MM/YYYY` (e.g., `05/02/2026`)
- **No Manual Updates**: Eliminates the need for manual date entry on each printout
- **Location**: Displayed in the bottom-right of the header info row

### 3. **Print-Ready CSS & Formatting**

#### Page Break Prevention
```css
@page {
  size: A4;
  margin: 10mm;
}

.marksheet-header {
  pageBreakAfter: 'avoid'; 
  breakAfter: 'avoid';
}
```
- Prevents header from breaking across pages
- Ensures clean A4 PDF output
- Maintains consistent spacing on batch printouts

#### Responsive Layout
- Flexbox layout adapts to different screen sizes
- Print stylesheet optimizes margins and padding for A4
- Consistent 10mm margins on all sides during printing

### 4. **Info Row Organization**
```
INDEX NO: J16.15.017 | UDISE NO: 27211007406  |  EXAMINATION HELD IN [Year]  |  Date: [Auto-Generated]
```
- Left side: School identification (INDEX and UDISE numbers)
- Right side: Exam held info and current auto-generated date
- Distributed across full header width for professional appearance

### 5. **Font & Spacing Consistency**
- **College Name**: 18px, bold, uppercase, 0.5px letter spacing
- **Address**: 10px, bold, uppercase, 0.3px letter spacing, 1.4 line height
- **Report Title**: 15px, bold, 0.5px letter spacing
- **Info Row**: 11px, bold, centered alignment
- **Overall Border**: 2px solid black bottom border, 12px padding below

## File Changes

### 1. **frontend/src/components/MarksheetTemplate.jsx**
**New Function Added:**
```javascript
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};
```

**Header Section Replaced:**
- Old: Simple centered text layout with placeholder date slashes
- New: Flex-based layout with logo, centered content, and auto-generated date

**Print CSS Added:**
- Enhanced `@page` directive for A4 sizing
- Print-specific margins (10mm)
- Page-break-inside prevention for tables

### 2. **frontend/src/pages/Admin/BatchPrint.jsx**
- Removed unused `useRef` import to fix ESLint warning
- Layout remains compatible with new `MarksheetTemplate` component

## Usage & Benefits

### Screen View
- Marksheet displays with professional SIES header
- Logo visible on left (placeholder for actual SIES logo)
- Title and school info perfectly centered
- Date auto-updates every day without code changes

### A4 PDF Printing (Single & Batch)
1. **Browser Print** (`Ctrl+P` or Print All button):
   - Header preserved without page breaks
   - A4 page size with 10mm margins
   - Date auto-fills from system date
   - Save as PDF for consistent output

2. **Batch PDF Download** (html2pdf):
   - Multiple marksheets with consistent formatting
   - Page break after each student (controlled via CSS)
   - Header on every page (inherits date auto-generation)
   - Professional appearance across all pages

### Responsive Reusability
- Same component used for:
  - Individual marksheet view
  - Batch printing (single or all students)
  - PDF export
  - Future API/API-based reporting

## Future Enhancements (Optional)

1. **Logo Integration**: Replace SIES LOGO placeholder with actual image upload
   ```javascript
   <img src={logoUrl} alt="SIES Logo" style={{width: '70px', height: '70px'}} />
   ```

2. **Custom Date Format**: Allow admin to configure date format via config
   - Current: DD/MM/YYYY
   - Options: MM/DD/YYYY, YYYY-MM-DD, etc.

3. **Footer Enhancements**: 
   - Add page numbers (Page X of Y) for batch printouts
   - Include batch info or exam session details

4. **Branding Customization**:
   - Allow admin to configure header colors
   - Dynamic subject count based on curriculum

## Testing Checklist

- [x] Header displays with logo, centered content, and date
- [x] Date auto-generates and updates daily
- [x] No page breaks within header during printing
- [x] A4 PDF output looks professional
- [x] Batch printing maintains consistent formatting
- [x] Responsive on different screen sizes
- [x] All ESLint warnings resolved
- [x] Build compiles successfully

## Technical Notes

- **Component**: `MarksheetTemplate.jsx` (reusable React component)
- **Used By**: `BatchPrint.jsx` (batch processing page)
- **Date Logic**: `getCurrentDate()` function runs on component render
- **Print Media Query**: Separate CSS rules for `@media print`
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Deployment

Run the updated build:
```bash
cd frontend
npm run build
```

Built output includes optimized CSS with all print media queries. Ready for production deployment.

---

**Last Updated**: February 5, 2026
**Marksheet Format Version**: 1.1 (Professional SIES Edition)
