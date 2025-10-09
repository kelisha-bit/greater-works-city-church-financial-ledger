import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionType, ChartData } from '../types';
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
  orderBy,
  where,
  getDocs
} from 'firebase/firestore';

const STORAGE_KEY_PREFIX = 'transactions_';

const loadFromLocalStorage = (userId: string): Transaction[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return [];
  }
};

const saveToLocalStorage = (userId: string, transactions: Transaction[]) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
};

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    // Load from localStorage immediately for offline support
    const localData = loadFromLocalStorage(user.uid);
    setTransactions(localData);

    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date.toDate().toISOString().split('T')[0],
          description: data.description,
          category: data.category,
          amount: Number(data.amount),
          type: data.type,
          receipts: data.receipts || [],
          donorName: data.donorName,
          donorContact: data.donorContact,
        } as Transaction;
      });
      setTransactions(transactionsData);
      // Save to localStorage when data comes from Firebase
      saveToLocalStorage(user.uid, transactionsData);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      // On error, still use local data if available
    });

    return unsubscribe;
  }, [user]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date'> & { date: string }) => {
    if (!user) return;

    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    await addDoc(transactionsRef, {
      ...transaction,
      date: new Date(transaction.date),
    });
  }, [user]);

  const addMultipleTransactions = useCallback(async (newTransactions: Omit<Transaction, 'id'>[]) => {
    if (!user) return;

    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const promises = newTransactions.map(t => addDoc(transactionsRef, {
      ...t,
      date: new Date(t.date),
    }));
    await Promise.all(promises);
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    const transactionRef = doc(db, 'users', user.uid, 'transactions', id);
    await deleteDoc(transactionRef);
  }, [user]);

  const editTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return;

    const transactionRef = doc(db, 'users', user.uid, 'transactions', id);
    const updatesWithDate = updates.date ? { ...updates, date: new Date(updates.date) } : updates;
    await updateDoc(transactionRef, updatesWithDate);
  }, [user]);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum: number, t) => sum + t.amount, 0 as number);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum: number, t) => sum + t.amount, 0 as number);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const expenseChartData: ChartData[] = useMemo(() => {
    const expenseByCategory = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce<Record<string, number>>((acc, transaction) => {
        const { category, amount } = transaction;
        acc[category] = (acc[category] ?? 0) + amount;
        return acc;
      }, {});

    return Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const incomeChartData: ChartData[] = useMemo(() => {
    const incomeByCategory = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce<Record<string, number>>((acc, transaction) => {
        const { category, amount } = transaction;
        acc[category] = (acc[category] ?? 0) + amount;
        return acc;
      }, {});

    return Object.entries(incomeByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);


  return {
    transactions,
    addTransaction,
    addMultipleTransactions,
    deleteTransaction,
    editTransaction,
    totalIncome,
    totalExpenses,
    balance,
    expenseChartData,
    incomeChartData,
  };
};
