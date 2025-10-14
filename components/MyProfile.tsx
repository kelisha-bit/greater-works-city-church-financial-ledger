import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Member, Transaction } from '../types';
import MemberProfile from './MemberProfile';
import { updateDoc, doc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { memberSchema, validateForm } from '../validation';
import { findMemberByEmail, normalizeEmail, suggestMemberMatches } from '../utils/memberUtils';
import { sendVerificationEmail, sendPasswordReset, isEmailVerified, refreshUserStatus } from '../utils/emailUtils';

interface ActivityLog {
  id: string;
  type: 'profile_view' | 'profile_update' | 'password_reset' | 'email_verification_sent' | 'profile_created';
  timestamp: Date;
  details?: string;
}

interface MyProfileProps {
  members: Member[];
  transactions: Transaction[];
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
  onBack: () => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  onAddMember?: (member: Omit<Member, 'id'>) => Promise<void>;
}

const MyProfile: React.FC<MyProfileProps> = ({ 
  members, 
  transactions, 
  onEditMember, 
  onBack, 
  onUpdateMember,
  onAddMember 
}) => {
  const { user, logout } = useAuth();
  const [myMember, setMyMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableMember, setEditableMember] = useState<Partial<Member>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileData, setNewProfileData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<Member[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadMemberAndActivity = async () => {
      if (user && user.email) {
        // Refresh user to get latest verification status
        if (user) {
          try {
            await refreshUserStatus(user);
          } catch (error) {
            console.error('Error refreshing user status:', error);
          }
        }
        
        // Use enhanced email matching function
        const member = findMemberByEmail(members, user.email);
        setMyMember(member || null);
        
        if (member) {
          setEditableMember({ ...member });
          await logActivity(member.id, 'profile_view');
          calculateProfileCompletion(member);
          await loadActivityLogs(member.id);
        } else {
          // If no exact match found, suggest potential matches
          const suggestions = suggestMemberMatches(members, user.email);
          setSuggestedMatches(suggestions);
          if (suggestions.length > 0) {
            setShowSuggestions(true);
            console.log('Potential profile matches found:', suggestions);
          }
        }
      }
    };
    loadMemberAndActivity();
  }, [user, members]);

  const calculateProfileCompletion = (member: Member) => {
    let completedFields = 0;
    const requiredFields: (keyof Member)[] = [
      'name', 'email', 'phone', 'address', 'birthday', 'maritalStatus'
    ];
    
    requiredFields.forEach(field => {
      if (member[field]) completedFields++;
    });
    
    setProfileCompletion(Math.round((completedFields / requiredFields.length) * 100));
  };

  const logActivity = async (memberId: string, type: ActivityLog['type'], details: string = 'No details provided') => {
    try {
      const logRef = await addDoc(collection(db, 'members', memberId, 'activityLogs'), {
        type,
        timestamp: serverTimestamp(),
        details
      });
      setActivityLogs(prev => [...prev, { id: logRef.id, type, timestamp: new Date(), details }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const loadActivityLogs = async (memberId: string) => {
    try {
      // In a real app, you would fetch logs from Firestore
      // For now, we'll just show recent client-side logs
      setActivityLogs(prev => [...prev]);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!myMember || !editableMember) return;
    
    // Validate the form data
    const validation = validateForm(memberSchema, editableMember);
    
    if (!validation.success) {
      setValidationErrors(validation.errors);
      
      // Scroll to the first error field
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateMember(myMember.id, validation.data);
      await logActivity(myMember.id, 'profile_update', 'Updated profile information');
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      setMyMember({ ...myMember, ...validation.data });
      calculateProfileCompletion({ ...myMember, ...validation.data } as Member);
      
      // Use a more user-friendly notification instead of alert
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50';
      successMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p>Profile updated successfully!</p>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Remove the notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Show a more detailed error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
      errorMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <p>Failed to update profile. Please try again.</p>
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      // Remove the notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    const result = await sendPasswordReset(user.email);
    
    if (result.success) {
      if (myMember) {
        await logActivity(myMember.id, 'password_reset');
      }
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user) return;
    
    try {
      const result = await sendVerificationEmail(user);
      
      if (myMember) {
        await logActivity(myMember.id, 'email_verification_sent');
      }
      
      alert(result.message);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again or contact support.');
    }
  };

  const handleCreateProfile = async () => {
    if (!user?.email || !newProfileData.name.trim()) {
      alert('Please fill in your name to create a profile.');
      return;
    }

    try {
      setIsCreatingProfile(true);
      
      // Use normalized email for consistent storage
      const normalizedEmail = normalizeEmail(user.email);
      
      const newMember: Omit<Member, 'id'> = {
        name: newProfileData.name.trim(),
        email: normalizedEmail,
        phone: newProfileData.phone.trim(),
        address: newProfileData.address.trim(),
        dateJoined: new Date().toISOString().split('T')[0],
        membershipStatus: 'Active',
        role: 'Member'
      };

      if (onAddMember) {
        await onAddMember(newMember);
        alert('Profile created successfully! Please refresh the page to see your profile.');
        setShowCreateForm(false);
        setNewProfileData({ name: '', phone: '', address: '' });
        setShowSuggestions(false);
        setSuggestedMatches([]);
      } else {
        alert('Profile creation is not available. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again or contact your administrator.');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle different input types appropriately
    let processedValue = value;
    
    // For checkbox inputs, use the checked property
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked.toString();
    }
    
    // For date inputs, ensure proper format
    if (type === 'date' && value) {
      try {
        // Ensure date is in YYYY-MM-DD format
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          processedValue = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }
    
    // For number inputs, convert to number if needed
    if (type === 'number' && value) {
      processedValue = value; // Keep as string for the form, convert when needed
    }
    
    // Format phone numbers as user types (US format)
    if (type === 'tel' && name === 'phone' && value) {
      let digits = value.replace(/\D/g, '');
      if (digits.length > 0) {
        digits = digits.slice(0, 10); // Limit to 10 digits
        // Format as (XXX) XXX-XXXX
        if (digits.length > 3 && digits.length <= 6) {
          processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else if (digits.length > 6) {
          processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
      }
    }
    
    setEditableMember(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Perform real-time validation for important fields
    if (['email', 'phone', 'name', 'address', 'birthday', 'maritalStatus'].includes(name)) {
      const fieldValidation = validateForm(
        { [name]: memberSchema[name as keyof typeof memberSchema] }, 
        { [name]: processedValue }
      );
      
      if (!fieldValidation.success) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: fieldValidation.errors[name] || `Invalid ${name}`
        }));
      }
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel? All changes will be lost.'
      );
      if (!confirmCancel) return;
    }
    
    setIsEditing(false);
    setEditableMember(myMember);
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  const handleClaimProfile = async (member: Member) => {
    if (!user?.email) return;
    
    const confirmClaim = window.confirm(
      `Are you sure you want to claim the profile for "${member.name}"? This will update their email to ${user.email}.`
    );
    
    if (!confirmClaim) return;
    
    try {
      const normalizedEmail = normalizeEmail(user.email);
      await onUpdateMember(member.id, { email: normalizedEmail });
      setMyMember({ ...member, email: normalizedEmail });
      setShowSuggestions(false);
      setSuggestedMatches([]);
      alert('Profile claimed successfully!');
    } catch (error) {
      console.error('Error claiming profile:', error);
      alert('Failed to claim profile. Please try again.');
    }
  };

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
    setSuggestedMatches([]);
  };

  // Show loading state
  if (!user) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Logged In</h2>
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }
  
  // Show email verification status if user is logged in but email not verified
  if (user && !user.emailVerified) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verification Required</h2>
          <p className="text-gray-600 mb-4">Please verify your email address to access all features.</p>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                A verification email was sent to <span className="font-medium">{user.email}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleVerifyEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Resend Verification Email
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!myMember) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Not Linked to Profile</h2>
          <p className="text-gray-600 mb-6">
            Your email ({user.email}) is not linked to a member profile yet.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-800 text-lg mb-3">📧 Your Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="text-blue-600 font-medium">Email:</span>
                <span className="text-blue-900 bg-white px-3 py-1 rounded">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-blue-600 font-medium">Account Status:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-blue-600 font-medium">User ID:</span>
                <span className="text-blue-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {user.uid.substring(0, 8)}...
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {!user.emailVerified && (
                <button
                  onClick={handleVerifyEmail}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 1.846a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 10-1.11-1.664L10 11.798l-4.445-2.963z" clipRule="evenodd" />
                  </svg>
                  Verify Email Address
                </button>
              )}
              
              <button
                onClick={handlePasswordReset}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Reset Password
              </button>
            </div>
          </div>

          {/* Suggested Matches Section */}
          {showSuggestions && suggestedMatches.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-yellow-800 text-lg">🔍 Potential Profile Matches</h3>
                <button
                  onClick={handleDismissSuggestions}
                  className="text-yellow-600 hover:text-yellow-800 text-sm"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                We found some profiles that might be yours based on name similarity. Click "Claim Profile" if one of these is you.
              </p>
              <div className="space-y-3">
                {suggestedMatches.map((member) => (
                  <div key={member.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">
                          {member.email ? `Email: ${member.email}` : 'No email on file'}
                        </p>
                        {member.phone && (
                          <p className="text-sm text-gray-600">Phone: {member.phone}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleClaimProfile(member)}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Claim Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solutions Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-green-800 text-lg mb-3">✅ How to Resolve This</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-medium text-green-800">Contact Your Administrator</p>
                  <p className="text-sm text-green-700">Ask them to create a member profile with your email: <span className="font-mono bg-white px-2 py-1 rounded">{user.email}</span></p>
                </div>
              </div>
              
              {onAddMember && (
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-green-800">Create Basic Profile (Self-Service)</p>
                    <p className="text-sm text-green-700 mb-2">Create a basic profile now and complete it later</p>
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      {showCreateForm ? 'Cancel' : 'Create Profile'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-medium text-green-800">Check Email Match</p>
                  <p className="text-sm text-green-700">Ensure your login email exactly matches the email in your member record</p>
                </div>
              </div>
            </div>
          </div>

          {/* Self-Service Profile Creation Form */}
          {showCreateForm && onAddMember && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 text-lg mb-4">Create Your Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newProfileData.name}
                    onChange={(e) => setNewProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newProfileData.phone}
                    onChange={(e) => setNewProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={newProfileData.address}
                    onChange={(e) => setNewProfileData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your address"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateProfile}
                    disabled={isCreatingProfile || !newProfileData.name.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingProfile ? 'Creating...' : 'Create Profile'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Need Help?</strong> Contact your church administrator with your email address: 
                  <span className="font-mono font-medium ml-1">{user.email}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => logout()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show the member profile with enhanced features
  return (
    <div className="space-y-6">
      {/* Profile Header with Completion Status */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <p className="text-sm text-gray-500">Manage your personal information and account settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Profile Completion</p>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className={`h-2.5 rounded-full ${profileCompletion < 50 ? 'bg-red-500' : profileCompletion < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{profileCompletion}%</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Status Bar */}
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800">
                {user.emailVerified ? (
                  <span className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Email Verified
                  </span>
                ) : (
                  <button 
                    onClick={handleVerifyEmail}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Verify Your Email
                  </button>
                )}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePasswordReset}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Change Password
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => logout()}
                className="text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Profile Content */}
        <div className="px-6 py-4">
          {isEditing ? (
            <div className="space-y-6">
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {Object.entries(validationErrors).map(([field, error]) => (
                            <li key={field}>
                              <button 
                                onClick={() => {
                                  const element = document.getElementById(field);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    element.focus();
                                  }
                                }}
                                className="text-red-700 underline hover:text-red-900"
                              >
                                {error}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={editableMember.name || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={editableMember.email || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center">
                    Phone Number <span className="text-red-500 ml-1">*</span>
                    <span className="ml-1 text-xs text-gray-500">(Required)</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={editableMember.phone || ''}
                      onChange={handleInputChange}
                      placeholder="(123) 456-7890"
                      className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        validationErrors.phone ? 'border-red-300 pr-10 text-red-900 placeholder-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.phone && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    id="birthday"
                    value={editableMember.birthday || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                    Marital Status *
                  </label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={editableMember.maritalStatus || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={editableMember.address || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={isSaving || Object.keys(validationErrors).length > 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={Object.keys(validationErrors).length > 0 ? "Please fix validation errors before saving" : ""}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <MemberProfile
              member={myMember}
              transactions={transactions}
              onBack={onBack}
              onEditMember={onEditMember}
            />
          )}
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="bg-white overflow-hidden">
          {activityLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activityLogs.slice(0, 5).map((log) => (
                <li key={log.id} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {log.type === 'profile_view' && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {log.type === 'profile_update' && (
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </div>
                      )}
                      {(log.type === 'password_reset' || log.type === 'email_verification_sent') && (
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {log.type === 'profile_view' && 'Profile viewed'}
                        {log.type === 'profile_update' && 'Profile updated'}
                        {log.type === 'password_reset' && 'Password reset email sent'}
                        {log.type === 'email_verification_sent' && 'Verification email sent'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.details && <span className="mr-2">{log.details}</span>}
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">Your recent activities will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
