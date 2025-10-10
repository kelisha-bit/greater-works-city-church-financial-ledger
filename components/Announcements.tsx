import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db, isFirebaseReady } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: Timestamp;
  audience: 'all' | 'members' | 'specific';
  specificRecipients?: string[];
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: Timestamp;
}

interface AnnouncementsProps {
  memberId?: string;
  memberEmail?: string;
  className?: string;
}

const Announcements: React.FC<AnnouncementsProps> = ({ memberId, memberEmail, className = '' }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    if (!isFirebaseReady() || !db) {
      setError('Database is not initialized. Please try again later.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Base query for announcements
      const announcementsRef = collection(db, 'announcements');
      const announcementsQuery = query(
        announcementsRef,
        where('status', '==', 'published'),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        announcementsQuery,
        (snapshot) => {
          try {
            const announcementsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Announcement[];
            
            // Filter announcements based on audience and expiration
            const filteredAnnouncements = announcementsData.filter((announcement) => {
              // Check if announcement has expired
              if (announcement.expiresAt && announcement.expiresAt.toDate() < new Date()) {
                return false;
              }
              
              // Show all announcements for admins
              if (userRole === UserRole.ADMIN) return true;
              
              // Show announcements for everyone
              if (announcement.audience === 'all') return true;
              
              // Show announcements for all members
              if (announcement.audience === 'members') return true;
              
              // Show announcements for specific members if memberEmail is provided
              if (announcement.audience === 'specific' && memberEmail) {
                return announcement.specificRecipients?.includes(memberEmail);
              }
              
              return false;
            });

            setAnnouncements(filteredAnnouncements);
            setIsLoading(false);
          } catch (error) {
            console.error('Error processing announcements:', error);
            setError('Error processing announcements. Please try again.');
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error fetching announcements:', error);
          setError('Failed to load announcements. Please try again later.');
          setIsLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up announcements listener:', error);
      setError('Failed to load announcements. Please refresh the page.');
      setIsLoading(false);
    }
  }, [user, userRole, memberId, memberEmail]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't render anything if there are no announcements
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {announcements.map((announcement) => (
        <div 
          key={announcement.id}
          className={`border-l-4 ${
            announcement.priority === 'high' 
              ? 'border-red-500 bg-red-50' 
              : announcement.priority === 'medium' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-blue-500 bg-blue-50'
          } rounded-r-md p-4`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {announcement.priority === 'high' ? (
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                {announcement.title}
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                <p>{announcement.message}</p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Posted on {announcement.date?.toDate().toLocaleDateString()}
                {announcement.createdBy && ` • By ${announcement.createdBy}`}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
