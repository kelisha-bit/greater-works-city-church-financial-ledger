import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Announcement, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();

  // Fetch all announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const announcementsRef = collection(db, 'announcements');
      const q = query(
        announcementsRef,
        where('status', '==', 'published'),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const announcementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date if it exists
          date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date,
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
          scheduledFor: doc.data().scheduledFor?.toDate ? doc.data().scheduledFor.toDate() : doc.data().scheduledFor,
          updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
          expiresAt: doc.data().expiresAt?.toDate ? doc.data().expiresAt.toDate() : doc.data().expiresAt,
        })) as Announcement[];
        
        // Filter announcements based on audience and user role
        const filteredAnnouncements = announcementsData.filter(announcement => {
          // If announcement is expired, don't show it
          if (announcement.expiresAt && new Date(announcement.expiresAt) < new Date()) {
            return false;
          }
          
          // If audience is 'all', show to everyone
          if (announcement.audience === 'all') return true;
          
          // If user is not authenticated, don't show members/specific announcements
          if (!user) return false;
          
          // If audience is 'members', show to all authenticated users
          if (announcement.audience === 'members') return true;
          
          // If audience is 'specific', check if user is in the specificRecipients array
          if (announcement.audience === 'specific' && announcement.specificRecipients) {
            return announcement.specificRecipients.includes(user.uid);
          }
          
          return false;
        });
        
        setAnnouncements(filteredAnnouncements);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements');
      setLoading(false);
    }
  }, [user]);

  // Create a new announcement
  const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy'>) => {
    if (!user) throw new Error('User must be logged in to create announcements');
    
    try {
      setLoading(true);
      const announcementRef = collection(db, 'announcements');
      const newAnnouncement = {
        ...announcementData,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'published',
        readBy: [],
      };
      
      const docRef = await addDoc(announcementRef, newAnnouncement);
      return { id: docRef.id, ...newAnnouncement };
    } catch (err) {
      console.error('Error creating announcement:', err);
      throw new Error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  // Update an existing announcement
  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    if (!user) throw new Error('User must be logged in to update announcements');
    
    try {
      setLoading(true);
      const announcementRef = doc(db, 'announcements', id);
      
      // Only allow updates to specific fields
      const allowedUpdates = {
        title: updates.title,
        message: updates.message,
        audience: updates.audience,
        priority: updates.priority,
        status: updates.status,
        scheduledFor: updates.scheduledFor,
        updatedAt: Timestamp.now(),
        updatedBy: user.uid,
      };
      
      await updateDoc(announcementRef, allowedUpdates);
    } catch (err) {
      console.error('Error updating announcement:', err);
      throw new Error('Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  // Delete an announcement
  const deleteAnnouncement = async (id: string) => {
    if (!user) throw new Error('User must be logged in to delete announcements');
    
    try {
      setLoading(true);
      const announcementRef = doc(db, 'announcements', id);
      await deleteDoc(announcementRef);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      throw new Error('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  // Mark an announcement as read by the current user
  const markAsRead = async (announcementId: string) => {
    if (!user) return;
    
    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcementDoc = await getDocs(query(collection(db, 'announcements'), where('__name__', '==', announcementId)));
      
      if (!announcementDoc.empty) {
        const announcementData = announcementDoc.docs[0].data();
        const readBy = announcementData.readBy || [];
        
        if (!readBy.includes(user.uid)) {
          await updateDoc(announcementRef, {
            readBy: [...readBy, user.uid]
          });
        }
      }
    } catch (err) {
      console.error('Error marking announcement as read:', err);
    }
  };

  // Check if the current user has unread announcements
  const hasUnreadAnnouncements = (): boolean => {
    if (!user) return false;
    
    return announcements.some(announcement => {
      // If the announcement is not read by the user and it's not created by them
      return !announcement.readBy?.includes(user.uid) && announcement.createdBy !== user.uid;
    });
  };

  // Get announcements created by the current user
  const getUserAnnouncements = useCallback(async (): Promise<Announcement[]> => {
    if (!user) return [];
    
    try {
      const q = query(
        collection(db, 'announcements'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date,
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        scheduledFor: doc.data().scheduledFor?.toDate ? doc.data().scheduledFor.toDate() : doc.data().scheduledFor,
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
        expiresAt: doc.data().expiresAt?.toDate ? doc.data().expiresAt.toDate() : doc.data().expiresAt,
      })) as Announcement[];
    } catch (err) {
      console.error('Error fetching user announcements:', err);
      throw new Error('Failed to fetch your announcements');
    }
  }, [user]);

  // Check if user has permission to manage announcements
  const canManageAnnouncements = (): boolean => {
    return userRole === UserRole.ADMIN || userRole === UserRole.EDITOR;
  };

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead,
    hasUnreadAnnouncements,
    getUserAnnouncements,
    canManageAnnouncements,
  };
};

export default useAnnouncements;
