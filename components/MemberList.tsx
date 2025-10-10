import React, { useState } from 'react';
import { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onDeleteMember: (id: string) => void;
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
  onViewProfile: (id: string) => void;
}

interface EditingMember {
  id: string;
  data: Member & { profilePicture?: string };
}

const MemberList: React.FC<MemberListProps> = ({ members, onDeleteMember, onEditMember, onViewProfile }) => {
  const [editing, setEditing] = useState<EditingMember | null>(null);

  // Calculate metrics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.membershipStatus === 'Active').length;
  const inactiveMembers = members.filter(m => m.membershipStatus === 'Inactive').length;
  
  // Recent joins (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentJoins = members.filter(m => new Date(m.dateJoined) >= thirtyDaysAgo).length;
  
  // Gender distribution
  const maleCount = members.filter(m => m.gender === 'Male').length;
  const femaleCount = members.filter(m => m.gender === 'Female').length;
  
  // Baptized members
  const baptizedCount = members.filter(m => m.baptismDate).length;

  const handleEdit = (member: Member) => {
    setEditing({ id: member.id, data: { ...member } });
  };

  const handleSave = () => {
    if (editing) {
      const { id, data } = editing;
      // Prevent writing the id field to Firestore by stripping it from updates
      const { id: _omit, ...updates } = data;
      onEditMember(id, updates);
      setEditing(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editing) {
      setEditing({
        ...editing,
        data: { ...editing.data, [e.target.name]: e.target.value }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editing) {
      const reader = new FileReader();
      reader.onload = (ev) => setEditing({
        ...editing,
        data: { ...editing.data, profilePicture: ev.target?.result as string }
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Member List</h3>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium mb-1">Total Members</p>
          <p className="text-2xl font-bold text-blue-700">{totalMembers}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium mb-1">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeMembers}</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-600 font-medium mb-1">Inactive</p>
          <p className="text-2xl font-bold text-orange-700">{inactiveMembers}</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-purple-600 font-medium mb-1">New (30d)</p>
          <p className="text-2xl font-bold text-purple-700">{recentJoins}</p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs text-indigo-600 font-medium mb-1">Baptized</p>
          <p className="text-2xl font-bold text-indigo-700">{baptizedCount}</p>
        </div>
        
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
          <p className="text-xs text-pink-600 font-medium mb-1">M / F</p>
          <p className="text-xl font-bold text-pink-700">{maleCount} / {femaleCount}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="border p-4 rounded">
            {editing?.id === member.id ? (
              <div className="space-y-2">
                <input name="name" value={editing.data.name} onChange={handleChange} placeholder="Name" required className="w-full p-1 border rounded" />
                <input name="email" value={editing.data.email || ''} onChange={handleChange} placeholder="Email" className="w-full p-1 border rounded" />
                <input name="phone" value={editing.data.phone || ''} onChange={handleChange} placeholder="Phone" className="w-full p-1 border rounded" />
                <input name="address" value={editing.data.address || ''} onChange={handleChange} placeholder="Address Line 1" className="w-full p-1 border rounded" />
                <input name="address2" value={(editing.data as any).address2 || ''} onChange={handleChange} placeholder="Address Line 2" className="w-full p-1 border rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input name="city" value={(editing.data as any).city || ''} onChange={handleChange} placeholder="City" className="w-full p-1 border rounded" />
                  <input name="region" value={(editing.data as any).region || ''} onChange={handleChange} placeholder="Region" className="w-full p-1 border rounded" />
                  <input name="postalCode" value={(editing.data as any).postalCode || ''} onChange={handleChange} placeholder="Postal/GhanaPost GPS" className="w-full p-1 border rounded" />
                </div>
                <input name="dateJoined" value={editing.data.dateJoined.split('T')[0]} onChange={handleChange} type="date" required className="w-full p-1 border rounded" />
                <select name="role" value={editing.data.role || ''} onChange={handleChange} className="w-full p-1 border rounded">
                  <option value="">Select Role</option>
                  <option value="Member">Member</option>
                  <option value="Elder">Elder</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Deacon">Deacon</option>
                </select>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs w-24">Birthday</label>
                    <input name="birthday" value={(editing.data as any).birthday || ''} onChange={handleChange} type="date" className="w-full p-1 border rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs w-24">Marital</label>
                    <select name="maritalStatus" value={(editing.data as any).maritalStatus || ''} onChange={handleChange} className="w-full p-1 border rounded">
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs w-24">Membership</label>
                    <select name="membershipStatus" value={(editing.data as any).membershipStatus || ''} onChange={handleChange} className="w-full p-1 border rounded">
                      <option value="">Select</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs w-24">Join Date</label>
                    <input name="joinDate" value={(editing.data as any).joinDate || ''} onChange={handleChange} type="date" className="w-full p-1 border rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs w-24">Baptism</label>
                  <input name="baptismDate" value={(editing.data as any).baptismDate || ''} onChange={handleChange} type="date" className="w-full p-1 border rounded" />
                </div>
                <input name="householdName" value={(editing.data as any).householdName || ''} onChange={handleChange} placeholder="Household/Family Name" className="w-full p-1 border rounded" />
                <input name="familyLinks" value={Array.isArray((editing.data as any).familyLinks) ? (editing.data as any).familyLinks.join(', ') : ((editing.data as any).familyLinks || '')} onChange={handleChange} placeholder="Family Links (comma-separated)" className="w-full p-1 border rounded" />
                <input name="ministries" value={Array.isArray((editing.data as any).ministries) ? (editing.data as any).ministries.join(', ') : ((editing.data as any).ministries || '')} onChange={handleChange} placeholder="Ministries (comma-separated)" className="w-full p-1 border rounded" />
                <input name="departments" value={Array.isArray((editing.data as any).departments) ? (editing.data as any).departments.join(', ') : ((editing.data as any).departments || '')} onChange={handleChange} placeholder="Departments (comma-separated)" className="w-full p-1 border rounded" />
                <input name="emergencyContact" value={editing.data.emergencyContact || ''} onChange={handleChange} placeholder="Emergency Contact" className="w-full p-1 border rounded" />
                <input name="notes" value={(editing.data as any).notes || ''} onChange={handleChange} placeholder="Notes" className="w-full p-1 border rounded" />
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-1 border rounded" />
                <div className="flex space-x-2">
                  <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                  <button onClick={handleCancel} className="bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    {member.profilePicture && <img src={member.profilePicture} alt="Profile" className="w-16 h-16 rounded-full mb-2" />}
                    <h4 className="font-bold">{member.name}</h4>
                    <p className="text-sm text-gray-600">Joined: {new Date(member.dateJoined).toLocaleDateString()}</p>
                    {member.email && <p className="text-sm">{member.email}</p>}
                    {member.phone && <p className="text-sm">{member.phone}</p>}
                    {member.role && <p className="text-sm font-medium">{member.role}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => onViewProfile(member.id)} className="text-green-600 hover:underline">View Profile</button>
                    <button onClick={() => handleEdit(member)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => onDeleteMember(member.id)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-center text-gray-500">No members yet. Add your first member above.</p>
        )}
      </div>
    </div>
  );
};

export default MemberList;
