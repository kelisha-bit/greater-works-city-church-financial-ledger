import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES } from '../constants';
import ImportTransactionsModal from './ImportTransactionsModal';
import DonorReceipt from './DonorReceipt';
import Pagination from './Pagination';
import ConfirmationDialog from './ConfirmationDialog';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => Promise<void>;
  onEditTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  onImportTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  expenseCategories: string[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC', // To avoid off-by-one day errors
  });
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction, onEditTransaction, onImportTransactions, expenseCategories }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quickRange, setQuickRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Default items per page
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatISO = (d: Date) => d.toISOString().slice(0, 10);
  const setRangeAll = () => {
    setStartDate('');
    setEndDate('');
  };
  const setRangeToday = () => {
    const now = new Date();
    const iso = formatISO(now);
    setStartDate(iso);
    setEndDate(iso);
  };
  const setRangeWeek = () => {
    const now = new Date();
    const dow = now.getUTCDay(); // 0 = Sunday
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow));
    setStartDate(formatISO(start));
    setEndDate(formatISO(now));
  };
  const setRangeMonth = () => {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    setStartDate(formatISO(start));
    setEndDate(formatISO(now));
  };

  const handleQuickRangeChange = (value: 'all' | 'today' | 'week' | 'month' | 'custom') => {
    setQuickRange(value);
    if (value === 'all') return setRangeAll();
    if (value === 'today') return setRangeToday();
    if (value === 'week') return setRangeWeek();
    if (value === 'month') return setRangeMonth();
    // custom: leave dates as-is
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm(transaction);

    // Focus the first editable field after a short delay to ensure DOM updates
    setTimeout(() => {
      const firstInput = document.querySelector(`#edit-date-${transaction.id}`) as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (editingId && editForm.description && editForm.amount && editForm.date && editForm.type && editForm.category) {
      // Build update object, excluding undefined donor fields for expense transactions
      const updates: any = {
        description: editForm.description,
        amount: editForm.amount,
        date: editForm.date,
        type: editForm.type,
        category: editForm.category,
      };

      // Only include donor fields for income transactions
      if (editForm.type === TransactionType.INCOME) {
        if (editForm.donorName) updates.donorName = editForm.donorName;
        if (editForm.donorContact) updates.donorContact = editForm.donorContact;
      }

      await onEditTransaction(editingId, updates);
      setEditingId(null);
      setEditForm({});
    } else {
      // Show validation feedback
      const errorMsg = document.getElementById('edit-error-msg');
      if (errorMsg) {
        errorMsg.textContent = 'Please fill in all required fields.';
        errorMsg.classList.remove('opacity-0');
        setTimeout(() => errorMsg.classList.add('opacity-0'), 3000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleEditChange = (field: keyof Transaction, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const renderDonorName = (transaction: Transaction) => {
    if (editingId === transaction.id) {
      return (
        <input
          type="text"
          value={editForm.donorName || ''}
          onChange={(e) => handleEditChange('donorName', e.target.value)}
          placeholder="Donor name"
          className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      );
    }
    return transaction.donorName || '-';
  };

  const renderDonorContact = (transaction: Transaction) => {
    if (editingId === transaction.id) {
      return (
        <input
          type="text"
          value={editForm.donorContact || ''}
          onChange={(e) => handleEditChange('donorContact', e.target.value)}
          placeholder="Contact info"
          className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      );
    }
    return transaction.donorContact || '-';
  };

  const filesToReceipts = (files: File[]): Promise<{ id: string; name: string; mimeType: string; dataUrl: string; }[]> => {
    return Promise.all(files.map(file =>
      new Promise<{ id: string; name: string; mimeType: string; dataUrl: string; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          dataUrl: String(reader.result),
        });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      })
    ));
  };

  const handleAttachReceipts = async (t: Transaction, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    try {
      const newReceipts = await filesToReceipts(files);
      const merged = [...(t.receipts || []), ...newReceipts];
      await onEditTransaction(t.id, { receipts: merged });
    } catch {
      // swallow read errors for now
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteTransaction(transactionToDelete.id);
      setShowDeleteConfirmation(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setTransactionToDelete(null);
  };

  // Get filtered transactions
  const filteredTransactions = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return transactions.filter((t) => {
      const matchesSearch = !lowercasedTerm
        || t.description.toLowerCase().includes(lowercasedTerm)
        || t.category.toLowerCase().includes(lowercasedTerm);

      // Dates are in YYYY-MM-DD; string compare is safe for range checks
      const meetsStart = !startDate || t.date >= startDate;
      const meetsEnd = !endDate || t.date <= endDate;

      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchesSearch && meetsStart && meetsEnd && matchesCategory;
    });
  }, [transactions, searchTerm, startDate, endDate, categoryFilter]);

  const { filteredIncome, filteredExpenses, filteredNet } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of filteredTransactions) {
      if (t.type === TransactionType.INCOME) income += t.amount;
      else expenses += t.amount;
    }
    return { filteredIncome: income, filteredExpenses: expenses, filteredNet: income - expenses };
  }, [filteredTransactions]);

  // Show loading state when filters are being applied
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, startDate, endDate, categoryFilter, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Get current page transactions
  const currentTransactions = useMemo(() => {
    const indexOfLastTransaction = currentPage * itemsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
    return filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, categoryFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  const printDonorReceipt = (transaction: Transaction) => {
    if (!transaction.donorName && transaction.type !== TransactionType.INCOME) return;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const receiptHTML = `
      <html>
        <head>
          <title>Donation Receipt - ${transaction.donorName || 'Anonymous'}</title>
          <style>
            @media print {
              * {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
            body { font-family: 'Times New Roman', serif; margin: 20px; line-height: 1.6; color: #374151; }
            .header { text-align: center; border-bottom: 2px solid #64748b; padding-bottom: 1rem; margin-bottom: 1.5rem; }
            .title { font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem; }
            .subtitle { color: #6b7280; font-size: 0.875rem; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem; }
            .section { margin-bottom: 1rem; }
            .section-title { font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
            .details { color: #4b5563; }
            .amount { font-weight: bold; color: #059669; }
            .footer { text-align: center; border-top: 2px solid #64748b; padding-top: 1.5rem; }
            .thanks { color: #374151; margin-bottom: 1rem; }
            .small { font-size: 0.75rem; color: #6b7280; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <header class="header">
            <h1 class="title">Greater Works City Church</h1>
            <p class="subtitle">Financial Ledger - Donation Receipt</p>
          </header>

          <div class="grid">
            <div class="section">
              <h3 class="section-title">Donation Details</h3>
              <div class="details">
                <p><strong>Date:</strong> ${formatDate(transaction.date)}</p>
                <p><strong>Description:</strong> ${transaction.description}</p>
                <p><strong>Category:</strong> ${transaction.category}</p>
                <p><strong>Amount:</strong> <span class="amount">${formatCurrency(transaction.amount)}</span></p>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">Donor Information</h3>
              <div class="details">
                <p><strong>Name:</strong> ${transaction.donorName || 'Anonymous'}</p>
                <p><strong>Contact:</strong> ${transaction.donorContact || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <footer class="footer">
            <p class="thanks">
              Thank you for your generous contribution to Greater Works City Church. Your support helps us continue our mission and ministry work.
            </p>
            <p class="small">Transaction ID: ${transaction.id}</p>
            <p class="small">Receipt generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </footer>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };
  
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Error message display */}
        <div id="edit-error-msg" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 opacity-0 transition-opacity duration-300"></div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
        </div>
        <div className="mb-4 space-y-3">
            <div className="relative">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                 </span>
                 <input
                     type="text"
                     placeholder="Search by description or category..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     aria-label="Search transactions"
                 />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                 <div>
                     <label htmlFor="quickRange" className="block text-sm font-medium text-slate-700">Quick range</label>
                     <select
                         id="quickRange"
                         value={quickRange}
                         onChange={(e) => handleQuickRangeChange(e.target.value as any)}
                         className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                         <option value="all">All time</option>
                         <option value="today">Today</option>
                         <option value="week">This week</option>
                         <option value="month">This month</option>
                         <option value="custom">Custom</option>
                     </select>
                 </div>
                 <div>
                     <label htmlFor="categoryFilter" className="block text-sm font-medium text-slate-700">Category</label>
                     <select
                         id="categoryFilter"
                         value={categoryFilter}
                         onChange={(e) => setCategoryFilter(e.target.value)}
                         className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                         <option value="all">All categories</option>
                         {[...new Set([...INCOME_CATEGORIES, ...expenseCategories])].map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                     </select>
                 </div>
                 <div>
                     <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start date</label>
                     <input
                         id="startDate"
                         type="date"
                         value={startDate}
                         onChange={(e) => { setStartDate(e.target.value); setQuickRange('custom'); }}
                         className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     />
                 </div>
                 <div>
                     <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">End date</label>
                     <input
                         id="endDate"
                         type="date"
                         value={endDate}
                         onChange={(e) => { setEndDate(e.target.value); setQuickRange('custom'); }}
                         className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     />
                 </div>
                 <div>
                     <label htmlFor="itemsPerPage" className="block text-sm font-medium text-slate-700">Items per page</label>
                     <select
                         id="itemsPerPage"
                         value={itemsPerPage}
                         onChange={(e) => setItemsPerPage(Number(e.target.value))}
                         className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                         <option value={10}>10</option>
                         <option value={25}>25</option>
                         <option value={50}>50</option>
                         <option value={100}>100</option>
                     </select>
                 </div>
             </div>
        </div>
        {/* Filtered totals summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Filtered Income</h3>
            <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(filteredIncome)}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Filtered Expenses</h3>
            <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(filteredExpenses)}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Filtered Net</h3>
            <p className={`text-2xl font-bold mt-1 ${filteredNet >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(filteredNet)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-slate-600">Loading transactions...</span>
            </div>
          ) : transactions.length > 0 ? (
            filteredTransactions.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Donor Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Donor Contact</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Receipts</th>
                    <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {paginatedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {editingId === t.id ? (
                            <input
                              id={`edit-date-${t.id}`}
                              type="date"
                              value={editForm.date || ''}
                              onChange={(e) => handleEditChange('date', e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                              autoFocus
                            />
                          ) : (
                            <span onClick={() => startEdit(t)} className="cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors duration-200">
                              {formatDate(t.date)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {editingId === t.id ? (
                            <input
                              type="text"
                              value={editForm.description || ''}
                              onChange={(e) => handleEditChange('description', e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                              placeholder="Description"
                            />
                          ) : (
                            <span onClick={() => startEdit(t)} className="cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors duration-200">
                              {t.description}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {editingId === t.id ? (
                            <select
                              value={editForm.type || ''}
                              onChange={(e) => {
                                handleEditChange('type', e.target.value as TransactionType);
                                const categories = e.target.value === TransactionType.INCOME ? INCOME_CATEGORIES : expenseCategories;
                                handleEditChange('category', categories[0]);
                              }}
                              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value={TransactionType.INCOME}>Income</option>
                              <option value={TransactionType.EXPENSE}>Expense</option>
                            </select>
                          ) : (
                            <span onClick={() => startEdit(t)} className="cursor-pointer hover:bg-slate-100 p-1 rounded">
                              {t.type}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {editingId === t.id ? (
                            <select
                              value={editForm.category || ''}
                              onChange={(e) => handleEditChange('category', e.target.value)}
                              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              {(editForm.type === TransactionType.INCOME ? INCOME_CATEGORIES : expenseCategories).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          ) : (
                            <span onClick={() => startEdit(t)} className="cursor-pointer hover:bg-slate-100 p-1 rounded">
                              {t.category}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {renderDonorName(t)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {renderDonorContact(t)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                          {editingId === t.id ? (
                            <input
                              type="number"
                              value={editForm.amount || ''}
                              onChange={(e) => handleEditChange('amount', parseFloat(e.target.value) || 0)}
                              step="0.01"
                              min="0"
                              className="w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                            />
                          ) : (
                            <span onClick={() => startEdit(t)} className="cursor-pointer hover:bg-slate-100 p-1 rounded">
                              {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center px-2 py-1 rounded border border-slate-300 text-xs cursor-pointer hover:bg-slate-50">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                className="hidden"
                                onChange={(e) => handleAttachReceipts(t, e.target.files)}
                              />
                              Attach
                            </label>
                            {t.receipts && t.receipts.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {t.receipts.map(r => (
                                  <a key={r.id} href={r.dataUrl} download={r.name} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs truncate max-w-[8rem]" title={r.name}>
                                    {r.name}
                                  </a>
                                ))}
                              </div>
                            )}
                            {t.type === TransactionType.INCOME && (
                              <div className="flex items-center gap-1">
                                <span className={`px-2 py-1 rounded text-xs ${t.smsStatus === 'delivered' ? 'bg-green-100 text-green-800' : t.smsStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {t.smsStatus || 'Not sent'}
                                </span>
                                <button 
                                  onClick={() => resendSmsReceipt(t.id)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  aria-label="Resend SMS receipt"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingId === t.id ? (
                            <div className="flex gap-1">
                              <button onClick={saveEdit} className="text-green-600 hover:text-green-900" aria-label="Save changes">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button onClick={cancelEdit} className="text-slate-600 hover:text-slate-900" aria-label="Cancel edit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              {t.type === TransactionType.INCOME && t.donorName && (
                                <button onClick={() => printDonorReceipt(t)} className="text-purple-600 hover:text-purple-900" aria-label={`Print receipt for ${t.donorName}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6" />
                                  </svg>
                                </button>
                              )}
                              <button onClick={() => startEdit(t)} className="text-blue-600 hover:text-blue-900" aria-label={`Edit transaction ${t.description}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteClick(t)} className="text-red-600 hover:text-red-900" aria-label={`Delete transaction ${t.description}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <p className="text-center text-slate-500 py-8">No transactions match your filters.</p>
            )
          ) : (
            <p className="text-center text-slate-500 py-8">No transactions yet. Add one to get started!</p>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 sm:px-6">
            <div className="flex items-center text-sm text-slate-700">
              <p>
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> of{' '}
                <span className="font-medium">{filteredTransactions.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNumber > totalPages) return null;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      {isImportModalOpen && (
        <ImportTransactionsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={onImportTransactions}
          expenseCategories={expenseCategories}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction "${transactionToDelete?.description}"? This action cannot be undone and will permanently remove the transaction data.`}
        confirmText="Delete Transaction"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        isLoading={isDeleting}
        type="danger"
      />
    </>
  );
};

export default TransactionList;
