import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionType } from '../types';

const clearStorage = () => {
  localStorage.clear();
};

describe('useTransactions', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('adds a transaction and updates totals', () => {
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.addTransaction({
        amount: 100,
        category: 'Donations',
        date: '2025-01-01',
        description: 'Seed',
        type: TransactionType.INCOME,
      });
    });

    expect(result.current.totalIncome).toBe(100);
    expect(result.current.totalExpenses).toBe(0);
    expect(result.current.balance).toBe(100);
    expect(result.current.transactions).toHaveLength(1);
  });

  it('handles expenses and balance calculation', () => {
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.addTransaction({
        amount: 200,
        category: 'Tithes & Offerings',
        date: '2025-02-01',
        description: 'Tithe',
        type: TransactionType.INCOME,
      });
      result.current.addTransaction({
        amount: 50,
        category: 'Utilities',
        date: '2025-02-02',
        description: 'Electricity',
        type: TransactionType.EXPENSE,
      });
    });

    expect(result.current.totalIncome).toBe(200);
    expect(result.current.totalExpenses).toBe(50);
    expect(result.current.balance).toBe(150);
  });

  it('deletes a transaction', () => {
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.addTransaction({
        amount: 10,
        category: 'Other',
        date: '2025-03-01',
        description: 'Test',
        type: TransactionType.EXPENSE,
      });
    });

    const id = result.current.transactions[0].id;

    act(() => {
      result.current.deleteTransaction(id);
    });

    expect(result.current.transactions).toHaveLength(0);
    expect(result.current.totalExpenses).toBe(0);
  });

  it('generates expense chart data grouped by category', () => {
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.addTransaction({
        amount: 20,
        category: 'Utilities',
        date: '2025-01-03',
        description: 'Water',
        type: TransactionType.EXPENSE,
      });
      result.current.addTransaction({
        amount: 30,
        category: 'Utilities',
        date: '2025-01-04',
        description: 'Power',
        type: TransactionType.EXPENSE,
      });
      result.current.addTransaction({
        amount: 40,
        category: 'Missions & Outreach',
        date: '2025-01-05',
        description: 'Support',
        type: TransactionType.EXPENSE,
      });
    });

    const data = result.current.expenseChartData;
    expect(data.find(d => d.name === 'Utilities')?.value).toBe(50);
    expect(data.find(d => d.name === 'Missions & Outreach')?.value).toBe(40);
  });
});
