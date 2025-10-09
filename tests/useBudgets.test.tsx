import { renderHook, act } from '@testing-library/react';
import { useBudgets } from '../hooks/useBudgets';
import { AuthProvider } from '../context/AuthContext';
import React from 'react';

const clearStorage = () => localStorage.clear();

// Mock Firebase auth
const mockUser = { uid: 'test-uid' };

// Mock firebase auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(mockUser);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(() => 'collection'),
  doc: jest.fn(() => 'doc'),
  onSnapshot: jest.fn((ref, callback) => {
    callback({ docs: [] });
    return jest.fn();
  }),
  setDoc: jest.fn(),
}));

// Create a wrapper with AuthProvider
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useBudgets', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('sets budgets for a month and filters out zero/empty values', () => {
    const { result } = renderHook(() => useBudgets(), { wrapper: Wrapper });

    act(() => {
      result.current.setBudgetsForMonth('2025-01', {
        Utilities: 100,
        EmptyCat: 0,
      } as Record<string, number>);
    });

    const jan = result.current.getBudgetsForMonth('2025-01');
    expect(jan).toHaveProperty('Utilities', 100);
    expect(jan).not.toHaveProperty('EmptyCat');
  });

  it('removes month entry when all categories are zero/removed', () => {
    const { result } = renderHook(() => useBudgets());

    act(() => {
      result.current.setBudgetsForMonth('2025-02', { Utilities: 50 } as Record<string, number>);
    });

    expect(result.current.getBudgetsForMonth('2025-02')).toHaveProperty('Utilities', 50);

    act(() => {
      // Setting all zero should delete the month entry
      result.current.setBudgetsForMonth('2025-02', { Utilities: 0 } as Record<string, number>);
    });

    expect(result.current.getBudgetsForMonth('2025-02')).toEqual({});
  });

  it('returns empty object for months without budgets', () => {
    const { result } = renderHook(() => useBudgets());
    expect(result.current.getBudgetsForMonth('2099-12')).toEqual({});
  });
});
