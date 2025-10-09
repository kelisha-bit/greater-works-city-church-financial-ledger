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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateJoined: new Date().toISOString().split('T')[0],
      role: '',
      emergencyContact: '',
      profilePicture: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Add New Member</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full p-2 border rounded" />
          <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" className="w-full p-2 border rounded" />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" />
          <input name="dateJoined" value={formData.dateJoined} onChange={handleChange} type="date" required className="w-full p-2 border rounded" />
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select Role</option>
            <option value="Member">Member</option>
            <option value="Elder">Elder</option>
            <option value="Pastor">Pastor</option>
            <option value="Deacon">Deacon</option>
          </select>
          <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency Contact" className="w-full p-2 border rounded" />
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Member</button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;
