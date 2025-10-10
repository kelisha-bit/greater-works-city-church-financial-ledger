import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView,
  onViewChange,
  title = 'Dashboard',
  description = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={onViewChange} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {title}
            </h1>
            <div className="w-10"></div> {/* Spacer for flex alignment */}
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 lg:p-8">
          {/* Page title and description */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
          
          {/* Page content */}
          <div className="bg-white shadow overflow-hidden rounded-lg p-6">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Greater Works City Church. All rights reserved.
              </div>
              <div className="mt-2 md:mt-0">
                <p className="text-xs text-gray-500">
                  {user?.email && `Logged in as ${user.email}`}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
