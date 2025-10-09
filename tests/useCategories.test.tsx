import { renderHook, act } from '@testing-library/react';
import { useCategories } from '../hooks/useCategories';
import { EXPENSE_CATEGORIES as defaultExpenseCategories } from '../constants';

const clearStorage = () => localStorage.clear();

describe('useCategories', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('loads default expense categories', () => {
    const { result } = renderHook(() => useCategories());
    defaultExpenseCategories.forEach(cat => {
      expect(result.current.expenseCategories).toContain(cat);
    });
  });

  it('adds a new unique category (deduped)', () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      const added = result.current.addExpenseCategory('New Ministry');
      expect(added).toBe(true);
    });

    expect(result.current.expenseCategories).toContain('New Ministry');

    // Attempt to add duplicate (case-insensitive)
    act(() => {
      const added = result.current.addExpenseCategory('new ministry');
      expect(added).toBe(false);
    });
  });

  it('persists custom categories to localStorage', () => {
    const { result, unmount, rerender } = renderHook(() => useCategories());

    act(() => {
      result.current.addExpenseCategory('Facilities');
    });

    // Unmount and remount to simulate new session
    unmount();
    const again = renderHook(() => useCategories());

    expect(again.result.current.expenseCategories).toContain('Facilities');
  });
});
