
import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface BudgetStatusProps {
  transactions: Transaction[];
  budgets: { [category: string]: number };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const BudgetStatusCard: React.FC<{
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}> = ({ category, spent, budget, percentage }) => {
  const getStatusColor = () => {
    if (percentage > 100) return 'from-red-500 to-red-600';
    if (percentage > 75) return 'from-amber-500 to-orange-500';
    return 'from-emerald-500 to-green-500';
  };

  const getStatusIcon = () => {
    if (percentage > 100) return '⚠️';
    if (percentage > 75) return '⚡';
    return '✅';
  };

  const getStatusText = () => {
    if (percentage > 100) return 'Over Budget';
    if (percentage > 75) return 'Near Limit';
    return 'On Track';
  };

  return (
    <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor().replace('from-', 'from-').replace('to-', 'to-').replace('-500', '-500/5').replace('-600', '-600/5')} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <h3 className="font-semibold text-slate-800">{category}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-600">{getStatusText()}</div>
            <div className="text-xs text-slate-500">
              {percentage.toFixed(0)}% used
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Progress</span>
            <span className="text-sm font-semibold text-slate-700">
              {formatCurrency(spent)} / {formatCurrency(budget)}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getStatusColor()} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Over budget warning */}
        {percentage > 100 && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50/80 p-2 rounded-lg">
            <span className="text-sm">💸</span>
            <span className="text-sm font-medium">
              {formatCurrency(spent - budget)} over budget
            </span>
          </div>
        )}
      </div>

      {/* Subtle border gradient */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getStatusColor().replace('from-', 'from-').replace('to-', 'to-').replace('-500', '-500/20').replace('-600', '-600/20')} p-[1px] -z-10`}>
        <div className="h-full w-full bg-white/80 backdrop-blur-xl rounded-xl" />
      </div>
    </div>
  );
};

const BudgetStatus: React.FC<BudgetStatusProps> = ({ transactions, budgets }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const spendingByCat = useMemo(() => {
    const monthlyExpenses = transactions.filter(t =>
      t.type === TransactionType.EXPENSE && t.date.startsWith(currentMonth)
    );

    return monthlyExpenses.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions, currentMonth]);

  const budgetedCategories = Object.keys(budgets).sort();

  if (budgetedCategories.length === 0) {
    return (
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Budgets Set</h2>
          <p className="text-slate-600 mb-4">
            Set up monthly budgets to track your spending and stay on target.
          </p>
          <div className="inline-flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <span>💡</span>
            <span>Visit the Budgets page to get started</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Budget Status
        </h2>
        <div className="text-sm text-slate-500 ml-auto">
          {currentMonth.replace('-', ' / ')}
        </div>
      </div>

      <div className="grid gap-4">
        {budgetedCategories.map(category => {
          const spent = spendingByCat[category] || 0;
          const budget = budgets[category];
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;

          return (
            <BudgetStatusCard
              key={category}
              category={category}
              spent={spent}
              budget={budget}
              percentage={percentage}
            />
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100/80 rounded-xl border border-slate-200/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Total Budgeted:</span>
          <span className="font-semibold text-slate-800">
            {formatCurrency((Object.values(budgets) as number[]).reduce((sum: number, budget: number) => sum + budget, 0))}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-slate-600">Total Spent:</span>
          <span className="font-semibold text-slate-800">
            {formatCurrency((Object.values(spendingByCat) as number[]).reduce((sum: number, spent: number) => sum + spent, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetStatus;
