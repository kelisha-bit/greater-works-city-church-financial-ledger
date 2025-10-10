# Donation Receipt Features

## Overview
The donation receipt system has been completely overhauled with modern features, better design, and enhanced functionality.

## New Features

### 1. **QR Code Verification** ✅
- Every receipt now includes a scannable QR code
- QR code contains receipt verification data (ID, amount, date)
- Can be used to verify receipt authenticity

### 2. **Action Buttons** 🎯
The receipt now includes four action buttons:

- **Print**: Opens browser print dialog for immediate printing
- **Download PDF**: Generates and downloads receipt as PDF file
- **Email**: Opens email client with pre-filled receipt details
- **Close**: Closes the receipt modal (when applicable)

### 3. **Environment-Based Configuration** ⚙️
Church information is now configurable via environment variables:

```env
VITE_CHURCH_NAME=Greater Works City Church
VITE_CHURCH_ADDRESS=123 Faith Street, Accra, Ghana
VITE_CHURCH_PHONE=+233 XX XXX XXXX
VITE_CHURCH_EMAIL=info@greaterworkschurch.org
VITE_CHURCH_WEBSITE=www.greaterworkschurch.org
VITE_CHURCH_TAX_ID=XX-XXXXXXX
VITE_CHURCH_PASTOR_NAME=Pastor John Smith
```

### 4. **Modern Design** 🎨
- Gradient headers (blue to indigo)
- Better color-coded sections
- Improved typography (switched from serif to sans-serif)
- Enhanced spacing and borders
- Cleaner logo integration with fallback SVG
- Removed all debug console.log statements

### 5. **Print-Optimized Styling** 🖨️
- Special print media queries
- Hides action buttons when printing
- Optimized padding and margins for paper
- Clean, professional print output

## Setup Instructions

### 1. Install Dependencies
The following packages have been added:
```bash
npm install
```

New dependencies:
- `qrcode.react` - QR code generation
- `html2canvas` - Screenshot/canvas rendering for PDF
- `jspdf` - PDF generation

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and update with your church information:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual church details.

### 3. Usage

#### In Components
```tsx
import DonorReceipt from './components/DonorReceipt';

// Basic usage (uses environment variables)
<DonorReceipt 
  transaction={transaction}
  showActions={true}
  onClose={() => setShowReceipt(false)}
/>

// With custom church info
<DonorReceipt 
  transaction={transaction}
  churchInfo={{
    name: "Your Church Name",
    address: "Your Address",
    phone: "Your Phone",
    email: "Your Email",
    website: "Your Website",
    taxId: "Your Tax ID",
    pastorName: "Pastor Name"
  }}
  logoUrl="/your-logo.png"
  showActions={true}
/>
```

## Component Props

```typescript
interface DonorReceiptProps {
  transaction: Transaction;           // Required: The donation transaction
  churchInfo?: {                      // Optional: Church details (uses env vars if not provided)
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    pastorName: string;
  };
  logoUrl?: string;                   // Optional: Path to church logo (default: '/GWCC-logo.png')
  showActions?: boolean;              // Optional: Show action buttons (default: true)
  onClose?: () => void;               // Optional: Close handler
}
```

## Features Breakdown

### QR Code
- Automatically generated for each receipt
- Contains verification URL with transaction details
- Size: 96x96 pixels
- Error correction level: High (H)

### PDF Download
- Captures entire receipt as high-quality image
- Converts to A4 PDF format
- Filename format: `Receipt-{ID}-{Date}.pdf`
- Uses html2canvas for rendering

### Email Integration
- Opens default email client
- Pre-fills subject and body with receipt details
- Includes donor name, amount, receipt number
- Professional email template

### Print Functionality
- Uses native browser print dialog
- Optimized print styles
- Hides action buttons
- Maintains professional layout

## Styling

### Color Scheme
- **Header**: Blue to Indigo gradient
- **Church Info**: Blue gradient background
- **Donor Info**: Green gradient background
- **Transaction Details**: Gray background
- **Tax Info**: Yellow background with warning border

### Typography
- **Font**: Sans-serif (changed from serif for better readability)
- **Headers**: Bold, large sizes
- **Body**: Regular weight, readable sizes
- **Print**: Slightly smaller sizes for paper

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Print: All modern browsers

## Security Notes
- QR codes contain public verification data only
- No sensitive information in QR codes
- Tax ID should be configured properly
- Email functionality uses mailto (client-side only)

## Future Enhancements
- [ ] Backend receipt verification endpoint
- [ ] Email sending via backend API
- [ ] Receipt history/archive
- [ ] Batch receipt generation
- [ ] Custom receipt templates
- [ ] Multi-language support

## Troubleshooting

### PDF Download Not Working
- Ensure html2canvas and jspdf are installed
- Check browser console for errors
- Try using Print instead

### QR Code Not Showing
- Verify qrcode.react is installed
- Check that transaction data is valid
- Inspect browser console

### Logo Not Loading
- Verify logo path is correct
- Check file exists in public folder
- Fallback SVG will show if image fails

### Environment Variables Not Working
- Ensure .env.local exists
- Restart dev server after changes
- Variables must start with VITE_

## Support
For issues or questions, contact the development team or refer to the main README.md file.
