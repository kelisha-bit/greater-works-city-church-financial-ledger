import { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

export interface DonorProfile {
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  address?: string;
  totalGiven: number;
  transactionCount: number;
  firstGiftDate: string;
  lastGiftDate: string;
  averageGift: number;
  categories: string[];
  isRegular: boolean;
  monthlyAverage: number;
}

export interface DonorAnalytics {
  totalDonors: number;
  activeDonors: number;
  newDonorsThisMonth: number;
  averageGiftSize: number;
  totalGiving: number;
  topDonors: DonorProfile[];
  givingTrends: { month: string; amount: number; donorCount: number }[];
  donorRetention: {
    retained: number;
    lapsed: number;
    new: number;
  };
}

export const useDonorManagement = (transactions: Transaction[]) => {
  return useMemo(() => {
    // Filter only income transactions (donations)
    const donationTransactions = transactions.filter(t => t.type === TransactionType.INCOME);

    // Group transactions by donor
    const donorMap = new Map<string, Transaction[]>();

    donationTransactions.forEach(transaction => {
      const donorKey = transaction.donorName || 'Anonymous';
      const existing = donorMap.get(donorKey) || [];
      existing.push(transaction);
      donorMap.set(donorKey, existing);
    });

    // Create donor profiles
    const donorProfiles: DonorProfile[] = Array.from(donorMap.entries()).map(([donorName, donorTransactions]) => {
      const sortedTransactions = donorTransactions.sort((a, b) => a.date.localeCompare(b.date));
      const totalGiven = donorTransactions.reduce((sum, t) => sum + t.amount, 0);
      const categories = [...new Set(donorTransactions.map(t => t.category))];

      // Calculate monthly giving pattern
      const monthlyGiving = new Map<string, number>();
      donorTransactions.forEach(t => {
        const monthKey = t.date.substring(0, 7);
        monthlyGiving.set(monthKey, (monthlyGiving.get(monthKey) || 0) + t.amount);
      });

      const monthlyAmounts = Array.from(monthlyGiving.values());
      const monthlyAverage = monthlyAmounts.length > 0 ?
        monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length : 0;

      // Determine if regular donor (gave in 3+ months)
      const isRegular = monthlyAmounts.length >= 3;

      return {
        name: donorName,
        contact: donorTransactions[0]?.donorContact || '',
        email: '', // Would need to be stored separately
        phone: '', // Would need to be stored separately
        address: '', // Would need to be stored separately
        totalGiven,
        transactionCount: donorTransactions.length,
        firstGiftDate: sortedTransactions[0]?.date || '',
        lastGiftDate: sortedTransactions[sortedTransactions.length - 1]?.date || '',
        averageGift: totalGiven / donorTransactions.length,
        categories,
        isRegular,
        monthlyAverage
      };
    }).sort((a, b) => b.totalGiven - a.totalGiven);

    // Calculate analytics
    const totalDonors = donorProfiles.length;
    const totalGiving = donorProfiles.reduce((sum, d) => sum + d.totalGiven, 0);
    const averageGiftSize = totalDonors > 0 ? totalGiving / totalDonors : 0;

    // Active donors (gave in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const activeDonors = donorProfiles.filter(d =>
      new Date(d.lastGiftDate) >= sixMonthsAgo
    ).length;

    // New donors this month
    const currentMonth = new Date().toISOString().substring(0, 7);
    const newDonorsThisMonth = donorProfiles.filter(d =>
      d.firstGiftDate.startsWith(currentMonth)
    ).length;

    // Top donors (top 10)
    const topDonors = donorProfiles.slice(0, 10);

    // Monthly giving trends
    const givingTrends = (() => {
      const monthlyTotals = new Map<string, { amount: number; donors: Set<string> }>();

      donationTransactions.forEach(transaction => {
        const monthKey = transaction.date.substring(0, 7);
        const current = monthlyTotals.get(monthKey) || { amount: 0, donors: new Set() };
        current.amount += transaction.amount;
        current.donors.add(transaction.donorName || 'Anonymous');
        monthlyTotals.set(monthKey, current);
      });

      return Array.from(monthlyTotals.entries())
        .map(([month, data]) => ({
          month,
          amount: data.amount,
          donorCount: data.donors.size
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12); // Last 12 months
    })();

    // Donor retention analysis (comparing last two months)
    const retentionAnalysis = (() => {
      if (givingTrends.length < 2) {
        return { retained: 0, lapsed: 0, new: 0 };
      }

      const currentMonth = givingTrends[givingTrends.length - 1];
      const previousMonth = givingTrends[givingTrends.length - 2];

      const currentDonors = new Set(
        donationTransactions
          .filter(t => t.date.startsWith(currentMonth.month))
          .map(t => t.donorName || 'Anonymous')
      );

      const previousDonors = new Set(
        donationTransactions
          .filter(t => t.date.startsWith(previousMonth.month))
          .map(t => t.donorName || 'Anonymous')
      );

      const retained = new Set([...currentDonors].filter(d => previousDonors.has(d)));
      const lapsed = new Set([...previousDonors].filter(d => !currentDonors.has(d)));
      const newDonors = new Set([...currentDonors].filter(d => !previousDonors.has(d)));

      return {
        retained: retained.size,
        lapsed: lapsed.size,
        new: newDonors.size
      };
    })();

    return {
      donorProfiles,
      analytics: {
        totalDonors,
        activeDonors,
        newDonorsThisMonth,
        averageGiftSize,
        totalGiving,
        topDonors,
        givingTrends,
        donorRetention: retentionAnalysis
      } as DonorAnalytics
    };
  }, [transactions]);
};
