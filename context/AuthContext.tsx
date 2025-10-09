import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>(UserRole.ADMIN); // Default to ADMIN for demo/review
  const [loading, setLoading] = useState(true);

  const loadUserRole = async (uid: string) => {
    try {
      // Check if user document exists and get role from it
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists() && docSnap.data().role) {
        const role = docSnap.data().role as UserRole;
        console.log('Loaded role from Firebase:', role);
        setUserRoleState(role);
      } else {
        // Create user document with default role if it doesn't exist
        console.log('Creating user document with default ADMIN role for demo');
        await setDoc(userDocRef, {
          email: user?.email || '',
          role: UserRole.ADMIN,
          createdAt: new Date()
        });
        setUserRoleState(UserRole.ADMIN);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      // Keep the initial ADMIN role on error for demo purposes
      setUserRoleState(UserRole.ADMIN);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserRole(user.uid);
      } else {
        setUserRoleState(UserRole.VIEWER);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setUserRole = async (role: UserRole) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role }, { merge: true });
      setUserRoleState(role);
    } catch (error) {
      console.error('Error setting user role:', error);
    }
  };

  const value = {
    user,
    loading,
    userRole,
    login,
    signup,
    logout,
    setUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
