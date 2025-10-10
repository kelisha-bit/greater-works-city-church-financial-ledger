import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

const UserManagement: React.FC = () => {
  const { user: currentUser, userRole } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Only admins can access this component
  if (userRole !== UserRole.ADMIN) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators can access user management.</p>
      </div>
    );
  }

  useEffect(() => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || 'No email',
          role: data.role || UserRole.VIEWER,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserData;
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!currentUser || userId === currentUser.uid) {
      alert('You cannot change your own role!');
      return;
    }

    setUpdatingUserId(userId);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });
      console.log(`Updated user ${userId} to role: ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-700 border-red-200';
      case UserRole.TREASURER:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.EDITOR:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.VIEWER:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '👑';
      case UserRole.TREASURER:
        return '💰';
      case UserRole.EDITOR:
        return '✏️';
      case UserRole.VIEWER:
        return '👁️';
      default:
        return '👤';
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Count by role
  const roleCounts = {
    admin: users.filter(u => u.role === UserRole.ADMIN).length,
    treasurer: users.filter(u => u.role === UserRole.TREASURER).length,
    editor: users.filter(u => u.role === UserRole.EDITOR).length,
    viewer: users.filter(u => u.role === UserRole.VIEWER).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">User Management</h2>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium mb-1">Administrators</p>
              <p className="text-3xl font-bold text-red-700">{roleCounts.admin}</p>
            </div>
            <div className="text-4xl">👑</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium mb-1">Treasurers</p>
              <p className="text-3xl font-bold text-purple-700">{roleCounts.treasurer}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Editors</p>
              <p className="text-3xl font-bold text-blue-700">{roleCounts.editor}</p>
            </div>
            <div className="text-4xl">✏️</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Viewers</p>
              <p className="text-3xl font-bold text-gray-700">{roleCounts.viewer}</p>
            </div>
            <div className="text-4xl">👁️</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.TREASURER}>Treasurer</option>
              <option value={UserRole.EDITOR}>Editor</option>
              <option value={UserRole.VIEWER}>Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Change Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          {user.id === currentUser?.uid && (
                            <div className="text-xs text-blue-600 font-medium">(You)</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        <span>{getRoleIcon(user.role)}</span>
                        <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.id === currentUser?.uid ? (
                        <span className="text-xs text-gray-500 italic">Cannot change own role</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          disabled={updatingUserId === user.id}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={UserRole.ADMIN}>Admin</option>
                          <option value={UserRole.TREASURER}>Treasurer</option>
                          <option value={UserRole.EDITOR}>Editor</option>
                          <option value={UserRole.VIEWER}>Viewer</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👑</span>
              <h4 className="font-bold text-red-700">Administrator</h4>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              <li>✅ Full access to all features</li>
              <li>✅ Manage users and roles</li>
              <li>✅ Manage budgets</li>
              <li>✅ Delete records</li>
            </ul>
          </div>
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <h4 className="font-bold text-purple-700">Treasurer</h4>
            </div>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>✅ Full financial access</li>
              <li>✅ Manage budgets</li>
              <li>✅ Delete transactions</li>
              <li>❌ Cannot manage members</li>
            </ul>
          </div>
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✏️</span>
              <h4 className="font-bold text-blue-700">Editor</h4>
            </div>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>✅ Edit transactions</li>
              <li>✅ Manage members</li>
              <li>✅ View reports</li>
              <li>❌ Cannot delete records</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👁️</span>
              <h4 className="font-bold text-gray-700">Viewer</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ View dashboard</li>
              <li>✅ View transactions</li>
              <li>✅ View reports</li>
              <li>❌ Cannot edit anything</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
