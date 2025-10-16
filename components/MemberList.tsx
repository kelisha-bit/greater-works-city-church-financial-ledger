import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Member } from '../types';
import Pagination from './Pagination';
import ConfirmationDialog from './ConfirmationDialog';

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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteMember(memberToDelete.id);
      setShowDeleteConfirmation(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setMemberToDelete(null);
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
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters {activeFilterCount > 0 && <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{activeFilterCount}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
              <label htmlFor="membershipStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="membershipStatus"
                name="membershipStatus"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.membershipStatus}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="New">New</option>
              </select>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="joinDateRange.start" className="block text-sm font-medium text-gray-700">Joined From</label>
              <input
                type="date"
                id="joinDateRange.start"
                name="joinDateRange.start"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.joinDateRange.start}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="joinDateRange.end" className="block text-sm font-medium text-gray-700">Joined To</label>
              <input
                type="date"
                id="joinDateRange.end"
                name="joinDateRange.end"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.joinDateRange.end}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="baptized" className="block text-sm font-medium text-gray-700">Baptized</label>
              <select
                id="baptized"
                name="baptized"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.baptized}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredMembers.length === 0 && searchQuery.length > 0 ? (
        <p className="text-center text-gray-500 py-8">No members found matching your search criteria.</p>
      ) : filteredMembers.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No members added yet. Use the form on the left to add new members.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {currentMembers.map((member) => (
                  <motion.tr 
                    key={member.id} 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }} // Subtle hover effect
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.profilePicture ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={member.profilePicture} alt="" />
                          ) : (
                            <span className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 font-medium">{member.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.membershipStatus === 'Active' ? 'bg-green-100 text-green-800' :
                        member.membershipStatus === 'Inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.role || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.dateJoined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => onViewProfile(member.id)} className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button onClick={() => handleEdit(member)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                      <button onClick={() => handleDeleteClick(member)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={filteredMembers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {editing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="relative p-8 border w-full max-w-md shadow-lg rounded-md bg-white mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Member</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="mb-4">
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={editing.data.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  value={editing.data.email || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  id="editPhone"
                  name="phone"
                  value={editing.data.phone || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="editAddress"
                  name="address"
                  value={editing.data.address || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editMembershipStatus" className="block text-sm font-medium text-gray-700">Membership Status</label>
                <select
                  id="editMembershipStatus"
                  name="membershipStatus"
                  value={editing.data.membershipStatus}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="New">New</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="editRole" className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  id="editRole"
                  name="role"
                  value={editing.data.role || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editProfilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
                {editing.data.profilePicture && (
                  <div className="mt-2 mb-4">
                    <img src={editing.data.profilePicture} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  id="editProfilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmation && memberToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Member"
          message={`Are you sure you want to delete ${memberToDelete.name}? This action cannot be undone.`}
          confirmButtonText="Delete"
          isConfirming={isDeleting}
        />
      )}
    </motion.div>
  );
};

export default MemberList;
