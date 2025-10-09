import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ReportsProps {
  transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isExporting, setIsExporting] = useState(false);

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange.start && !dateRange.end) return true;
    if (dateRange.start && t.date < dateRange.start) return false;
    if (dateRange.end && t.date > dateRange.end) return false;
    return true;
  });

  // Calculate summary statistics
  const income = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = income - expenses;

  // Group transactions by category
  const categorySummary = filteredTransactions.reduce((acc, t) => {
    const key = `${t.category}-${t.type}`;
    if (!acc[key]) {
      acc[key] = { category: t.category, type: t.type, amount: 0, count: 0 };
    }
    acc[key].amount += t.amount;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { category: string; type: TransactionType; amount: number; count: number }>);

  const categoryData = Object.values(categorySummary).sort((a, b) => b.amount - a.amount);

  // Export to CSV
  const exportToCSV = () => {
    setIsExporting(true);

    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Donor Name', 'Donor Contact'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.date,
        `"${t.description}"`,
        t.type,
        `"${t.category}"`,
        t.amount,
        `"${t.donorName || ''}"`,
        `"${t.donorContact || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  // Export to PDF (simplified - would need a PDF library for full implementation)
  const exportToPDF = () => {
    setIsExporting(true);

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const reportHTML = `
      <html>
        <head>
          <title>Financial Report - Greater Works City Church</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
            .category-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .category-table th, .category-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .category-table th { background-color: #f2f2f2; }
            .amount { text-align: right; }
            .income { color: green; }
            .expense { color: red; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Greater Works City Church</h1>
            <h2>Financial Report</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            ${dateRange.start || dateRange.end ? `
              <p>Period: ${dateRange.start || 'Beginning'} to ${dateRange.end || 'Present'}</p>
            ` : ''}
          </div>

          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Income:</strong> <span class="income">${formatCurrency(income)}</span></p>
            <p><strong>Total Expenses:</strong> <span class="expense">${formatCurrency(expenses)}</span></p>
            <p><strong>Net Income:</strong> <span class="${netIncome >= 0 ? 'income' : 'expense'}">${formatCurrency(netIncome)}</span></p>
            <p><strong>Transactions:</strong> ${filteredTransactions.length}</p>
          </div>

          <h3>Category Breakdown</h3>
          <table class="category-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th class="amount">Amount</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              ${categoryData.map(cat => `
                <tr>
                  <td>${cat.category}</td>
                  <td>${cat.type}</td>
                  <td class="amount ${cat.type === 'Income' ? 'income' : 'expense'}">${formatCurrency(cat.amount)}</td>
                  <td>${cat.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Detailed Transactions</h3>
          <table class="category-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Category</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${formatDate(t.date)}</td>
                  <td>${t.description}</td>
                  <td>${t.type}</td>
                  <td>${t.category}</td>
                  <td class="amount ${t.type === 'Income' ? 'income' : 'expense'}">${formatCurrency(t.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    setIsExporting(false);
  };

  // Export to Excel (simplified - creates CSV that can be opened in Excel)
  const exportToExcel = () => {
    // For now, we'll create a CSV that Excel can open
    // In a full implementation, you'd use a library like xlsx or exceljs
    exportToCSV();
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Financial Reports</h2>
        <p className="text-slate-600 mb-6">
          Generate and export detailed financial reports for your church's records and compliance needs.
        </p>

        {/* Export Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'excel')}
              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={isExporting || filteredTransactions.length === 0}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Report Preview</h3>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-slate-600">Total Income</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(income)}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-slate-600">Total Expenses</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(expenses)}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-slate-600">Net Income</p>
              <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </p>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-slate-600">Transactions</p>
              <p className="text-lg font-bold text-slate-900">{filteredTransactions.length}</p>
            </div>
          </div>

          {/* Category Summary */}
          {categoryData.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-slate-900 mb-2">Category Summary</h4>
              <div className="bg-white rounded border overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Category</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Type</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">Amount</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.slice(0, 10).map((cat, index) => (
                      <tr key={index} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-sm text-slate-900">{cat.category}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{cat.type}</td>
                        <td className={`px-4 py-2 text-sm text-right font-medium ${
                          cat.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(cat.amount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">{cat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction Count */}
          <div className="text-sm text-slate-600">
            {filteredTransactions.length === transactions.length ? (
              <p>Showing all {transactions.length} transactions</p>
            ) : (
              <p>Showing {filteredTransactions.length} of {transactions.length} transactions</p>
            )}
            {filteredTransactions.length === 0 && (
              <p className="text-amber-600">No transactions found for the selected date range</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
