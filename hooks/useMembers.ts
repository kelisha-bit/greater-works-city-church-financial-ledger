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
import { 
  normalizeEmail, 
  prepareMemberEmailData, 
  validateEmailUniqueness,
  findMemberByEmail,
  isEmailTaken,
  getMembersWithEmails,
  findDuplicateEmails
} from '../utils/memberUtils';

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
      const membersData = snapshot.docs.map(d => {
        const data = d.data() as any;
        const toIso = (ts?: any) => ts?.toDate ? ts.toDate().toISOString().split('T')[0] : (typeof ts === 'string' ? ts : undefined);

        return {
          id: d.id,
          ...data,
          dateJoined: toIso(data.dateJoined)!,
          birthday: toIso(data.birthday),
          baptismDate: toIso(data.baptismDate),
          joinDate: toIso(data.joinDate),
          membershipClassDate: toIso(data.membershipClassDate),
          confirmationDate: toIso(data.confirmationDate),
          communionDate: toIso(data.communionDate),
          ministries: Array.isArray(data.ministries) ? data.ministries : (data.ministries ? [String(data.ministries)] : []),
          departments: Array.isArray(data.departments) ? data.departments : (data.departments ? [String(data.departments)] : []),
          familyLinks: Array.isArray(data.familyLinks) ? data.familyLinks : (data.familyLinks ? [String(data.familyLinks)] : []),
          childrenNamesAges: Array.isArray(data.childrenNamesAges) ? data.childrenNamesAges : (data.childrenNamesAges ? [String(data.childrenNamesAges)] : []),
          spiritualGifts: Array.isArray(data.spiritualGifts) ? data.spiritualGifts : (data.spiritualGifts ? [String(data.spiritualGifts)] : []),
        } as Member;
      });
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
    if (!user) {
      console.error('No user authenticated. Cannot add member to Firestore.');
      return;
    }

    try {
      // Validate email uniqueness before adding
      if (member.email) {
        const emailValidation = validateEmailUniqueness(members, member.email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.message || 'Email validation failed');
        }
      }

      const membersRef = collection(db, 'users', user.uid, 'members');
      const toDate = (v?: string) => (v ? new Date(v) : undefined);
      
      // Prepare data with proper type conversions and email normalization
      const preparedMember = prepareMemberEmailData(member);
      const memberData: any = {
        ...preparedMember,
        dateJoined: new Date(member.dateJoined),
        birthday: toDate((member as any).birthday),
        baptismDate: toDate((member as any).baptismDate),
        joinDate: toDate((member as any).joinDate),
        membershipClassDate: toDate((member as any).membershipClassDate),
        confirmationDate: toDate((member as any).confirmationDate),
        communionDate: toDate((member as any).communionDate),
        // Ensure arrays are properly handled
        ministries: Array.isArray((member as any).ministries) ? (member as any).ministries : ((member as any).ministries ? String((member as any).ministries).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        departments: Array.isArray((member as any).departments) ? (member as any).departments : ((member as any).departments ? String((member as any).departments).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        familyLinks: Array.isArray((member as any).familyLinks) ? (member as any).familyLinks : ((member as any).familyLinks ? String((member as any).familyLinks).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        childrenNamesAges: Array.isArray((member as any).childrenNamesAges) ? (member as any).childrenNamesAges : ((member as any).childrenNamesAges ? String((member as any).childrenNamesAges).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        spiritualGifts: Array.isArray((member as any).spiritualGifts) ? (member as any).spiritualGifts : ((member as any).spiritualGifts ? String((member as any).spiritualGifts).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      };

      // Remove undefined values to keep Firestore clean
      Object.keys(memberData).forEach(key => {
        if (memberData[key] === undefined) {
          delete memberData[key];
        }
      });

      await addDoc(membersRef, memberData);
      console.log('Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }, [user, members]);

  const deleteMember = useCallback(async (id: string) => {
    if (!user) return;

    const memberRef = doc(db, 'users', user.uid, 'members', id);
    await deleteDoc(memberRef);
  }, [user]);

  const editMember = useCallback(async (id: string, updates: Partial<Omit<Member, 'id'>>) => {
    if (!user) return;

    try {
      // Validate email uniqueness before updating (excluding current member)
      if (updates.email !== undefined) {
        const emailValidation = validateEmailUniqueness(members, updates.email, id);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.message || 'Email validation failed');
        }
      }

      const memberRef = doc(db, 'users', user.uid, 'members', id);
      const toDate = (v?: string) => (v ? new Date(v) : undefined);
      
      // Prepare updates with email normalization
      const preparedUpdates = prepareMemberEmailData(updates);
      
      const updatesWithDates = {
        ...preparedUpdates,
        ...(updates.dateJoined ? { dateJoined: toDate(updates.dateJoined) } : {}),
        ...(updates.birthday ? { birthday: toDate(updates.birthday) } : {}),
        ...(updates.baptismDate ? { baptismDate: toDate(updates.baptismDate) } : {}),
        ...(updates.joinDate ? { joinDate: toDate(updates.joinDate) } : {}),
        ...(updates.ministries ? { ministries: Array.isArray(updates.ministries) ? updates.ministries : String(updates.ministries).split(',').map(s => s.trim()).filter(Boolean) } : {}),
        ...(updates.departments ? { departments: Array.isArray(updates.departments) ? updates.departments : String(updates.departments).split(',').map(s => s.trim()).filter(Boolean) } : {}),
        ...(updates.familyLinks ? { familyLinks: Array.isArray(updates.familyLinks) ? updates.familyLinks : String(updates.familyLinks).split(',').map(s => s.trim()).filter(Boolean) } : {}),
      } as any;
      
      await updateDoc(memberRef, updatesWithDates);
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }, [user, members]);

  // Email-based utility functions
  const findByEmail = useCallback((email: string) => {
    return findMemberByEmail(members, email);
  }, [members]);

  const checkEmailTaken = useCallback((email: string, excludeMemberId?: string) => {
    return isEmailTaken(members, email, excludeMemberId);
  }, [members]);

  const getMembersWithEmail = useCallback(() => {
    return getMembersWithEmails(members);
  }, [members]);

  const findEmailDuplicates = useCallback(() => {
    return findDuplicateEmails(members);
  }, [members]);

  const validateEmail = useCallback((email: string, excludeMemberId?: string) => {
    return validateEmailUniqueness(members, email, excludeMemberId);
  }, [members]);

  return {
    members,
    addMember,
    deleteMember,
    editMember,
    // Email-based functions
    findByEmail,
    checkEmailTaken,
    getMembersWithEmail,
    findEmailDuplicates,
    validateEmail,
  };
};
