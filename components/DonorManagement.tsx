import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { useDonorManagement, DonorProfile } from '../hooks/useDonorManagement';
import { formatCurrency, formatDate } from '../utils/formatters';
import DonorReceipt from './DonorReceipt';

interface DonorManagementProps {
  transactions: Transaction[];
}

const DonorManagement: React.FC<DonorManagementProps> = ({ transactions }) => {
  const { donorProfiles, analytics } = useDonorManagement(transactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter donors based on search
  const filteredDonors = donorProfiles.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DonorCard: React.FC<{ donor: DonorProfile }> = ({ donor }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
         onClick={() => {
           setSelectedDonor(donor);
           setShowDetails(true);
         }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{donor.name}</h3>
          {donor.contact && (
            <p className="text-sm text-slate-600">{donor.contact}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          donor.isRegular ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
        }`}>
          {donor.isRegular ? 'Regular' : 'One-time'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-600">Total Given</p>
          <p className="font-semibold text-green-600">{formatCurrency(donor.totalGiven)}</p>
        </div>
        <div>
          <p className="text-slate-600">Transactions</p>
          <p className="font-semibold text-slate-900">{donor.transactionCount}</p>
        </div>
        <div>
          <p className="text-slate-600">Average Gift</p>
          <p className="font-semibold text-slate-900">{formatCurrency(donor.averageGift)}</p>
        </div>
        <div>
          <p className="text-slate-600">Last Gift</p>
          <p className="font-semibold text-slate-700">{formatDate(donor.lastGiftDate)}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap gap-1">
          {donor.categories.slice(0, 3).map(category => (
            <span key={category} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {category}
            </span>
          ))}
          {donor.categories.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              +{donor.categories.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const DonorDetails: React.FC<{ donor: DonorProfile }> = ({ donor }) => {
    // Get all transactions for this donor
    const donorTransactions = transactions.filter(t =>
      t.type === TransactionType.INCOME &&
      (t.donorName || 'Anonymous') === donor.name
    );

    const handleGenerateReceipt = (transaction: Transaction) => {
      setSelectedTransaction(transaction);
      setShowReceipt(true);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{donor.name}</h3>
            {donor.contact && (
              <p className="text-slate-600 mt-1">{donor.contact}</p>
            )}
          </div>
          <button
            onClick={() => setShowDetails(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800">Giving Summary</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p>Total Given: <span className="font-bold text-green-600">{formatCurrency(donor.totalGiven)}</span></p>
              <p>Transactions: <span className="font-bold">{donor.transactionCount}</span></p>
              <p>Average Gift: <span className="font-bold">{formatCurrency(donor.averageGift)}</span></p>
              <p>Monthly Average: <span className="font-bold">{formatCurrency(donor.monthlyAverage)}</span></p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">Donor Status</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p>Type: <span className="font-bold">{donor.isRegular ? 'Regular Giver' : 'One-time Donor'}</span></p>
              <p>First Gift: <span className="font-bold">{formatDate(donor.firstGiftDate)}</span></p>
              <p>Last Gift: <span className="font-bold">{formatDate(donor.lastGiftDate)}</span></p>
              <p>Categories: <span className="font-bold">{donor.categories.length}</span></p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800">Actions</h4>
            <div className="mt-2 space-y-2">
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 text-sm">
                Send Thank You
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm">
                Generate Tax Receipt
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm">
                View Full History
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h4 className="font-semibold text-slate-900 mb-4">Recent Transactions</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Category</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Description</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">Amount</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-slate-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donorTransactions.slice(0, 10).map((transaction, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-sm text-slate-900">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{transaction.category}</td>
                    <td className="px-4 py-2 text-sm text-slate-900">{transaction.description}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleGenerateReceipt(transaction)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {donorTransactions.length > 10 && (
            <p className="text-sm text-slate-600 mt-2 text-center">
              Showing 10 of {donorTransactions.length} transactions
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Donor Management</h2>
            <p className="text-slate-600 mt-1">
              Track donor relationships, giving history, and stewardship opportunities
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Export Donor List
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Send Mass Email
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Donors</h3>
            <p className="text-2xl font-bold text-blue-600">{analytics.totalDonors}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Active Donors</h3>
            <p className="text-2xl font-bold text-green-600">{analytics.activeDonors}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">New This Month</h3>
            <p className="text-2xl font-bold text-purple-600">{analytics.newDonorsThisMonth}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Avg Gift Size</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(analytics.averageGiftSize)}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search donors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select className="border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option>All Donors</option>
            <option>Regular Givers</option>
            <option>One-time Donors</option>
            <option>Active This Year</option>
          </select>
        </div>
      </div>

      {/* Donor Cards Grid */}
      {showReceipt && selectedTransaction ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Donation Receipt</h3>
            <button
              onClick={() => {
                setShowReceipt(false);
                setSelectedTransaction(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DonorReceipt transaction={selectedTransaction} logoUrl="/GWCC-logo.png" />
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Print Receipt
            </button>
            <button
              onClick={() => {
                // PDF export functionality would go here
                alert('PDF export feature coming soon!');
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Download PDF
            </button>
          </div>
        </div>
      ) : showDetails && selectedDonor ? (
        <DonorDetails donor={selectedDonor} />
      ) : (
        <>
          {/* Donor Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor, index) => (
              <DonorCard key={index} donor={donor} />
            ))}
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-600">
                {searchTerm ? 'No donors found matching your search.' : 'No donor data available yet.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Donor Retention Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Donor Retention</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.donorRetention.retained}</div>
            <div className="text-sm text-slate-600">Retained Donors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{analytics.donorRetention.lapsed}</div>
            <div className="text-sm text-slate-600">Lapsed Donors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.donorRetention.new}</div>
            <div className="text-sm text-slate-600">New Donors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorManagement;
