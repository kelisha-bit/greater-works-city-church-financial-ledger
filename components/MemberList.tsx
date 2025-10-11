import React, { useState, useEffect, useMemo } from 'react';
import { Member } from '../types';
import Pagination from './Pagination';

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

interface FilterOptions {
  membershipStatus: string;
  role: string;
  joinDateRange: {
    start: string;
    end: string;
  };
  baptized: string;
}

const MemberList: React.FC<MemberListProps> = ({ members, onDeleteMember, onEditMember, onViewProfile }) => {
  const [editing, setEditing] = useState<EditingMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    membershipStatus: '',
    role: '',
    joinDateRange: {
      start: '',
      end: ''
    },
    baptized: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(members);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Get unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    members.forEach(member => {
      if (member.role) roles.add(member.role);
    });
    return Array.from(roles);
  }, [members]);

  // Apply search and filters
  useEffect(() => {
    let result = [...members];
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(member => 
        member.name.toLowerCase().includes(query) || 
        (member.email && member.email.toLowerCase().includes(query)) ||
        (member.phone && member.phone.toLowerCase().includes(query)) ||
        (member.address && member.address.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (filters.membershipStatus) {
      result = result.filter(member => member.membershipStatus === filters.membershipStatus);
    }
    
    if (filters.role) {
      result = result.filter(member => member.role === filters.role);
    }
    
    if (filters.joinDateRange.start) {
      result = result.filter(member => new Date(member.dateJoined) >= new Date(filters.joinDateRange.start));
    }
    
    if (filters.joinDateRange.end) {
      result = result.filter(member => new Date(member.dateJoined) <= new Date(filters.joinDateRange.end));
    }
    
    if (filters.baptized === 'yes') {
      result = result.filter(member => member.baptismDate);
    } else if (filters.baptized === 'no') {
      result = result.filter(member => !member.baptismDate);
    }
    
    setFilteredMembers(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [members, searchQuery, filters]);

  // Get current page members
  const currentMembers = useMemo(() => {
    const indexOfLastMember = currentPage * itemsPerPage;
    const indexOfFirstMember = indexOfLastMember - itemsPerPage;
    return filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  }, [filteredMembers, currentPage, itemsPerPage]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FilterOptions],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      membershipStatus: '',
      role: '',
      joinDateRange: {
        start: '',
        end: ''
      },
      baptized: ''
    });
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.membershipStatus) count++;
    if (filters.role) count++;
    if (filters.joinDateRange.start) count++;
    if (filters.joinDateRange.end) count++;
    if (filters.baptized) count++;
    return count;
  }, [searchQuery, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
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
      
      {/* Search and Filter UI */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search members by name, email, phone..."
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <button 
            className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {activeFilterCount > 0 && (
            <button 
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              onClick={resetFilters}
            >
              Clear All
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Status</label>
                <select
                  name="membershipStatus"
                  value={filters.membershipStatus}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="joinDateRange.start"
                    value={filters.joinDateRange.start}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    name="joinDateRange.end"
                    value={filters.joinDateRange.end}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="To"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baptized</label>
                <select
                  name="baptized"
                  value={filters.baptized}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Members</option>
                  <option value="yes">Baptized</option>
                  <option value="no">Not Baptized</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Results summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredMembers.length} of {members.length} members
          {activeFilterCount > 0 && ' (filtered)'}
        </div>
      </div>
      
      {/* Empty state */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
          <div className="mt-6">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
      
      {/* Member list */}
      <div className="space-y-4">
        {currentMembers.map((member) => (
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

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredMembers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default MemberList;
