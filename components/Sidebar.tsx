import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Home, FileText, CreditCard, Users, User, Bell, Settings } from 'react-feather';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { userRole, logout } = useAuth();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER, UserRole.TREASURER] },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.TREASURER] },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.TREASURER] },
    { id: 'donors', label: 'Donors', icon: <Users size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.TREASURER] },
    { id: 'announcements', label: 'Announcements', icon: <Bell size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER, UserRole.TREASURER] },
    { id: 'members', label: 'Members', icon: <Users size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR] },
    { id: 'budgets', label: 'Budgets', icon: <FileText size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'users', label: 'Users', icon: <User size={20} className="mr-3" />, roles: [UserRole.ADMIN] },
    { id: 'myProfile', label: 'My Profile', icon: <User size={20} className="mr-3" />, roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER, UserRole.TREASURER] },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Logo and close button */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Greater Works</h1>
              <p className="text-xs text-gray-500">Financial Ledger</p>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                if (!item.roles.includes(userRole as UserRole)) return null;
                const isActive = currentView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                  {userRole?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {userRole}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
