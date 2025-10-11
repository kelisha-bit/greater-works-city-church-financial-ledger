import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  currentView: 'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'announcements' | 'myProfile' | 'users';
  onViewChange: (view: 'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'announcements' | 'myProfile' | 'users') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, userRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItemClasses = "cursor-pointer py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 min-h-touch";
  const activeClasses = "bg-blue-100 text-blue-700";
  const inactiveClasses = "text-slate-500 hover:bg-slate-200 hover:text-slate-700";

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Greater Works City Church</h1>
              <p className="text-xs sm:text-sm text-slate-500">Financial Ledger
                {user && userRole && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Role: {userRole}</span>}
              </p>
            </div>
            <button 
              className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
          
          <div className={`mt-4 md:mt-0 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <nav className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 bg-slate-100 p-2 rounded-lg" role="navigation" aria-label="Primary">
              <button
                onClick={() => {onViewChange('dashboard'); setMobileMenuOpen(false);}}
                className={`${navItemClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'dashboard' ? 'page' : undefined}
              >
                Dashboard
              </button>
              <button
                onClick={() => {onViewChange('reports'); setMobileMenuOpen(false);}}
                className={`${navItemClasses} ${currentView === 'reports' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'reports' ? 'page' : undefined}
              >
                Reports
              </button>
              <button
                onClick={() => {onViewChange('transactions'); setMobileMenuOpen(false);}}
                className={`${navItemClasses} ${currentView === 'transactions' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'transactions' ? 'page' : undefined}
              >
                Transactions
              </button>
              <button
                onClick={() => {onViewChange('donors'); setMobileMenuOpen(false);}}
                className={`${navItemClasses} ${currentView === 'donors' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'donors' ? 'page' : undefined}
              >
                Donors
              </button>
              <button
                onClick={() => {onViewChange('myProfile'); setMobileMenuOpen(false);}}
                className={`${navItemClasses} ${currentView === 'myProfile' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'myProfile' ? 'page' : undefined}
              >
                My Profile
              </button>
              <button
                onClick={() => {onViewChange('announcements'); setMobileMenuOpen(false);}}
                className={`${navItemClasses} ${currentView === 'announcements' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'announcements' ? 'page' : undefined}
              >
                Announcements
              </button>
              {(userRole === UserRole.EDITOR || userRole === UserRole.ADMIN) && (
                <button
                  onClick={() => {onViewChange('members'); setMobileMenuOpen(false);}}
                  className={`${navItemClasses} ${currentView === 'members' ? activeClasses : inactiveClasses}`}
                  aria-current={currentView === 'members' ? 'page' : undefined}
                >
                  Members
                </button>
              )}
              {(userRole === UserRole.ADMIN || userRole === UserRole.TREASURER) && (
                <button
                  onClick={() => {onViewChange('budgets'); setMobileMenuOpen(false);}}
                  className={`${navItemClasses} ${currentView === 'budgets' ? activeClasses : inactiveClasses}`}
                  aria-current={currentView === 'budgets' ? 'page' : undefined}
                >
                  Budgets
                </button>
              )}
              {userRole === UserRole.ADMIN && (
                <button
                  onClick={() => {onViewChange('users'); setMobileMenuOpen(false);}}
                  className={`${navItemClasses} ${currentView === 'users' ? activeClasses : inactiveClasses}`}
                  aria-current={currentView === 'users' ? 'page' : undefined}
                >
                  Users
                </button>
              )}
            </nav>
            {user && (
              <button
                onClick={logout}
                className="mt-4 md:mt-0 w-full md:w-auto px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
