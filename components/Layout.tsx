import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'react-feather';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'announcements' | 'myProfile' | 'users';
  onViewChange: (view: 'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'announcements' | 'myProfile' | 'users') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when changing view on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [currentView, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for desktop and mobile */}
      {user && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onViewChange={onViewChange}
        />
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden lg:ml-64">
        {/* Mobile header with menu button */}
        {user && (
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden transition-colors"
                aria-label="Toggle sidebar menu"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
                <h1 className="text-xl font-bold text-slate-800">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                </h1>
              </div>
              
              <div className="flex items-center">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-slate-500">Greater Works City Church</p>
                </div>
              </div>
            </div>
          </header>
        )}
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
