import React, { useState, useEffect, useMemo } from 'react';

interface BudgetsProps {
  getBudgetsForMonth: (month: string) => { [category: string]: number };
  setBudgetsForMonth: (month: string, budgets: { [category: string]: number }) => void;
  expenseCategories: string[];
  addExpenseCategory: (category: string) => boolean;
}

const Budgets: React.FC<BudgetsProps> = ({ getBudgetsForMonth, setBudgetsForMonth, expenseCategories, addExpenseCategory }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [localBudgets, setLocalBudgets] = useState<{ [category: string]: number }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');


  useEffect(() => {
    const existingBudgets = getBudgetsForMonth(selectedMonth);
    setLocalBudgets(existingBudgets);
  }, [selectedMonth, getBudgetsForMonth]);
  
  const handleBudgetChange = (category: string, amount: string) => {
    const numericAmount = parseFloat(amount);
    setLocalBudgets(prev => ({
      ...prev,
      [category]: isNaN(numericAmount) ? 0 : numericAmount
    }));
  };
  
  const handleAddCategory = () => {
    setCategoryError('');
    if (!newCategory.trim()) {
        setCategoryError('Category name cannot be empty.');
        return;
    }
    const success = addExpenseCategory(newCategory);
    if (success) {
        setNewCategory('');
    } else {
        setCategoryError('This category already exists.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetsForMonth(selectedMonth, localBudgets);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Hide message after 3 seconds
  };
  
  const totalBudget = useMemo(() => {
      // Fix: Explicitly type `reduce` callback parameters to resolve TS inference error.
      return Object.values(localBudgets).reduce((sum: number, amount: number) => sum + amount, 0);
  }, [localBudgets]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Monthly Budgets</h2>
      <p className="text-slate-600 mb-6">Set your spending limits for each category for a selected month. Unset categories will not be tracked.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <label htmlFor="month" className="block text-sm font-medium text-slate-700">Select Month</label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full sm:w-auto border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800 border-b pb-2">Expense Categories</h3>
            {expenseCategories.map(category => (
                <div key={category} className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor={`budget-${category}`} className="text-sm font-medium text-slate-700 col-span-2">{category}</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 sm:text-sm">$</span>
                        <input
                            type="number"
                            id={`budget-${category}`}
                            value={localBudgets[category] || ''}
                            onChange={(e) => handleBudgetChange(category, e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-7 pr-2 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                            aria-label={`Budget for ${category}`}
                        />
                    </div>
                </div>
            ))}
        </div>

        <div className="border-t pt-4">
            <h3 className="text-md font-medium text-slate-800 mb-2">Add New Category</h3>
            <div className="flex items-start gap-2">
                <div className="flex-grow">
                    <input 
                        type="text" 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)} 
                        placeholder="e.g., 'Community Lunch'"
                        className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
                </div>
                <button type="button" onClick={handleAddCategory} className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 text-sm">Add</button>
            </div>
        </div>

        <div className="border-t pt-4 mt-4">
             <div className="flex justify-between items-center text-lg font-bold">
                 <span>Total Budgeted</span>
                 <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBudget)}</span>
            </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {showSuccess && <p className="text-sm text-green-600">Budgets saved successfully!</p>}
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Save Budgets
          </button>
        </div>
      </form>
    </div>
  );
};

export default Budgets;
