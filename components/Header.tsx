import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  currentView: 'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'announcements' | 'myProfile' | 'users';
  onViewChange: (view: 'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'announcements' | 'myProfile' | 'users') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, userRole, logout } = useAuth();
  const navItemClasses = "cursor-pointer py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500";
  const activeClasses = "bg-blue-100 text-blue-700";
  const inactiveClasses = "text-slate-500 hover:bg-slate-200 hover:text-slate-700";

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Greater Works City Church</h1>
            <p className="text-sm text-slate-500">Financial Ledger
              {user && userRole && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Role: {userRole}</span>}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg" role="navigation" aria-label="Primary">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`${navItemClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'dashboard' ? 'page' : undefined}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('reports')}
                className={`${navItemClasses} ${currentView === 'reports' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'reports' ? 'page' : undefined}
              >
                Reports
              </button>
              <button
                onClick={() => onViewChange('transactions')}
                className={`${navItemClasses} ${currentView === 'transactions' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'transactions' ? 'page' : undefined}
              >
                Transactions
              </button>
              <button
                onClick={() => onViewChange('donors')}
                className={`${navItemClasses} ${currentView === 'donors' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'donors' ? 'page' : undefined}
              >
                Donors
              </button>
              <button
                onClick={() => onViewChange('myProfile')}
                className={`${navItemClasses} ${currentView === 'myProfile' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'myProfile' ? 'page' : undefined}
              >
                My Profile
              </button>
              <button
                onClick={() => onViewChange('announcements')}
                className={`${navItemClasses} ${currentView === 'announcements' ? activeClasses : inactiveClasses}`}
                aria-current={currentView === 'announcements' ? 'page' : undefined}
              >
                Announcements
              </button>
              {(userRole === UserRole.EDITOR || userRole === UserRole.ADMIN) && (
                <button
                  onClick={() => onViewChange('members')}
                  className={`${navItemClasses} ${currentView === 'members' ? activeClasses : inactiveClasses}`}
                  aria-current={currentView === 'members' ? 'page' : undefined}
                >
                  Members
                </button>
              )}
              {(userRole === UserRole.ADMIN || userRole === UserRole.TREASURER) && (
                <button
                  onClick={() => onViewChange('budgets')}
                  className={`${navItemClasses} ${currentView === 'budgets' ? activeClasses : inactiveClasses}`}
                  aria-current={currentView === 'budgets' ? 'page' : undefined}
                >
                  Budgets
                </button>
              )}
              {userRole === UserRole.ADMIN && (
                <button
                  onClick={() => onViewChange('users')}
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
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
