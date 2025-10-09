
import { useState, useEffect, useCallback } from 'react';
import { Budget } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget>({});

  useEffect(() => {
    if (!user) {
      setBudgets({});
      return;
    }

    const budgetsRef = doc(db, 'users', user.uid, 'settings', 'budgets');

    const unsubscribe = onSnapshot(budgetsRef, (docSnap) => {
      if (docSnap.exists()) {
        setBudgets(docSnap.data() as Budget);
      } else {
        setBudgets({});
      }
    }, (error) => {
      console.error("Error fetching budgets:", error);
    });

    return unsubscribe;
  }, [user]);

  const setBudgetsForMonth = useCallback(async (month: string, monthBudgets: { [category: string]: number }) => {
    if (!user) return;

    const budgetsRef = doc(db, 'users', user.uid, 'settings', 'budgets');

    const newBudgets = { ...budgets };
    // Filter out empty/zero values before saving
    const filteredMonthBudgets = Object.entries(monthBudgets)
      .filter(([, amount]) => amount > 0)
      .reduce((acc, [category, amount]) => {
        acc[category] = amount;
        return acc;
      }, {} as { [category: string]: number });

    if (Object.keys(filteredMonthBudgets).length > 0) {
      newBudgets[month] = filteredMonthBudgets;
    } else {
      delete newBudgets[month]; // Clean up month if no budgets are set
    }

    setBudgets(newBudgets);
    await setDoc(budgetsRef, newBudgets);
  }, [budgets, user]);

  const getBudgetsForMonth = useCallback((month: string): { [category: string]: number } => {
    return budgets[month] || {};
  }, [budgets]);

  return {
    budgets,
    setBudgetsForMonth,
    getBudgetsForMonth,
  };
};
