import React, { useState, useMemo } from 'react';
import { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onDeleteMember: (id: string) => void;
  onEditMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => void;
  onViewProfile: (id: string) => void;
}

interface EditingMember {
  id: string;
  data: Member;
}

const MemberList: React.FC<MemberListProps> = ({ members, onDeleteMember, onEditMember, onViewProfile }) => {
  const [editing, setEditing] = useState<EditingMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Filter and search logic
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        member.name.toLowerCase().includes(searchLower) ||
        (member.email && member.email.toLowerCase().includes(searchLower)) ||
        (member.phone && member.phone.toLowerCase().includes(searchLower)) ||
        (member.address && member.address.toLowerCase().includes(searchLower));

      // Role filter
      const matchesRole = !roleFilter || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, searchTerm, roleFilter]);

  // Get unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const roles = new Set(members.map(member => member.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [members]);

  const handleEdit = (member: Member) => {
    setEditing({ id: member.id, data: { ...member } });
  };

  const handleSave = () => {
    if (editing) {
      const { id, data } = editing;
      onEditMember(id, data);
      setEditing(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (editing) {
      const { name, value } = e.target;

      if (name.includes('.')) {
        // Handle nested object properties
        const [parent, child] = name.split('.');
        setEditing({
          ...editing,
          data: {
            ...editing.data,
            [parent]: {
              ...editing.data[parent as keyof Member] as any,
              [child]: value
            }
          }
        });
      } else {
        setEditing({
          ...editing,
          data: { ...editing.data, [name]: value }
        });
      }
    }
  };

  const handleArrayFieldChange = (field: 'ministries' | 'volunteerRoles' | 'skills', value: string) => {
    if (editing && value && !editing.data[field]?.includes(value)) {
      setEditing({
        ...editing,
        data: {
          ...editing.data,
          [field]: [...(editing.data[field] || []), value]
        }
      });
    }
  };

  const removeArrayItem = (field: 'ministries' | 'volunteerRoles' | 'skills', item: string) => {
    if (editing) {
      setEditing({
        ...editing,
        data: {
          ...editing.data,
          [field]: (editing.data[field] || []).filter((i: string) => i !== item)
        }
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Member List</h3>
        {(searchTerm || roleFilter) && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Members
            </label>
            <input
              type="text"
              placeholder="Search by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm || roleFilter) && (
          <div className="text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
            {searchTerm && ` matching "${searchTerm}"`}
            {roleFilter && ` with role "${roleFilter}"`}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="border p-4 rounded">
            {editing?.id === member.id ? (
              <div className="max-h-96 overflow-y-auto space-y-4 p-2">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    name="name"
                    value={editing.data.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="dateOfBirth"
                    value={editing.data.dateOfBirth || ''}
                    onChange={handleChange}
                    type="date"
                    placeholder="Date of Birth"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="gender"
                    value={editing.data.gender || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <select
                    name="maritalStatus"
                    value={editing.data.maritalStatus || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    name="email"
                    value={editing.data.email || ''}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email Address"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="phone"
                    value={editing.data.phone || ''}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="address"
                    value={editing.data.address || ''}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full md:col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Church Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    name="dateJoined"
                    value={editing.data.dateJoined.split('T')[0]}
                    onChange={handleChange}
                    type="date"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="membershipStatus"
                    value={editing.data.membershipStatus || 'Active'}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Former">Former</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                  <select
                    name="role"
                    value={editing.data.role || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="Member">Member</option>
                    <option value="Elder">Elder</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Deacon">Deacon</option>
                    <option value="Youth Leader">Youth Leader</option>
                    <option value="Sunday School Teacher">Sunday School Teacher</option>
                  </select>
                  <input
                    name="baptismDate"
                    value={editing.data.baptismDate || ''}
                    onChange={handleChange}
                    type="date"
                    placeholder="Baptism Date"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="smallGroup"
                    value={editing.data.smallGroup || ''}
                    onChange={handleChange}
                    placeholder="Small Group"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Ministry & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ministries</label>
                    <select
                      onChange={(e) => handleArrayFieldChange('ministries', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Add Ministry</option>
                      <option value="Worship">Worship</option>
                      <option value="Children's Ministry">Children's Ministry</option>
                      <option value="Youth Ministry">Youth Ministry</option>
                      <option value="Young Adults">Young Adults</option>
                      <option value="Senior Adults">Senior Adults</option>
                      <option value="Missions">Missions</option>
                      <option value="Evangelism">Evangelism</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Media/Tech">Media/Tech</option>
                      <option value="Administration">Administration</option>
                      <option value="Finance">Finance</option>
                      <option value="Building & Grounds">Building & Grounds</option>
                    </select>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(editing.data.ministries || []).map((ministry: string) => (
                        <span key={ministry} className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          {ministry}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('ministries', ministry)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Skills & Talents</label>
                    <select
                      onChange={(e) => handleArrayFieldChange('skills', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Add Skill</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Music">Music</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Organization">Organization</option>
                      <option value="Technical">Technical</option>
                      <option value="Creative Arts">Creative Arts</option>
                      <option value="Counseling">Counseling</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Finance">Finance</option>
                      <option value="Construction">Construction</option>
                      <option value="Cooking">Cooking</option>
                      <option value="Photography">Photography</option>
                      <option value="Writing">Writing</option>
                    </select>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(editing.data.skills || []).map((skill: string) => (
                        <span key={skill} className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-green-100 text-green-800">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('skills', skill)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    name="emergencyContact.name"
                    value={editing.data.emergencyContact?.name || ''}
                    onChange={handleChange}
                    placeholder="Emergency Contact Name"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="emergencyContact.relationship"
                    value={editing.data.emergencyContact?.relationship || ''}
                    onChange={handleChange}
                    placeholder="Relationship"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="emergencyContact.phone"
                    value={editing.data.emergencyContact?.phone || ''}
                    onChange={handleChange}
                    placeholder="Contact Phone"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="emergencyContact.email"
                    value={editing.data.emergencyContact?.email || ''}
                    onChange={handleChange}
                    type="email"
                    placeholder="Contact Email"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    name="occupation"
                    value={editing.data.occupation || ''}
                    onChange={handleChange}
                    placeholder="Occupation"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    name="previousChurch"
                    value={editing.data.previousChurch || ''}
                    onChange={handleChange}
                    placeholder="Previous Church"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="allergies"
                    value={editing.data.allergies || ''}
                    onChange={handleChange}
                    placeholder="Allergies/Medical Notes"
                    rows={2}
                    className="w-full md:col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="notes"
                    value={editing.data.notes || ''}
                    onChange={handleChange}
                    placeholder="Additional Notes"
                    rows={2}
                    className="w-full md:col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Profile Picture */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex space-x-2 pt-2">
                  <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                  <button onClick={handleCancel} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {member.profilePicture && <img src={member.profilePicture} alt="Profile" className="w-16 h-16 rounded-full mb-2 float-left mr-3" />}
                    <h4 className="font-bold text-lg">{member.name}</h4>

                    {/* Basic Info */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Joined: {new Date(member.dateJoined).toLocaleDateString()}</p>
                      {member.membershipStatus && member.membershipStatus !== 'Active' && (
                        <p className={`font-medium ${
                          member.membershipStatus === 'Pending' ? 'text-yellow-600' :
                          member.membershipStatus === 'Inactive' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          Status: {member.membershipStatus}
                        </p>
                      )}
                      {member.role && <p className="font-medium text-blue-600">Role: {member.role}</p>}
                      {member.email && <p>{member.email}</p>}
                      {member.phone && <p>{member.phone}</p>}
                      {member.dateOfBirth && (
                        <p>DOB: {new Date(member.dateOfBirth).toLocaleDateString()}</p>
                      )}
                      {member.maritalStatus && (
                        <p>Marital Status: {member.maritalStatus}</p>
                      )}
                    </div>

                    {/* Ministry & Skills Tags */}
                    <div className="mt-2 space-y-2">
                      {member.ministries && member.ministries.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Ministries:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.ministries.slice(0, 3).map((ministry: string) => (
                              <span key={ministry} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                {ministry}
                              </span>
                            ))}
                            {member.ministries.length > 3 && (
                              <span className="text-xs text-gray-500">+{member.ministries.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {member.skills && member.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Skills:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="text-xs text-gray-500">+{member.skills.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {member.smallGroup && (
                        <p className="text-sm text-purple-600">Small Group: {member.smallGroup}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => onViewProfile(member.id)} className="text-green-600 hover:underline text-sm">View Profile</button>
                    <button onClick={() => handleEdit(member)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => onDeleteMember(member.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <p className="text-center text-gray-500">
            {members.length === 0
              ? "No members yet. Add your first member above."
              : "No members match your current search and filter criteria."
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default MemberList;
