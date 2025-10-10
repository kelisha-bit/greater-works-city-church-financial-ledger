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
    <div className="bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-blue-100 hover:text-white flex items-center transition-colors"
          >
            ← Back to Members
          </button>
          <button
            onClick={() => onEditMember(member.id, {})}
            className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 font-medium transition-colors"
            title="Edit member details"
          >
            Edit Profile
          </button>
        </div>

        <div className="flex items-center space-x-6 mt-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {member.profilePicture ? (
              <img
                src={member.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center text-2xl text-blue-600 font-bold shadow-lg ${member.profilePicture ? 'hidden' : ''}`}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h1 className="text-3xl font-bold">{member.name}</h1>
            {member.role && (
              <p className="text-xl text-blue-100 mt-1">{member.role}</p>
            )}
            {member.membershipStatus && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  member.membershipStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  member.membershipStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  member.membershipStatus === 'Inactive' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.membershipStatus}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Personal & Contact Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                  <p className="text-sm text-slate-900">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Gender</label>
                  <p className="text-sm text-slate-900">{member.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Marital Status</label>
                  <p className="text-sm text-slate-900">{member.maritalStatus || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Occupation</label>
                  <p className="text-sm text-slate-900">{member.occupation || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <p className="text-sm text-slate-900">{member.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <p className="text-sm text-slate-900">{member.phone || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Address</label>
                  <p className="text-sm text-slate-900">{member.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Church Information */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
                Church Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date Joined</label>
                  <p className="text-sm text-slate-900">{member.dateJoined ? new Date(member.dateJoined).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Baptism Date</label>
                  <p className="text-sm text-slate-900">{member.baptismDate ? new Date(member.baptismDate).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Small Group</label>
                  <p className="text-sm text-slate-900">{member.smallGroup || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Previous Church</label>
                  <p className="text-sm text-slate-900">{member.previousChurch || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Ministry & Volunteer Involvement */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
                Ministry & Volunteer Involvement
              </h3>

              {member.ministries && member.ministries.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ministries</label>
                  <div className="flex flex-wrap gap-2">
                    {member.ministries.map((ministry: string) => (
                      <span key={ministry} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {ministry}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.skills && member.skills.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Skills & Talents</label>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill: string) => (
                      <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(member.ministries && member.ministries.length > 0) || (member.skills && member.skills.length > 0) ? null : (
                <p className="text-sm text-slate-600">No ministry or volunteer involvement recorded.</p>
              )}
            </div>

            {/* Family & Emergency Contact */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
                Family & Emergency Contact
              </h3>

              {member.familyMembers?.spouse && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Spouse</label>
                  <p className="text-sm text-slate-900">{member.familyMembers.spouse}</p>
                </div>
              )}

              {member.familyMembers?.children && member.familyMembers.children.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Children</label>
                  <div className="space-y-1">
                    {member.familyMembers.children.map((child: any, index: number) => (
                      <p key={index} className="text-sm text-slate-900">
                        {child.name}{child.age ? ` (Age ${child.age})` : ''}{child.relationship ? ` - ${child.relationship}` : ''}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Emergency Contact Name</label>
                  <p className="text-sm text-slate-900">{member.emergencyContact?.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Relationship</label>
                  <p className="text-sm text-slate-900">{member.emergencyContact?.relationship || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Contact Phone</label>
                  <p className="text-sm text-slate-900">{member.emergencyContact?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Contact Email</label>
                  <p className="text-sm text-slate-900">{member.emergencyContact?.email || 'Not provided'}</p>
                </div>
              </div>

              {(!member.familyMembers?.spouse && (!member.familyMembers?.children || member.familyMembers.children.length === 0) && !member.emergencyContact?.name) && (
                <p className="text-sm text-slate-600 mt-4">No family or emergency contact information recorded.</p>
              )}
            </div>

            {/* Additional Information */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
                Additional Information
              </h3>

              {member.allergies && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allergies/Medical Notes</label>
                  <p className="text-sm text-slate-900 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">{member.allergies}</p>
                </div>
              )}

              {member.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <p className="text-sm text-slate-900 bg-blue-50 p-3 rounded border-l-4 border-blue-400">{member.notes}</p>
                </div>
              )}

              {(!member.allergies && !member.notes) && (
                <p className="text-sm text-slate-600">No additional information recorded.</p>
              )}
            </div>
          </div>

          {/* Right Column - Donation Summary */}
          <div className="lg:col-span-1">
            {memberTransactions.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center">
                  <span className="mr-2">💰</span>
                  Donation Summary
                </h3>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">${totalDonations.toFixed(2)}</div>
                    <div className="text-sm text-green-700">Total Donations</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="font-semibold text-slate-800">{memberTransactions.length}</div>
                      <div className="text-xs text-slate-600">Number of Donations</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="font-semibold text-slate-800">{firstDonation?.toLocaleDateString()}</div>
                      <div className="text-xs text-slate-600">First Donation</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="font-semibold text-slate-800">{lastDonation?.toLocaleDateString()}</div>
                      <div className="text-xs text-slate-600">Last Donation</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {memberTransactions.length === 0 && (
              <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <h3 className="font-semibold text-slate-700 mb-2">No Donations Yet</h3>
                  <p className="text-sm text-slate-600">Donation records will appear here when this member makes contributions.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Donation History Table */}
        {memberTransactions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">Recent Donations</h3>
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {memberTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {transaction.category}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            {memberTransactions.length > 10 && (
              <p className="text-sm text-slate-500 mt-3">
                Showing 10 most recent donations. Total donations: {memberTransactions.length}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
