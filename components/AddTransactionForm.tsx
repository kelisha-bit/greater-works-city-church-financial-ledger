import React, { useState } from 'react';
import { Transaction, TransactionType, UserRole, Member } from '../types';
import { INCOME_CATEGORIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { transactionSchema, TransactionFormData } from '../validation';
import { useMembers } from '../hooks/useMembers';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  expenseCategories: string[];
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction, expenseCategories }) => {
  const { userRole } = useAuth();
  const { members } = useMembers();

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    reset,
    isValid
  } = useFormValidation<TransactionFormData>({
    schema: transactionSchema,
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      category: expenseCategories[0] || '',
      description: '',
      amount: 0,
      donorName: '',
      donorContact: '',
      selectedMemberId: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has permission to add transactions
  if (userRole === UserRole.VIEWER) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Access Restricted:</strong> You need ADMIN or EDITOR permissions to add new transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = values.type === TransactionType.INCOME ? INCOME_CATEGORIES : expenseCategories;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as TransactionType;
    setValue('type', newType);
    // Update category when type changes
    setValue('category', newType === TransactionType.INCOME ? INCOME_CATEGORIES[0] : expenseCategories[0]);
    // Clear member selection when type changes to expense
    if (newType === TransactionType.EXPENSE) {
      setValue('selectedMemberId', '');
      setValue('donorName', '');
      setValue('donorContact', '');
    }
  };

  const handleMemberSelection = (memberId: string) => {
    setValue('selectedMemberId', memberId);

    if (memberId) {
      const selectedMember = members.find(m => m.id === memberId);
      if (selectedMember) {
        setValue('donorName', selectedMember.name);
        setValue('donorContact', selectedMember.email || selectedMember.phone || '');
      }
    } else {
      setValue('donorName', '');
      setValue('donorContact', '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    Object.keys(values).forEach(key => {
      setTouched(key as keyof TransactionFormData);
    });

    const validation = validate();
    if (!validation.success) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        description: validation.data!.description,
        amount: validation.data!.amount,
        date: validation.data!.date,
        type: validation.data!.type,
        category: validation.data!.category,
        ...(validation.data!.type === TransactionType.INCOME && {
          donorName: validation.data!.donorName,
          donorContact: validation.data!.donorContact,
          donorMemberId: validation.data!.selectedMemberId || undefined
        })
      };

      await onAddTransaction(transactionData);
      reset();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: keyof TransactionFormData) => {
    return touched[fieldName] ? errors[fieldName as string] : '';
  };

  // Common input field styling
  const getInputClassName = (fieldName: keyof TransactionFormData) => {
    return `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
      getFieldError(fieldName)
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
    }`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Add New Transaction</h2>
        
        {/* Transaction Type Toggle */}
        <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Transaction type">
          <button
            type="button"
            onClick={() => handleTypeChange({ target: { value: TransactionType.INCOME } } as React.ChangeEvent<HTMLSelectElement>)}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              values.type === TransactionType.INCOME
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange({ target: { value: TransactionType.EXPENSE } } as React.ChangeEvent<HTMLSelectElement>)}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              values.type === TransactionType.EXPENSE
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Details Section */}
        <fieldset className="border border-slate-200 rounded-md p-4">
          <legend className="text-sm font-medium text-slate-700 px-2">Transaction Details</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={values.date || ''}
                onChange={(e) => setValue('date', e.target.value)}
                onBlur={() => setTouched('date')}
                className={getInputClassName('date')}
                aria-required="true"
              />
              {getFieldError('date') && (
                <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('date')}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={values.amount || ''}
                  onChange={(e) => setValue('amount', parseFloat(e.target.value) || 0)}
                  onBlur={() => setTouched('amount')}
                  step="0.01"
                  min="0"
                  className={`pl-7 ${getInputClassName('amount')}`}
                  placeholder="0.00"
                  aria-required="true"
                />
              </div>
              {getFieldError('amount') && (
                <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('amount')}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              value={values.description || ''}
              onChange={(e) => setValue('description', e.target.value)}
              onBlur={() => setTouched('description')}
              className={getInputClassName('description')}
              placeholder="Enter transaction description"
              aria-required="true"
            />
            {getFieldError('description') && (
              <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('description')}</p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={values.category || ''}
              onChange={(e) => setValue('category', e.target.value)}
              onBlur={() => setTouched('category')}
              className={getInputClassName('category')}
              aria-required="true"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {getFieldError('category') && (
              <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('category')}</p>
            )}
          </div>
        </fieldset>

        {/* Donor Information Section - Only shown for Income transactions */}
        {values.type === TransactionType.INCOME && (
          <fieldset className="border border-slate-200 rounded-md p-4">
            <legend className="text-sm font-medium text-slate-700 px-2">Donor Information</legend>
            
            <div className="mb-4">
              <label htmlFor="selectedMemberId" className="block text-sm font-medium text-slate-700">
                Link to Member
              </label>
              <select
                id="selectedMemberId"
                value={values.selectedMemberId || ''}
                onChange={(e) => handleMemberSelection(e.target.value)}
                onBlur={() => setTouched('selectedMemberId')}
                className={getInputClassName('selectedMemberId')}
              >
                <option value="">Select a member (optional)</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.email ? `(${member.email})` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-slate-500">
                Selecting a member will auto-fill donor information
              </p>
              {getFieldError('selectedMemberId') && (
                <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('selectedMemberId')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="donorName" className="block text-sm font-medium text-slate-700">
                  Donor Name
                </label>
                <input
                  type="text"
                  id="donorName"
                  value={values.donorName || ''}
                  onChange={(e) => setValue('donorName', e.target.value)}
                  onBlur={() => setTouched('donorName')}
                  className={getInputClassName('donorName')}
                  placeholder="Enter donor's name"
                />
                {getFieldError('donorName') && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('donorName')}</p>
                )}
              </div>

              <div>
                <label htmlFor="donorContact" className="block text-sm font-medium text-slate-700">
                  Donor Contact
                </label>
                <input
                  type="text"
                  id="donorContact"
                  value={values.donorContact || ''}
                  onChange={(e) => setValue('donorContact', e.target.value)}
                  onBlur={() => setTouched('donorContact')}
                  className={getInputClassName('donorContact')}
                  placeholder="Phone, email, or other contact"
                />
                {getFieldError('donorContact') && (
                  <p className="mt-1 text-sm text-red-600" role="alert">{getFieldError('donorContact')}</p>
                )}
              </div>
            </div>
          </fieldset>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`px-6 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              isValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Transaction...
              </span>
            ) : (
              'Add Transaction'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionForm;
