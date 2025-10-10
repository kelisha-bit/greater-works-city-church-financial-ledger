import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import CreateAnnouncement from '../components/CreateAnnouncement';
import Announcements from '../components/Announcements';
import AnnouncementManagement from '../components/AnnouncementManagement';

const AnnouncementsPage: React.FC = () => {
  const { userRole } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage important announcements for the church community
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {showCreateForm ? 'Hide Form' : 'New Announcement'}
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="mb-10">
            <CreateAnnouncement 
              onSuccess={() => {
                setShowCreateForm(false);
                // You might want to add a success toast here
              }} 
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Announcement Management Section */}
        <AnnouncementManagement />

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Announcements</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All active and upcoming announcements are listed below
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <Announcements />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
