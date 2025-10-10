import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Transaction } from '../types';

interface DonorReceiptProps {
  transaction: Transaction;
  churchInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    pastorName: string;
  };
  logoUrl?: string;
  showActions?: boolean;
  onClose?: () => void;
}

// Get church info from environment variables with fallbacks
const getChurchInfo = () => ({
  name: import.meta.env.VITE_CHURCH_NAME || 'Greater Works City Church',
  address: import.meta.env.VITE_CHURCH_ADDRESS || '123 Faith Street, Accra, Ghana',
  phone: import.meta.env.VITE_CHURCH_PHONE || '+233 XX XXX XXXX',
  email: import.meta.env.VITE_CHURCH_EMAIL || 'info@greaterworkschurch.org',
  website: import.meta.env.VITE_CHURCH_WEBSITE || 'www.greaterworkschurch.org',
  taxId: import.meta.env.VITE_CHURCH_TAX_ID || 'XX-XXXXXXX',
  pastorName: import.meta.env.VITE_CHURCH_PASTOR_NAME || 'Pastor John Smith',
});

const DonorReceipt: React.FC<DonorReceiptProps> = ({
  transaction,
  churchInfo,
  logoUrl = '/GWCC-logo.png',
  showActions = true,
  onClose
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  
  // Use environment variables if churchInfo not provided
  const church = churchInfo || getChurchInfo();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate QR code data (receipt verification URL)
  const qrCodeData = `${window.location.origin}/verify-receipt?id=${transaction.id}&amount=${transaction.amount}&date=${transaction.date}`;

  // Print receipt
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt-${transaction.id.slice(-8)}-${formatDate(transaction.date)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try printing instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Email receipt (opens mailto link)
  const handleEmail = () => {
    const subject = encodeURIComponent(`Donation Receipt - ${church.name}`);
    const body = encodeURIComponent(
      `Dear ${transaction.donorName || 'Valued Donor'},\n\n` +
      `Thank you for your generous donation of ${formatCurrency(transaction.amount)} to ${church.name}.\n\n` +
      `Receipt Number: RCPT-${transaction.id.slice(-8).toUpperCase()}\n` +
      `Transaction Date: ${formatDate(transaction.date)}\n` +
      `Description: ${transaction.description}\n\n` +
      `Please find your official receipt attached or print it from our website.\n\n` +
      `God bless you!\n\n` +
      `${church.name}\n` +
      `${church.phone} | ${church.email}`
    );
    
    window.location.href = `mailto:${transaction.donorContact || ''}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative">
      {/* Action Buttons - Hidden when printing */}
      {showActions && (
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center print:hidden sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">Donation Receipt</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Receipt Content */}
      <div ref={receiptRef} className="bg-white max-w-4xl mx-auto font-sans text-sm shadow-lg border border-slate-200 print:shadow-none print:border-none">
        {/* Header with Church Branding */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 text-center print:p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6 shadow-lg print:shadow-none overflow-hidden">
              <img
                src={logoUrl}
                alt="Church Logo"
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.classList.remove('hidden');
                }}
              />
              <div className="hidden w-14 h-14 text-blue-600">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L10 4v6H6l-4 4v8h2v6h2v-6h8v6h2v-6h2v-8l-4-4h-4V4l-2-2z"/>
                  <path d="M12 8v8m-4-4h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white print:text-3xl">{church.name}</h1>
              <p className="text-blue-100 text-xl print:text-lg">Official Donation Receipt</p>
            </div>
          </div>
        </header>

        {/* Receipt Body */}
        <div className="p-8 relative print:p-6">
          {/* Receipt Number and Date */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">DONATION RECEIPT</h2>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                <p className="text-slate-700 mb-1">
                  <span className="font-semibold">Receipt #:</span> RCPT-{transaction.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-slate-700 mb-1">
                  <span className="font-semibold">Issued:</span> {formatDateTime(new Date().toISOString())}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Transaction Date:</span> {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            {/* QR Code for verification */}
            <div className="text-center">
              <div className="bg-white p-2 rounded-lg border-2 border-slate-300 shadow-sm">
                <QRCodeSVG
                  value={qrCodeData}
                  size={96}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Scan to verify</p>
            </div>
          </div>

          {/* Church Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
              <span className="text-2xl">⛪</span> Church Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-slate-700"><strong>Organization:</strong> {church.name}</p>
                <p className="text-slate-700"><strong>Address:</strong> {church.address}</p>
                <p className="text-slate-700"><strong>Phone:</strong> {church.phone}</p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-700"><strong>Email:</strong> {church.email}</p>
                <p className="text-slate-700"><strong>Website:</strong> {church.website}</p>
              </div>
            </div>
          </div>

        {/* Donor Information */}
        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <h3 className="font-bold text-green-800 mb-3 text-lg">Donor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-700"><strong>Donor Name:</strong> {transaction.donorName || 'Anonymous Donor'}</p>
              <p className="text-slate-700"><strong>Contact:</strong> {transaction.donorContact || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-green-700 text-xl font-bold">
                <strong>Donation Amount: {formatCurrency(transaction.amount)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h3 className="font-bold text-slate-800 mb-3 text-lg">Transaction Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-700 mb-2"><strong>Description:</strong></p>
              <p className="bg-white p-3 rounded border text-slate-800">{transaction.description}</p>
            </div>
            <div>
              <p className="text-slate-700 mb-2"><strong>Category:</strong></p>
              <p className="bg-white p-3 rounded border text-slate-800">{transaction.category}</p>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="border-t-2 border-slate-300 pt-8 mb-8">
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="border-b border-slate-400 w-48 h-12 mb-2"></div>
              <p className="text-sm text-slate-600">Donor Signature</p>
              <p className="text-xs text-slate-500">Date: _____________</p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 w-48 h-12 mb-2"></div>
              <p className="text-sm text-slate-600">Church Representative</p>
              <p className="text-xs text-slate-500">{church.pastorName}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-slate-200 pt-6 print:pt-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 mr-3 overflow-hidden rounded flex items-center justify-center">
              <img
                src={logoUrl}
                alt="Church Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full">
                <svg className="w-full h-full text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L10 4v6H6l-4 4v8h2v6h2v-6h8v6h2v-6h2v-8l-4-4h-4V4l-2-2z"/>
                  <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="text-left">
              <p className="text-slate-600 text-sm print:text-xs">
                <strong>Thank you for your generous contribution!</strong>
              </p>
              <p className="text-slate-500 text-xs print:text-xs">
                Your support helps us continue our mission to serve the community and spread God's love.
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-8 text-xs text-slate-500 mb-4">
            <div className="text-center">
              <p><strong>Need Help?</strong></p>
              <p>{church.phone}</p>
              <p>{church.email}</p>
            </div>
            <div className="text-center">
              <p><strong>Visit Us</strong></p>
              <p>{church.website}</p>
              <p>{church.address}</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
            <p>This is an official receipt for tax purposes. Retain for your records.</p>
            <p>Generated on {formatDateTime(new Date().toISOString())} • Transaction ID: {transaction.id}</p>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default DonorReceipt;
