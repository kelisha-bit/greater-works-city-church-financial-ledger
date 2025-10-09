import React from 'react';
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
  };
  logoUrl?: string;
}

const DonorReceipt: React.FC<DonorReceiptProps> = ({
  transaction,
  churchInfo = {
    name: 'Greater Works City Church',
    address: '123 Faith Street, Heavenly City, HC 12345',
    phone: '(555) 123-4567',
    email: 'info@greaterworkschurch.org',
    website: 'www.greaterworkschurch.org',
    taxId: 'XX-XXXXXXX'
  },
  logoUrl = '/GWCC-logo.png'
}) => {
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

  // Debug: Test if logo is accessible
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => console.log('Logo is accessible at:', logoUrl);
    img.onerror = () => console.error('Logo not accessible at:', logoUrl);
    img.src = logoUrl;
  }, [logoUrl]);

  return (
    <div id="receipt-container" className="bg-white max-w-4xl mx-auto font-serif text-sm shadow-lg border border-slate-200 print:shadow-none print:border-none">
      {/* Header with Church Branding */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center print:p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6 shadow-lg print:shadow-none overflow-hidden">
            <img
              src={logoUrl}
              alt="Church Logo"
              className="w-full h-full object-contain"
              onLoad={() => console.log('Logo loaded successfully')}
              onError={(e) => {
                console.error('Logo failed to load:', e);
                // Fallback to SVG if image fails to load
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
            <h1 className="text-4xl font-bold text-white print:text-3xl">{churchInfo.name}</h1>
            <p className="text-blue-100 text-xl print:text-lg">Official Donation Receipt</p>
          </div>
        </div>
      </header>

      {/* Receipt Body */}
      <div className="p-8 relative print:p-6">
        {/* Small logo watermark in top right corner */}
        <div className="absolute top-2 right-2 opacity-5 pointer-events-none print:hidden">
          <img
            src={logoUrl}
            alt=""
            className="w-20 h-20 object-contain"
            onLoad={() => console.log('Watermark logo loaded successfully')}
            onError={(e) => {
              console.error('Watermark logo failed to load:', e);
              // Fallback to SVG if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.classList.remove('hidden');
            }}
          />
          <div className="hidden w-20 h-20 text-blue-600">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L10 4v6H6l-4 4v8h2v6h2v-6h8v6h2v-6h2v-8l-4-4h-4V4l-2-2z"/>
              <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Receipt Number and Date */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">DONATION RECEIPT</h2>
            <div className="bg-slate-100 p-4 rounded-lg">
              <p className="text-slate-600">
                <span className="font-semibold">Receipt Number:</span> RCPT-{transaction.id.slice(-8).toUpperCase()}
              </p>
              <p className="text-slate-600">
                <span className="font-semibold">Date Issued:</span> {formatDateTime(new Date().toISOString())}
              </p>
              <p className="text-slate-600">
                <span className="font-semibold">Transaction Date:</span> {formatDate(transaction.date)}
              </p>
            </div>
          </div>

          {/* QR Code placeholder for verification */}
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
              <div className="text-xs text-slate-500 text-center">
                <div className="w-8 h-8 bg-slate-400 rounded mb-1 mx-auto"></div>
                QR Code
              </div>
            </div>
            <p className="text-xs text-slate-500">Scan to verify</p>
          </div>
        </div>

        {/* Church Information */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="font-bold text-blue-800 mb-3 text-lg">Church Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-700"><strong>Organization:</strong> {churchInfo.name}</p>
              <p className="text-slate-700"><strong>Address:</strong> {churchInfo.address}</p>
              <p className="text-slate-700"><strong>Phone:</strong> {churchInfo.phone}</p>
            </div>
            <div>
              <p className="text-slate-700"><strong>Email:</strong> {churchInfo.email}</p>
              <p className="text-slate-700"><strong>Website:</strong> {churchInfo.website}</p>
              <p className="text-slate-700"><strong>Tax ID:</strong> {churchInfo.taxId}</p>
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

        {/* Tax Information */}
        <div className="bg-yellow-50 p-6 rounded-lg mb-8 border-l-4 border-yellow-400">
          <h3 className="font-bold text-yellow-800 mb-3 text-lg">Tax Information</h3>
          <div className="text-sm text-yellow-700">
            <p className="mb-2">
              <strong>Important:</strong> This donation may be tax-deductible. Please consult with your tax advisor for specific guidance regarding your individual situation.
            </p>
            <p className="mb-2">
              <strong>No goods or services</strong> were provided in exchange for this contribution, except for intangible religious benefits.
            </p>
            <p>
              <strong>Tax ID:</strong> {churchInfo.taxId} • <strong>Organization Type:</strong> 501(c)(3) Religious Organization
            </p>
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
              <p className="text-xs text-slate-500">Pastor John Smith</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-slate-200 pt-6 print:pt-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 mr-3 overflow-hidden rounded">
              <img
                src={logoUrl}
                alt="Church Logo"
                className="w-full h-full object-contain"
                onLoad={() => console.log('Footer logo loaded successfully')}
                onError={(e) => {
                  console.error('Footer logo failed to load:', e);
                  // Fallback to SVG if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.classList.remove('hidden');
                }}
              />
              <div className="hidden">
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
              <p>{churchInfo.phone}</p>
              <p>{churchInfo.email}</p>
            </div>
            <div className="text-center">
              <p><strong>Visit Us</strong></p>
              <p>{churchInfo.website}</p>
              <p>{churchInfo.address}</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
            <p>This is an official receipt for tax purposes. Retain for your records.</p>
            <p>Generated on {formatDateTime(new Date().toISOString())} • Transaction ID: {transaction.id}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DonorReceipt;
