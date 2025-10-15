import React, { useState, useRef } from 'react';
import { Member, Transaction } from '../types';
import Announcements from './Announcements';
import ResponsiveImage from './ResponsiveImage';

interface MemberProfileProps {
  member: Member;
  transactions: Transaction[];
  onBack: () => void;
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
}

// Helper component for info rows
const InfoRow: React.FC<{ label: string; value?: string; badge?: boolean; icon?: React.ReactNode; badgeColor?: string }> = ({ 
  label, 
  value, 
  badge, 
  icon,
  badgeColor
}) => {
  if (!value) return null;
  
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0" role="group" aria-labelledby={`label-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span 
        id={`label-${label.toLowerCase().replace(/\s+/g, '-')}`} 
        className="text-sm font-medium text-gray-600 flex items-center gap-2"
      >
        {icon && <span className="text-gray-400" aria-hidden="true">{icon}</span>}
        {label}:
      </span>
      {badge ? (
        <span 
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            badgeColor ? badgeColor :
            value === 'Active' ? 'bg-green-100 text-green-700' : 
            value === 'Inactive' ? 'bg-orange-100 text-orange-700' :
            value === 'New' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}
          role="status"
        >
          {value}
        </span>
      ) : (
        <span className="text-sm text-gray-900 text-right max-w-[60%]">{value}</span>
      )}
    </div>
  );
};

// Contact card component
const ContactCard: React.FC<{ icon: React.ReactNode; label: string; value?: string; action?: () => void; href?: string }> = ({
  icon,
  label,
  value,
  action,
  href
}) => {
  if (!value) return null;
  
  const CardContent = () => (
    <>
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-grow">
        <p className="text-xs text-gray-500" id={`contact-label-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate" aria-labelledby={`contact-label-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
      </div>
      {action && (
        <button 
          onClick={action}
          className="text-blue-600 hover:text-blue-800"
          aria-label={`View ${label} details: ${value}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow" role="group">
      {href ? (
        <a 
          href={href} 
          className="flex items-center gap-3 w-full"
          aria-label={`Contact via ${label}: ${value}`}
          role="link"
        >
          <CardContent />
        </a>
      ) : (
        <CardContent />
      )}
    </div>
  );
};

const MemberProfile: React.FC<MemberProfileProps> = ({ member, transactions, onBack, onEditMember }) => {
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview'|'donations'|'details'>('overview');
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle edit member
  const handleEdit = () => {
    onEditMember(member.id, {});
  };

  // Scroll to top of profile when changing tabs
  const changeTab = (tab: 'overview'|'donations'|'details') => {
    setActiveTab(tab);
    if (profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Calculate member status based on activity
  const getMemberStatus = () => {
    if (!lastDonation) return 'New';
    
    const daysSinceLastDonation = Math.floor((Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastDonation <= 90) return 'Active';
    if (daysSinceLastDonation <= 180) return 'Semi-Active';
    return 'Inactive';
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
    <div className="space-y-6" ref={profileRef}>
      {/* Header with Back and Edit Buttons */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors"
          aria-label="Back to members list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Members
        </button>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
            aria-label="Print member profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Print Profile</span>
          </button>
          <button
            onClick={handleEdit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            aria-label="Edit member information"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span className="hidden sm:inline">Edit Member</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {member.profilePicture ? (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <ResponsiveImage
                    src={member.profilePicture}
                    alt={`${member.name}'s profile picture`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl sm:text-5xl text-white font-bold shadow-lg border-4 border-white/30">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="mt-2 flex justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  getMemberStatus() === 'Active' ? 'bg-green-100 text-green-700' : 
                  getMemberStatus() === 'Inactive' ? 'bg-orange-100 text-orange-700' :
                  getMemberStatus() === 'New' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}
                role="status"
                aria-label={`Member status: ${getMemberStatus()}`}
                >
                  {getMemberStatus()}
                </span>
              </div>
            </div>

            {/* Member Header Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{member.name}</h1>
              {member.role && (
                <div className="inline-block bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 rounded-full text-sm sm:text-base text-white font-medium mb-3 sm:mb-4">
                  {member.role}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {member.email && (
                  <a 
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
                    aria-label={`Send email to ${member.name}`}
                  >
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm truncate">{member.email}</span>
                  </a>
                )}
                {member.phone && (
                  <a 
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
                    aria-label={`Call ${member.name}`}
                  >
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm">{member.phone}</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-white/90">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-xs sm:text-sm">Joined {new Date(member.dateJoined).toLocaleDateString()}</span>
                </div>
                {member.address && (
                  <div className="flex items-center gap-2 text-white/90 sm:col-span-2">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm truncate">{member.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-1 flex print:hidden" role="tablist" aria-label="Member profile sections">
        <button
          onClick={() => changeTab('overview')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'overview' 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          aria-selected={activeTab === 'overview'}
          role="tab"
          aria-controls="overview-tab"
          id="overview-tab-button"
          tabIndex={activeTab === 'overview' ? 0 : -1}
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Overview
          </span>
        </button>
        <button
          onClick={() => changeTab('donations')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'donations' 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          aria-selected={activeTab === 'donations'}
          role="tab"
          aria-controls="donations-tab"
          id="donations-tab-button"
          tabIndex={activeTab === 'donations' ? 0 : -1}
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Donations
          </span>
        </button>
        <button
          onClick={() => changeTab('details')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'details' 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          aria-selected={activeTab === 'details'}
          role="tab"
          aria-controls="details-tab"
          id="details-tab-button"
          tabIndex={activeTab === 'details' ? 0 : -1}
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Details
          </span>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        <div 
          id="overview-tab" 
          role="tabpanel" 
          aria-labelledby="overview-tab-button"
          className={activeTab === 'overview' ? 'block' : 'hidden'}
        >
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {member.email && (
              <ContactCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                } 
                label="Email" 
                value={member.email} 
                href={`mailto:${member.email}`}
              />
            )}
            {member.phone && (
              <ContactCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                } 
                label="Phone" 
                value={member.phone} 
                href={`tel:${member.phone}`}
              />
            )}
            {member.address && (
              <ContactCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                } 
                label="Address" 
                value={member.address} 
              />
            )}
          </div>
          
          {/* Stats Cards */}
          {memberTransactions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-l-4 border-green-500">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Donations</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">${totalDonations.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-l-4 border-blue-500">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Donations Count</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{memberTransactions.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-l-4 border-purple-500">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">First Donation</p>
                <p className="text-sm font-semibold text-gray-700">{firstDonation?.toLocaleDateString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-l-4 border-orange-500">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Donation</p>
                <p className="text-sm font-semibold text-gray-700">{lastDonation?.toLocaleDateString()}</p>
              </div>
            </div>
          )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 border-b pb-2 flex items-center">
            <span aria-hidden="true" className="mr-1">📋</span> 
            <span>Personal Information</span>
          </h3>
          <div className="space-y-2 sm:space-y-3">
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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 border-b pb-2 flex items-center">
            <span aria-hidden="true" className="mr-1">📞</span>
            <span>Contact Information</span>
          </h3>
          <div className="space-y-2 sm:space-y-3">
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
              <InfoRow label="Tithe/Envelope Number" value={member.titheNumber} />
              <InfoRow label="Giving ID" value={member.givingId} />
            </div>
            <div className="space-y-3">
              <InfoRow label="Prayer Requests" value={(member as any).prayerRequests} />
              <InfoRow label="Notes" value={(member as any).notes} />
            </div>
          </div>
        </div>
      </div>

      {/* Close Overview Tab */}
      </div>

      {/* Donation History */}
      {memberTransactions.length > 0 ? (
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
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium">No donation records found for this member.</p>
          <p className="text-sm text-gray-500 mt-1">Donations will appear here once recorded.</p>
        </div>
      )}
    </div>
    </div>
  );
};

export default MemberProfile;
