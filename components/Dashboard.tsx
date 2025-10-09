import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { useFinancialAnalytics } from '../hooks/useFinancialAnalytics';
import { formatCurrency } from '../utils/formatters';
import FinancialCharts from './FinancialCharts';

interface DashboardProps {
  transactions: Transaction[];
  budgets?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets = [] }) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'year' | 'quarter' | 'month'>('all');

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) return transactions;

    return transactions.filter(t =>
      t.date >= dateRange.start && t.date <= dateRange.end
    );
  }, [transactions, dateRange]);

  const analytics = useFinancialAnalytics(
    filteredTransactions,
    budgets,
    dateRange ? { start: dateRange.start, end: dateRange.end } : { start: '', end: '' }
  );

  const handlePeriodChange = (period: 'all' | 'year' | 'quarter' | 'month') => {
    setSelectedPeriod(period);

    if (period === 'all') {
      setDateRange(undefined);
      return;
    }

    const now = new Date();
    let start: string;
    let end: string = now.toISOString().split('T')[0];

    switch (period) {
      case 'year':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        start = quarterStart.toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setDateRange({ start, end });
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    color?: string;
  }> = ({ title, value, change, changeLabel, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color === 'green' ? 'text-green-600' :
            color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}% {changeLabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color === 'green' ? 'bg-green-100' :
          color === 'red' ? 'bg-red-100' : 'bg-blue-100'}`}>
          <svg className={`w-6 h-6 ${color === 'green' ? 'text-green-600' :
            color === 'red' ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {color === 'green' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            ) : color === 'red' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            )}
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Financial Dashboard</h2>
            <p className="text-slate-600 mt-1">
              Overview of your church's financial health and trends
            </p>
          </div>
          <div className="flex gap-2">
            {(['all', 'year', 'quarter', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Income"
          value={analytics.totalIncome}
          change={analytics.growthRate.income}
          changeLabel="vs previous period"
          color="green"
        />
        <MetricCard
          title="Total Expenses"
          value={analytics.totalExpenses}
          change={analytics.growthRate.expenses}
          changeLabel="vs previous period"
          color="red"
        />
        <MetricCard
          title="Net Income"
          value={analytics.netIncome}
          change={analytics.growthRate.net}
          changeLabel="vs previous period"
          color={analytics.netIncome >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Transactions"
          value={`${analytics.transactionCount} (${formatCurrency(analytics.averageTransaction)} avg)`}
        />
      </div>

      {/* Interactive Charts Section */}
      <FinancialCharts
        monthlyTrends={analytics.monthlyTrends}
        categoryData={analytics.topCategories}
        totalIncome={analytics.totalIncome}
        totalExpenses={analytics.totalExpenses}
      />

      {/* Budget Comparison */}
      {analytics.budgetComparison.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget vs Actual</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-sm font-medium text-slate-700">Category</th>
                  <th className="text-right py-2 text-sm font-medium text-slate-700">Budgeted</th>
                  <th className="text-right py-2 text-sm font-medium text-slate-700">Actual</th>
                  <th className="text-right py-2 text-sm font-medium text-slate-700">Variance</th>
                  <th className="text-center py-2 text-sm font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.budgetComparison.map((budget) => (
                  <tr key={budget.category} className="border-b border-slate-100">
                    <td className="py-3 text-sm text-slate-700">{budget.category}</td>
                    <td className="py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(budget.budgeted)}
                    </td>
                    <td className="py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(budget.actual)}
                    </td>
                    <td className={`py-3 text-sm text-right font-medium ${
                      budget.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(budget.variance))}
                      {budget.variance >= 0 ? ' under' : ' over'}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        budget.variancePercentage > 10
                          ? 'bg-green-100 text-green-800'
                          : budget.variancePercentage > -10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {budget.variancePercentage > 10 ? 'Under Budget' :
                         budget.variancePercentage > -10 ? 'On Track' : 'Over Budget'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Total Transactions</p>
            <p className="text-xl font-bold text-slate-900">{analytics.transactionCount}</p>
          </div>
          <div>
            <p className="text-slate-600">Average per Transaction</p>
            <p className={`text-xl font-bold ${analytics.averageTransaction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(analytics.averageTransaction)}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Data Points</p>
            <p className="text-xl font-bold text-slate-900">{analytics.monthlyTrends.length} months</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
