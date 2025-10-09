import { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  type: TransactionType;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

export interface TrendData {
  period: string;
  income: number;
  expenses: number;
  net: number;
}

export interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  averageTransaction: number;
  monthlyTrends: MonthlyData[];
  categoryBreakdown: CategoryData[];
  topCategories: CategoryData[];
  budgetComparison: BudgetComparison[];
  trends: TrendData[];
  growthRate: {
    income: number;
    expenses: number;
    net: number;
  };
}

export const useFinancialAnalytics = (
  transactions: Transaction[],
  budgets: any[] = [],
  dateRange?: { start: string; end: string }
) => {
  return useMemo(() => {
    // Filter transactions by date range if provided
    const filteredTransactions = dateRange && dateRange.start && dateRange.end
      ? transactions.filter(t =>
          t.date >= dateRange.start && t.date <= dateRange.end
        )
      : transactions;

    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;
    const transactionCount = filteredTransactions.length;
    const averageTransaction = transactionCount > 0 ? netIncome / transactionCount : 0;

    // Monthly trends (last 12 months)
    const monthlyTrends = (() => {
      const monthlyMap = new Map<string, { income: number; expenses: number; count: number }>();

      filteredTransactions.forEach(transaction => {
        const monthKey = transaction.date.substring(0, 7); // YYYY-MM format
        const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0, count: 0 };

        if (transaction.type === TransactionType.INCOME) {
          current.income += transaction.amount;
        } else {
          current.expenses += transaction.amount;
        }
        current.count += 1;

        monthlyMap.set(monthKey, current);
      });

      return Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          income: data.income,
          expenses: data.expenses,
          net: data.income - data.expenses,
          transactionCount: data.count
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12); // Last 12 months
    })();

    // Category breakdown
    const categoryBreakdown = (() => {
      const categoryMap = new Map<string, { amount: number; type: TransactionType }>();

      filteredTransactions.forEach(transaction => {
        const current = categoryMap.get(transaction.category) || { amount: 0, type: transaction.type };
        current.amount += transaction.amount;
        categoryMap.set(transaction.category, current);
      });

      const total = totalIncome + totalExpenses;

      return Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          percentage: total > 0 ? (data.amount / total) * 100 : 0,
          type: data.type
        }))
        .sort((a, b) => b.amount - a.amount);
    })();

    // Top categories (top 10)
    const topCategories = categoryBreakdown.slice(0, 10);

    // Budget comparison (if budgets are provided)
    const budgetComparison = (() => {
      if (!budgets.length) return [];

      return budgets.map(budget => {
        const actualSpending = filteredTransactions
          .filter(t => t.category === budget.category && t.type === TransactionType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0);

        const variance = budget.amount - actualSpending;
        const variancePercentage = budget.amount > 0 ? (variance / budget.amount) * 100 : 0;

        return {
          category: budget.category,
          budgeted: budget.amount,
          actual: actualSpending,
          variance,
          variancePercentage
        };
      }).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
    })();

    // Growth trends (comparing current period to previous)
    const trends = (() => {
      if (monthlyTrends.length < 2) return [];

      return monthlyTrends.map((month, index) => {
        if (index === 0) return { ...month, period: month.month };

        const prevMonth = monthlyTrends[index - 1];
        return {
          period: month.month,
          income: month.income,
          expenses: month.expenses,
          net: month.net
        };
      });
    })();

    // Growth rates (comparing last two months)
    const growthRate = (() => {
      if (monthlyTrends.length < 2) {
        return { income: 0, expenses: 0, net: 0 };
      }

      const current = monthlyTrends[monthlyTrends.length - 1];
      const previous = monthlyTrends[monthlyTrends.length - 2];

      const incomeGrowth = previous.income > 0 ?
        ((current.income - previous.income) / previous.income) * 100 : 0;
      const expenseGrowth = previous.expenses > 0 ?
        ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0;
      const netGrowth = previous.net > 0 ?
        ((current.net - previous.net) / previous.net) * 100 : 0;

      return {
        income: incomeGrowth,
        expenses: expenseGrowth,
        net: netGrowth
      };
    })();

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount,
      averageTransaction,
      monthlyTrends,
      categoryBreakdown,
      topCategories,
      budgetComparison,
      trends,
      growthRate
    } as AnalyticsData;
  }, [transactions, budgets, dateRange]);
};
