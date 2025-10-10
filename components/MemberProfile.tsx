import React from 'react';
import { Member, Transaction } from '../types';

interface MemberProfileProps {
  member: Member;
  transactions: Transaction[];
  onBack: () => void;
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
}

// Helper component for info rows
const InfoRow: React.FC<{ label: string; value?: string; badge?: boolean }> = ({ label, value, badge }) => {
  if (!value) return null;
  
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      {badge ? (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {value}
        </span>
      ) : (
        <span className="text-sm text-gray-900 text-right max-w-[60%]">{value}</span>
      )}
    </div>
  );
};

const MemberProfile: React.FC<MemberProfileProps> = ({ member, transactions, onBack, onEditMember }) => {
  // Print functionality
  const handlePrint = () => {
    window.print();
  };

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
  const firstDonation = memberTransactions.length > 0
    ? new Date(
        memberTransactions.reduce((earliest, t) =>
          new Date(t.date).getTime() < new Date(earliest.date).getTime() ? t : earliest
        ).date
      )
    : null;
  const lastDonation = memberTransactions.length > 0
    ? new Date(
        memberTransactions.reduce((latest, t) =>
          new Date(t.date).getTime() > new Date(latest.date).getTime() ? t : latest
        ).date
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors"
        >
          <span className="text-xl">←</span> Back to Members
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Print Profile
          </button>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            Edit Member
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {member.profilePicture ? (
                <img
                  src={member.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl text-white font-bold shadow-lg border-4 border-white/30">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Member Header Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{member.name}</h1>
              {member.role && (
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white font-medium mb-4">
                  {member.role}
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                {member.email && (
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-lg">✉</span>
                    <span className="text-sm">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-lg">📞</span>
                    <span className="text-sm">{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/90">
                  <span className="text-lg">📅</span>
                  <span className="text-sm">Joined {new Date(member.dateJoined).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {memberTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Donations</p>
            <p className="text-2xl font-bold text-green-600">${totalDonations.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Donations Count</p>
            <p className="text-2xl font-bold text-blue-600">{memberTransactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">First Donation</p>
            <p className="text-sm font-semibold text-gray-700">{firstDonation?.toLocaleDateString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-orange-500">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Donation</p>
            <p className="text-sm font-semibold text-gray-700">{lastDonation?.toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">📋 Personal Information</h3>
          <div className="space-y-3">
            <InfoRow label="Gender" value={(member as any).gender} />
            <InfoRow label="Birthday" value={(member as any).birthday ? new Date((member as any).birthday).toLocaleDateString() : undefined} />
            <InfoRow label="Marital Status" value={(member as any).maritalStatus} />
            <InfoRow label="ID Type" value={(member as any).idType} />
            <InfoRow label="ID Number" value={(member as any).idNumber} />
            <InfoRow label="Occupation" value={(member as any).occupation} />
            <InfoRow label="Employer" value={(member as any).employer} />
            <InfoRow label="Education" value={(member as any).educationLevel} />
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">📞 Contact Information</h3>
          <div className="space-y-3">
            <InfoRow label="Address" value={member.address} />
            {(member as any).address2 && <InfoRow label="Address Line 2" value={(member as any).address2} />}
            <InfoRow label="City" value={(member as any).city} />
            <InfoRow label="Region" value={(member as any).region} />
            <InfoRow label="Postal Code" value={(member as any).postalCode} />
            <InfoRow label="Country" value={(member as any).country} />
            <InfoRow label="Landmark" value={(member as any).landmark} />
            <InfoRow label="WhatsApp" value={(member as any).whatsappNumber} />
            <InfoRow label="Preferred Contact" value={(member as any).preferredContactMethod} />
          </div>
        </div>

        {/* Church Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">⛪ Church Information</h3>
          <div className="space-y-3">
            <InfoRow label="Membership Status" value={(member as any).membershipStatus} badge />
            <InfoRow label="Join Date" value={(member as any).joinDate ? new Date((member as any).joinDate).toLocaleDateString() : undefined} />
            <InfoRow label="Baptism Date" value={(member as any).baptismDate ? new Date((member as any).baptismDate).toLocaleDateString() : undefined} />
            <InfoRow label="Confirmation Date" value={(member as any).confirmationDate ? new Date((member as any).confirmationDate).toLocaleDateString() : undefined} />
            <InfoRow label="Communion Date" value={(member as any).communionDate ? new Date((member as any).communionDate).toLocaleDateString() : undefined} />
            <InfoRow label="Previous Church" value={(member as any).previousChurch} />
            <InfoRow label="Membership Class" value={(member as any).membershipClassCompleted ? 'Completed' : 'Not Completed'} />
            <InfoRow label="Spiritual Gifts" value={Array.isArray((member as any).spiritualGifts) && (member as any).spiritualGifts.length ? (member as any).spiritualGifts.join(', ') : undefined} />
          </div>
        </div>

        {/* Family Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">👨‍👩‍👧‍👦 Family Information</h3>
          <div className="space-y-3">
            <InfoRow label="Household Name" value={(member as any).householdName} />
            <InfoRow label="Spouse Name" value={(member as any).spouseName} />
            <InfoRow label="Number of Children" value={(member as any).numberOfChildren?.toString()} />
            <InfoRow label="Children" value={Array.isArray((member as any).childrenNamesAges) && (member as any).childrenNamesAges.length ? (member as any).childrenNamesAges.join(', ') : undefined} />
            <InfoRow label="Family Links" value={Array.isArray((member as any).familyLinks) && (member as any).familyLinks.length ? (member as any).familyLinks.join(', ') : undefined} />
          </div>
        </div>

        {/* Ministry & Service Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🙏 Ministry & Service</h3>
          <div className="space-y-3">
            <InfoRow label="Ministries" value={Array.isArray((member as any).ministries) && (member as any).ministries.length ? (member as any).ministries.join(', ') : undefined} />
            <InfoRow label="Departments" value={Array.isArray((member as any).departments) && (member as any).departments.length ? (member as any).departments.join(', ') : undefined} />
            <InfoRow label="Service Team Role" value={(member as any).serviceTeamRole} />
          </div>
        </div>

        {/* Emergency & Health Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🚨 Emergency & Health</h3>
          <div className="space-y-3">
            <InfoRow label="Emergency Contact" value={member.emergencyContact} />
            <InfoRow label="Contact Name" value={(member as any).emergencyContactName} />
            <InfoRow label="Relationship" value={(member as any).emergencyContactRelationship} />
            <InfoRow label="Contact Phone" value={(member as any).emergencyContactPhone} />
            <InfoRow label="Medical Conditions" value={(member as any).medicalConditions} />
            <InfoRow label="Accessibility Needs" value={(member as any).accessibilityNeeds} />
          </div>
        </div>

        {/* Stewardship & Other Card */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">💰 Stewardship & Other</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <InfoRow label="Tithe/Envelope Number" value={(member as any).titheNumber} />
              <InfoRow label="Giving ID" value={(member as any).givingId} />
            </div>
            <div className="space-y-3">
              <InfoRow label="Prayer Requests" value={(member as any).prayerRequests} />
              <InfoRow label="Notes" value={(member as any).notes} />
            </div>
          </div>
        </div>
      </div>

      {/* Donation History */}
      {memberTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">💝 Recent Donations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {memberTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-bold">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {transaction.category}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {memberTransactions.length > 10 && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Showing 10 most recent donations out of {memberTransactions.length} total
            </p>
          )}
        </div>
      )}

      {memberTransactions.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium">No donation records found for this member.</p>
          <p className="text-sm text-gray-500 mt-1">Donations will appear here once recorded.</p>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
