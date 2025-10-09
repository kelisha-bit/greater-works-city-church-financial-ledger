import { useState, useEffect, useCallback } from 'react';
import { EXPENSE_CATEGORIES as defaultExpenseCategories } from '../constants';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

export const useCategories = () => {
    const { user } = useAuth();
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    useEffect(() => {
      if (!user) {
        setCustomCategories([]);
        return;
      }

      const categoriesRef = doc(db, 'users', user.uid, 'settings', 'categories');

      const unsubscribe = onSnapshot(categoriesRef, (docSnap) => {
        if (docSnap.exists()) {
          setCustomCategories(docSnap.data().customCategories || []);
        } else {
          setCustomCategories([]);
        }
      }, (error) => {
        console.error("Error fetching categories:", error);
      });

      return unsubscribe;
    }, [user]);

    const expenseCategories = [...new Set([...defaultExpenseCategories, ...customCategories])];

    const saveCustomCategories = async (custom: string[]) => {
      if (!user) return;

      const categoriesRef = doc(db, 'users', user.uid, 'settings', 'categories');
      await setDoc(categoriesRef, { customCategories: custom });
    };

    const addExpenseCategory = useCallback(async (newCategory: string): Promise<boolean> => {
      const trimmedCategory = newCategory.trim();
      if (!trimmedCategory) return false;

      if (expenseCategories.some(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
        return false;
      }

      const updatedCustom = [...customCategories, trimmedCategory];
      setCustomCategories(updatedCustom);
      await saveCustomCategories(updatedCustom);
      return true;
    }, [expenseCategories, customCategories, user]);

    return {
        expenseCategories,
        addExpenseCategory,
    };
};
