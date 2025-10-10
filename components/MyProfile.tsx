import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Member, Transaction } from '../types';
import MemberProfile from './MemberProfile';

interface MyProfileProps {
  members: Member[];
  transactions: Transaction[];
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
  onBack: () => void;
}

const MyProfile: React.FC<MyProfileProps> = ({ members, transactions, onEditMember, onBack }) => {
  const { user } = useAuth();
  const [myMember, setMyMember] = useState<Member | null>(null);

  useEffect(() => {
    if (user && user.email) {
      // Find member by matching email
      const member = members.find(m => m.email?.toLowerCase() === user.email?.toLowerCase());
      setMyMember(member || null);
    }
  }, [user, members]);

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Logged In</h2>
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  if (!myMember) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Member Profile Found</h2>
          <p className="text-gray-600 mb-4">
            Your email ({user.email}) is not linked to a member profile yet.
          </p>
          <p className="text-sm text-gray-500">
            Contact your church administrator to create a member profile for you.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📧 Your Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600">Email:</span>
              <span className="text-blue-900 font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">User ID:</span>
              <span className="text-blue-900 font-mono text-xs">{user.uid}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show the member profile
  return (
    <MemberProfile
      member={myMember}
      transactions={transactions}
      onBack={onBack}
      onEditMember={onEditMember}
    />
  );
};

export default MyProfile;
