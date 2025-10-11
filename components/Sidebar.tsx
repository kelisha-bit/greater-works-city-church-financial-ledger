import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Home, FileText, CreditCard, Users, User, Bell, Settings, LogOut } from 'react-feather';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { userRole, logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
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
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-20 lg:hidden ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-xl transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Logo and close button */}
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div>
              <h1 className="text-xl font-bold">Greater Works</h1>
              <p className="text-xs opacity-80">Financial Ledger</p>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </h2>
              <ul className="mt-3 space-y-1">
                {navItems.map((item) => {
                  if (!item.roles.includes(userRole as UserRole)) return null;
                  const isActive = currentView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          onViewChange(item.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
          
          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium shadow-sm">
                  {userRole?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {userRole}
                  </p>
                  <p className="text-xs text-gray-500">
                    Logged in
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
