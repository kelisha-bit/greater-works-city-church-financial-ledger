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
    dateJoined: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    role: '',
    membershipStatus: 'Active',
    baptismDate: '',
    ministries: [] as string[],
    smallGroup: '',
    volunteerRoles: [] as string[],
    familyMembers: {
      spouse: '',
      children: [] as Array<{ name: string; age?: number; relationship?: string }>
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    occupation: '',
    skills: [] as string[],
    previousChurch: '',
    allergies: '',
    notes: '',
    profilePicture: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested object properties
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArrayFieldChange = (field: 'ministries' | 'volunteerRoles' | 'skills', value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeArrayItem = (field: 'ministries' | 'volunteerRoles' | 'skills', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
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
    await onAddMember(formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateJoined: new Date().toISOString().split('T')[0],
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      role: '',
      membershipStatus: 'Active',
      baptismDate: '',
      ministries: [],
      smallGroup: '',
      volunteerRoles: [],
      familyMembers: {
        spouse: '',
        children: []
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      occupation: '',
      skills: [],
      previousChurch: '',
      allergies: '',
      notes: '',
      profilePicture: '',
    });
  };

  const ministryOptions = [
    'Worship', 'Children\'s Ministry', 'Youth Ministry', 'Young Adults',
    'Senior Adults', 'Missions', 'Evangelism', 'Hospitality',
    'Media/Tech', 'Administration', 'Finance', 'Building & Grounds'
  ];

  const skillOptions = [
    'Teaching', 'Music', 'Leadership', 'Organization', 'Technical',
    'Creative Arts', 'Counseling', 'Hospitality', 'Finance',
    'Construction', 'Cooking', 'Photography', 'Writing'
  ];

  const volunteerRoleOptions = [
    'Sunday School Teacher', 'Youth Leader', 'Music Ministry',
    'Greeter/Usher', 'Sound/Tech Team', 'Children\'s Ministry Helper',
    'Kitchen Ministry', 'Building Maintenance', 'Office Help',
    'Event Planning', 'Transportation', 'Prayer Ministry'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-6">Add New Church Member</h3>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Information Section */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name *"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              type="date"
              placeholder="Date of Birth"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full md:col-span-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Church Information Section */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Church Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="dateJoined"
              value={formData.dateJoined}
              onChange={handleChange}
              type="date"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="membershipStatus"
              value={formData.membershipStatus}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Former">Former</option>
              <option value="Visitor">Visitor</option>
            </select>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={formData.baptismDate}
              onChange={handleChange}
              type="date"
              placeholder="Baptism Date"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="smallGroup"
              value={formData.smallGroup}
              onChange={handleChange}
              placeholder="Small Group"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ministry & Volunteer Information */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Ministry & Volunteer Involvement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ministries</label>
              <select
                onChange={(e) => handleArrayFieldChange('ministries', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Add Ministry</option>
                {ministryOptions.map(ministry => (
                  <option key={ministry} value={ministry}>{ministry}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.ministries.map(ministry => (
                  <span key={ministry} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Talents</label>
              <select
                onChange={(e) => handleArrayFieldChange('skills', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Add Skill</option>
                {skillOptions.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
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
        </div>

        {/* Emergency Contact */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              placeholder="Contact Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="emergencyContact.relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleChange}
              placeholder="Relationship"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              placeholder="Contact Phone"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="emergencyContact.email"
              value={formData.emergencyContact.email}
              onChange={handleChange}
              type="email"
              placeholder="Contact Email"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Occupation"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="previousChurch"
              value={formData.previousChurch}
              onChange={handleChange}
              placeholder="Previous Church (if any)"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="Allergies/Medical Notes"
              rows={2}
              className="w-full md:col-span-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional Notes"
              rows={3}
              className="w-full md:col-span-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div className="border-b pb-4">
          <h4 className="text-lg font-semibold mb-3 text-blue-800">Profile Picture</h4>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 font-semibold text-lg transition-colors"
        >
          Add Church Member
        </button>
      </form>
    </div>
  );
};

export default AddMemberForm;
