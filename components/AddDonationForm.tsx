import React, { useState } from 'react';
import { Transaction, UserRole } from '../types';
import { INCOME_CATEGORIES } from '../constants';
import { useMembers } from '../hooks/useMembers';
import { useAuth } from '../context/AuthContext';

interface AddDonationFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddDonationForm: React.FC<AddDonationFormProps> = ({ onAddTransaction }) => {
  const { members } = useMembers();
  const { userRole } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [donorName, setDonorName] = useState('');
  const [donorContact, setDonorContact] = useState('');
  const [error, setError] = useState('');

  // Check if user has permission to add donations
  if (userRole === UserRole.VIEWER) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Record Individual Donation</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Access Restricted:</strong> You need ADMIN or EDITOR permissions to record donations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!description || !amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please fill in all fields with valid values.');
      return;
    }
    setError('');

    onAddTransaction({
      description,
      amount: numericAmount,
      date,
      type: 'Income',
      category,
      ...(donorName && { donorName }),
      ...(donorContact && { donorContact }),
    });

    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(INCOME_CATEGORIES[0]);
    setDonorName('');
    setDonorContact('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Record Individual Donation</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Weekly Tithe, Thanksgiving Offering"
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Donation Type</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="donorName" className="block text-sm font-medium text-slate-700">Donor Name</label>
          <select
            id="donorName"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a member</option>
            {members.map(member => (
              <option key={member.id} value={member.name}>{member.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="donorContact" className="block text-sm font-medium text-slate-700">Donor Contact</label>
          <input
            type="text"
            id="donorContact"
            value={donorContact}
            onChange={(e) => setDonorContact(e.target.value)}
            placeholder="Phone, email, or other contact"
            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Record Donation
        </button>
      </form>
    </div>
  );
};

export default AddDonationForm;
