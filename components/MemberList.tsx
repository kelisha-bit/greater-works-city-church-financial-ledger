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
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="border p-4 rounded">
            {editing?.id === member.id ? (
              <div className="space-y-2">
                <input name="name" value={editing.data.name} onChange={handleChange} placeholder="Name" required className="w-full p-1 border rounded" />
                <input name="email" value={editing.data.email || ''} onChange={handleChange} placeholder="Email" className="w-full p-1 border rounded" />
                <input name="phone" value={editing.data.phone || ''} onChange={handleChange} placeholder="Phone" className="w-full p-1 border rounded" />
                <input name="address" value={editing.data.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-1 border rounded" />
                <input name="dateJoined" value={editing.data.dateJoined.split('T')[0]} onChange={handleChange} type="date" required className="w-full p-1 border rounded" />
                <select name="role" value={editing.data.role || ''} onChange={handleChange} className="w-full p-1 border rounded">
                  <option value="">Select Role</option>
                  <option value="Member">Member</option>
                  <option value="Elder">Elder</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Deacon">Deacon</option>
                </select>
                <input name="emergencyContact" value={editing.data.emergencyContact || ''} onChange={handleChange} placeholder="Emergency Contact" className="w-full p-1 border rounded" />
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
