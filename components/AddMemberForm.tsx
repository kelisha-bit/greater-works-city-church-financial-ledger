import React, { useState } from 'react';
import { Member } from '../types';

interface AddMemberFormProps {
  onAddMember: (member: Omit<Member, 'id' | 'dateJoined'> & { dateJoined: string }) => Promise<void>;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ onAddMember }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateJoined: new Date().toISOString().split('T')[0], // yyyy-mm-dd
    role: '',
    emergencyContact: '',
    profilePicture: '',
    // New fields
    birthday: '',
    maritalStatus: '',
    householdName: '',
    familyLinks: '', // csv
    membershipStatus: '',
    baptismDate: '',
    joinDate: '',
    ministries: '', // csv
    departments: '', // csv
    notes: '',
    address2: '',
    city: '',
    region: '',
    postalCode: '',
    // Personal additions
    gender: '',
    idType: '',
    idNumber: '',
    occupation: '',
    employer: '',
    educationLevel: '',
    // Family additions
    spouseName: '',
    numberOfChildren: '', // keep as string in form, convert to number on submit
    childrenNamesAges: '', // csv
    // Church additions
    previousChurch: '',
    membershipClassCompleted: false,
    membershipClassDate: '',
    spiritualGifts: '', // csv
    confirmationDate: '',
    communionDate: '',
    // Ministry/Groups
    serviceTeamRole: '',
    // Contact & Consent
    preferredContactMethod: '',
    whatsappNumber: '',
    optInEmail: false,
    optInSMS: false,
    optInWhatsApp: false,
    mediaConsent: false,
    // Address extras
    country: '',
    landmark: '',
    // Emergency/Health
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    accessibilityNeeds: '',
    // Stewardship
    titheNumber: '',
    givingId: '',
    // Other
    prayerRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData({ ...formData, profilePicture: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toArray = (csv: string): string[] => csv.split(',').map(s => s.trim()).filter(Boolean);
    const payload: Omit<Member, 'id' | 'dateJoined'> & { dateJoined: string } = {
      // required and basic
      name: formData.name,
      dateJoined: formData.dateJoined,
      // simple maps
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      role: formData.role || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      profilePicture: formData.profilePicture || undefined,
      birthday: formData.birthday || undefined,
      maritalStatus: (formData.maritalStatus as Member['maritalStatus']) || undefined,
      householdName: formData.householdName || undefined,
      familyLinks: formData.familyLinks ? toArray(formData.familyLinks) : undefined,
      membershipStatus: (formData.membershipStatus as Member['membershipStatus']) || undefined,
      baptismDate: formData.baptismDate || undefined,
      joinDate: formData.joinDate || undefined,
      ministries: formData.ministries ? toArray(formData.ministries) : undefined,
      departments: formData.departments ? toArray(formData.departments) : undefined,
      notes: formData.notes || undefined,
      address2: formData.address2 || undefined,
      city: formData.city || undefined,
      region: formData.region || undefined,
      postalCode: formData.postalCode || undefined,
      // new fields
      gender: (formData.gender as Member['gender']) || undefined,
      idType: formData.idType || undefined,
      idNumber: formData.idNumber || undefined,
      occupation: formData.occupation || undefined,
      employer: formData.employer || undefined,
      educationLevel: formData.educationLevel || undefined,
      spouseName: formData.spouseName || undefined,
      numberOfChildren: formData.numberOfChildren ? parseInt(formData.numberOfChildren, 10) : undefined,
      childrenNamesAges: formData.childrenNamesAges ? toArray(formData.childrenNamesAges) : undefined,
      previousChurch: formData.previousChurch || undefined,
      membershipClassCompleted: formData.membershipClassCompleted || undefined,
      membershipClassDate: formData.membershipClassDate || undefined,
      spiritualGifts: formData.spiritualGifts ? toArray(formData.spiritualGifts) : undefined,
      confirmationDate: formData.confirmationDate || undefined,
      communionDate: formData.communionDate || undefined,
      serviceTeamRole: formData.serviceTeamRole || undefined,
      preferredContactMethod: (formData.preferredContactMethod as Member['preferredContactMethod']) || undefined,
      whatsappNumber: formData.whatsappNumber || undefined,
      optInEmail: formData.optInEmail || undefined,
      optInSMS: formData.optInSMS || undefined,
      optInWhatsApp: formData.optInWhatsApp || undefined,
      mediaConsent: formData.mediaConsent || undefined,
      country: formData.country || undefined,
      landmark: formData.landmark || undefined,
      emergencyContactName: formData.emergencyContactName || undefined,
      emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
      emergencyContactPhone: formData.emergencyContactPhone || undefined,
      medicalConditions: formData.medicalConditions || undefined,
      accessibilityNeeds: formData.accessibilityNeeds || undefined,
      titheNumber: formData.titheNumber || undefined,
      givingId: formData.givingId || undefined,
      prayerRequests: formData.prayerRequests || undefined,
    };

    await onAddMember(payload);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateJoined: new Date().toISOString().split('T')[0],
      role: '',
      emergencyContact: '',
      profilePicture: '',
      birthday: '',
      maritalStatus: '',
      householdName: '',
      familyLinks: '',
      membershipStatus: '',
      baptismDate: '',
      joinDate: '',
      ministries: '',
      departments: '',
      notes: '',
      address2: '',
      city: '',
      region: '',
      postalCode: '',
      gender: '',
      idType: '',
      idNumber: '',
      occupation: '',
      employer: '',
      educationLevel: '',
      spouseName: '',
      numberOfChildren: '',
      childrenNamesAges: '',
      previousChurch: '',
      membershipClassCompleted: false,
      membershipClassDate: '',
      spiritualGifts: '',
      confirmationDate: '',
      communionDate: '',
      serviceTeamRole: '',
      preferredContactMethod: '',
      whatsappNumber: '',
      optInEmail: false,
      optInSMS: false,
      optInWhatsApp: false,
      mediaConsent: false,
      country: '',
      landmark: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      medicalConditions: '',
      accessibilityNeeds: '',
      titheNumber: '',
      givingId: '',
      prayerRequests: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
      <h3 className="text-base font-bold mb-3 sticky top-0 bg-white z-10 pb-2 border-b">Add New Member</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* BASIC INFORMATION */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">BASIC INFORMATION</h4>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full p-1.5 text-sm border rounded" />
          <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" className="w-full p-1.5 text-sm border rounded" />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-1.5 text-sm border rounded" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address Line 1" className="w-full p-1.5 text-sm border rounded" />
          <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address Line 2" className="w-full p-1.5 text-sm border rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full p-1.5 text-sm border rounded" />
            <input name="region" value={formData.region} onChange={handleChange} placeholder="Region" className="w-full p-1.5 text-sm border rounded" />
            <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" className="w-full p-1.5 text-sm border rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full p-1.5 text-sm border rounded" />
            <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" className="w-full p-1.5 text-sm border rounded" />
          </div>
          <input name="dateJoined" value={formData.dateJoined} onChange={handleChange} type="date" required className="w-full p-1.5 text-sm border rounded" />
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-1.5 text-sm border rounded">
            <option value="">Select Role</option>
            <option value="Member">Member</option>
            <option value="Elder">Elder</option>
            <option value="Pastor">Pastor</option>
            <option value="Deacon">Deacon</option>
          </select>
          
          {/* PERSONAL INFORMATION */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">PERSONAL INFORMATION</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-1.5 text-sm border rounded">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">ID Type</label>
              <input name="idType" value={formData.idType} onChange={handleChange} placeholder="Ghana Card" className="w-full p-1.5 text-sm border rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">ID Number</label>
              <input name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="GHA-XXX-XXX" className="w-full p-1.5 text-sm border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Occupation</label>
              <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" className="w-full p-1.5 text-sm border rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Employer</label>
              <input name="employer" value={formData.employer} onChange={handleChange} placeholder="Employer" className="w-full p-1.5 text-sm border rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Education</label>
              <input name="educationLevel" value={formData.educationLevel} onChange={handleChange} placeholder="Education Level" className="w-full p-1.5 text-sm border rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Birthday</label>
              <input name="birthday" value={formData.birthday} onChange={handleChange} type="date" className="w-full p-1.5 text-sm border rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full p-1.5 text-sm border rounded">
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
          
          {/* FAMILY INFORMATION */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">FAMILY INFORMATION</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input name="spouseName" value={formData.spouseName} onChange={handleChange} placeholder="Spouse Name" className="w-full p-1.5 text-sm border rounded" />
            <input name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange} placeholder="No. of Children" className="w-full p-1.5 text-sm border rounded" />
            <input name="childrenNamesAges" value={formData.childrenNamesAges} onChange={handleChange} placeholder="Children (John 10, Mary 7)" className="w-full p-1.5 text-sm border rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Membership Status</label>
              <select name="membershipStatus" value={formData.membershipStatus} onChange={handleChange} className="w-full p-1.5 text-sm border rounded">
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Join Date</label>
              <input name="joinDate" value={formData.joinDate} onChange={handleChange} type="date" className="w-full p-1.5 text-sm border rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Baptism Date</label>
            <input name="baptismDate" value={formData.baptismDate} onChange={handleChange} type="date" className="w-full p-1.5 text-sm border rounded" />
          </div>
          
          {/* CHURCH INFORMATION */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">CHURCH INFORMATION</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input name="previousChurch" value={formData.previousChurch} onChange={handleChange} placeholder="Previous Church" className="w-full p-1.5 text-sm border rounded" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Membership Class</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="membershipClassCompleted" checked={formData.membershipClassCompleted} onChange={handleCheckboxChange} className="h-4 w-4" />
                <input name="membershipClassDate" value={formData.membershipClassDate} onChange={handleChange} type="date" className="w-full p-1.5 text-sm border rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Confirmation</label>
              <input name="confirmationDate" value={formData.confirmationDate} onChange={handleChange} type="date" className="w-full p-1.5 text-sm border rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Communion</label>
              <input name="communionDate" value={formData.communionDate} onChange={handleChange} type="date" className="w-full p-1.5 text-sm border rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Spiritual Gifts</label>
              <input name="spiritualGifts" value={formData.spiritualGifts} onChange={handleChange} placeholder="Comma-separated" className="w-full p-1.5 text-sm border rounded" />
            </div>
          </div>
          <input name="householdName" value={formData.householdName} onChange={handleChange} placeholder="Household/Family Name" className="w-full p-1.5 text-sm border rounded" />
          <input name="familyLinks" value={formData.familyLinks} onChange={handleChange} placeholder="Family Links (comma-separated)" className="w-full p-1.5 text-sm border rounded" />
          <input name="ministries" value={formData.ministries} onChange={handleChange} placeholder="Ministries (comma-separated)" className="w-full p-1.5 text-sm border rounded" />
          <input name="departments" value={formData.departments} onChange={handleChange} placeholder="Departments (Usher, Music, Media, Finance)" className="w-full p-1.5 text-sm border rounded" />
          <input name="serviceTeamRole" value={formData.serviceTeamRole} onChange={handleChange} placeholder="Service Team Role" className="w-full p-1.5 text-sm border rounded" />
          
          {/* CONTACT & CONSENT */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">CONTACT & CONSENT</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Preferred Contact</label>
              <select name="preferredContactMethod" value={formData.preferredContactMethod} onChange={handleChange} className="w-full p-1.5 text-sm border rounded">
                <option value="">Select</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">WhatsApp Number</label>
              <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="WhatsApp (if different)" className="w-full p-1.5 text-sm border rounded" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs font-medium text-slate-600">Communication Opt-in:</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="optInEmail" checked={formData.optInEmail} onChange={handleCheckboxChange} className="h-3 w-3" /> Email</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="optInSMS" checked={formData.optInSMS} onChange={handleCheckboxChange} className="h-3 w-3" /> SMS</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="optInWhatsApp" checked={formData.optInWhatsApp} onChange={handleCheckboxChange} className="h-3 w-3" /> WhatsApp</label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Media/Photo Consent</label>
            <input type="checkbox" name="mediaConsent" checked={formData.mediaConsent} onChange={handleCheckboxChange} className="h-4 w-4" />
          </div>
          
          {/* EMERGENCY & HEALTH */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">EMERGENCY & HEALTH</h4>
          <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency Contact" className="w-full p-1.5 text-sm border rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Contact Name" className="w-full p-1.5 text-sm border rounded" />
            <input name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} placeholder="Relationship" className="w-full p-1.5 text-sm border rounded" />
            <input name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="Contact Phone" className="w-full p-1.5 text-sm border rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="Medical Conditions" className="w-full p-1.5 text-sm border rounded" />
            <input name="accessibilityNeeds" value={formData.accessibilityNeeds} onChange={handleChange} placeholder="Accessibility Needs" className="w-full p-1.5 text-sm border rounded" />
          </div>
          
          {/* STEWARDSHIP */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">STEWARDSHIP</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input name="titheNumber" value={formData.titheNumber} onChange={handleChange} placeholder="Tithe/Envelope Number" className="w-full p-1.5 text-sm border rounded" />
            <input name="givingId" value={formData.givingId} onChange={handleChange} placeholder="Giving ID" className="w-full p-1.5 text-sm border rounded" />
          </div>
          
          {/* OTHER */}
          <h4 className="text-sm font-bold text-slate-700 border-b-2 border-blue-500 pb-1 mt-3">OTHER</h4>
          <textarea name="prayerRequests" value={formData.prayerRequests} onChange={handleChange} placeholder="Prayer Requests" rows={2} className="w-full p-1.5 text-sm border rounded" />
          <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="w-full p-1.5 text-sm border rounded" />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-1.5 text-sm border rounded" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 text-sm font-medium rounded hover:bg-blue-700 mt-2">Add Member</button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;
