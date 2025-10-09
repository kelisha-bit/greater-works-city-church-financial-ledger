import { useState, useEffect, useCallback } from 'react';
import { Member } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

const STORAGE_KEY = 'churchLedgerMembers';

export const useMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!user) {
      // Load from localStorage when not authenticated
      try {
        const savedMembers = window.localStorage.getItem(STORAGE_KEY);
        setMembers(savedMembers ? JSON.parse(savedMembers) : []);
      } catch (error) {
        console.error("Error reading from localStorage", error);
        setMembers([]);
      }
      return;
    }

    const membersRef = collection(db, 'users', user.uid, 'members');
    const q = query(membersRef, orderBy('dateJoined', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateJoined: doc.data().dateJoined.toDate().toISOString().split('T')[0], // Convert Firestore timestamp to YYYY-MM-DD
      })) as Member[];
      setMembers(membersData);
    }, (error) => {
      console.error("Error fetching members:", error);
      // Fallback to localStorage on Firestore error
      try {
        const savedMembers = window.localStorage.getItem(STORAGE_KEY);
        setMembers(savedMembers ? JSON.parse(savedMembers) : []);
      } catch (localError) {
        console.error("Error reading from localStorage", localError);
        setMembers([]);
      }
    });

    return unsubscribe;
  }, [user]);

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!user) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [members, user]);

  const addMember = useCallback(async (member: Omit<Member, 'id' | 'dateJoined'> & { dateJoined: string }) => {
    if (!user) return;

    const membersRef = collection(db, 'users', user.uid, 'members');
    await addDoc(membersRef, {
      ...member,
      dateJoined: new Date(member.dateJoined),
    });
  }, [user]);

  const deleteMember = useCallback(async (id: string) => {
    if (!user) return;

    const memberRef = doc(db, 'users', user.uid, 'members', id);
    await deleteDoc(memberRef);
  }, [user]);

  const editMember = useCallback(async (id: string, updates: Partial<Omit<Member, 'id'>>) => {
    if (!user) return;

    const memberRef = doc(db, 'users', user.uid, 'members', id);
    const updatesWithDate = updates.dateJoined ? { ...updates, dateJoined: new Date(updates.dateJoined) } : updates;
    await updateDoc(memberRef, updatesWithDate);
  }, [user]);

  return {
    members,
    addMember,
    deleteMember,
    editMember,
  };
};
