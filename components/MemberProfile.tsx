import React from 'react';
import { Member, Transaction } from '../types';

interface MemberProfileProps {
  member: Member;
  transactions: Transaction[];
  onBack: () => void;
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ member, transactions, onBack, onEditMember }) => {
  // Get member's transactions (donations) - improved matching logic
  const memberTransactions = transactions.filter(t => {
    // Only consider income transactions for member donations
    if (t.type !== 'Income') return false;

    // Primary matching: exact donor name match (most reliable)
    if (t.donorName && t.donorName.toLowerCase().trim() === member.name.toLowerCase().trim()) {
      return true;
    }

    // Secondary matching: if donor contact exists, check if it matches member's email or phone
    if (t.donorContact && t.donorContact.trim()) {
      const contact = t.donorContact.toLowerCase().trim();

      // Check if contact matches member's email (if provided)
      if (member.email && contact === member.email.toLowerCase().trim()) {
        return true;
      }

      // Check if contact matches member's phone (if provided)
      if (member.phone && contact === member.phone.toLowerCase().trim()) {
        return true;
      }

      // Check if contact contains member's email or phone (partial match as fallback)
      if (member.email && contact.includes(member.email.toLowerCase().trim())) {
        return true;
      }

      if (member.phone && contact.includes(member.phone.toLowerCase().trim())) {
        return true;
      }
    }

    return false;
  });

  const totalDonations = memberTransactions.reduce((sum, t) => sum + t.amount, 0);
  const firstDonation = memberTransactions.length > 0 ?
    new Date(memberTransactions.reduce((earliest, t) => t.date < earliest.date ? t : earliest).date) : null;
  const lastDonation = memberTransactions.length > 0 ?
    new Date(memberTransactions.reduce((latest, t) => t.date > latest.date ? t : latest).date) : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Members
        </button>
        <button
          onClick={() => onEditMember(member.id, {})}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Profile
        </button>
      </div>

      <div className="flex items-start space-x-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {member.profilePicture ? (
            <img
              src={member.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-slate-300 flex items-center justify-center text-4xl text-slate-600">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Member Details */}
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
          {member.role && (
            <p className="text-lg text-slate-600 mb-4">{member.role}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <p className="text-sm text-slate-900">{member.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <p className="text-sm text-slate-900">{member.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <p className="text-sm text-slate-900">{member.address || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date Joined</label>
              <p className="text-sm text-slate-900">{new Date(member.dateJoined).toLocaleDateString()}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Emergency Contact</label>
              <p className="text-sm text-slate-900">{member.emergencyContact || 'Not provided'}</p>
            </div>
          </div>

          {/* Donation Summary */}
          {memberTransactions.length > 0 && (
            <div className="bg-slate-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Donation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Donations:</span>
                  <div className="text-green-600 font-semibold">${totalDonations.toFixed(2)}</div>
                </div>
                <div>
                  <span className="font-medium">Number of Donations:</span>
                  <div>{memberTransactions.length}</div>
                </div>
                <div>
                  <span className="font-medium">First Donation:</span>
                  <div>{firstDonation?.toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium">Last Donation:</span>
                  <div>{lastDonation?.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donation History */}
      {memberTransactions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
          <div className="bg-white border rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {memberTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10) // Show last 10 donations
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {transaction.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {transaction.category}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          {memberTransactions.length > 10 && (
            <p className="text-sm text-slate-500 mt-2">
              Showing 10 most recent donations. Total donations: {memberTransactions.length}
            </p>
          )}
        </div>
      )}

      {memberTransactions.length === 0 && (
        <div className="mt-8 bg-slate-50 p-6 rounded text-center">
          <p className="text-slate-600">No donation records found for this member.</p>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
