import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import FirebaseSetupScreen from './components/FirebaseSetupScreen';
import Header from './components/Header';
import Summary from './components/Summary';
import AddTransactionForm from './components/AddTransactionForm';
import AddDonationForm from './components/AddDonationForm';
import AddMemberForm from './components/AddMemberForm';
import TransactionList from './components/TransactionList';
import MemberList from './components/MemberList';
import CategoryChart from './components/CategoryChart';
import Reports from './components/Reports';
import Budgets from './components/Budgets';
import BudgetStatus from './components/BudgetStatus';
import BackupRestore from './components/BackupRestore';
import MemberProfile from './components/MemberProfile';
import Dashboard from './components/Dashboard';
import DonorManagement from './components/DonorManagement';
import UserManagement from './components/UserManagement';
import MyProfile from './components/MyProfile';
import AnnouncementsPage from './pages/AnnouncementsPage';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useCategories } from './hooks/useCategories';
import { useMembers } from './hooks/useMembers';
import { isConfigured } from './firebase';
import './src/registerSW';

const MainApp: React.FC = () => {
  const {
    transactions,
    addTransaction,
    addMultipleTransactions,
    deleteTransaction,
    editTransaction,
    totalIncome,
    totalExpenses,
    balance,
    expenseChartData,
    incomeChartData,
  } = useTransactions();

  const { getBudgetsForMonth, setBudgetsForMonth } = useBudgets();
  const { expenseCategories, addExpenseCategory } = useCategories();
  const { members, addMember, deleteMember, editMember } = useMembers();

  const [view, setView] = useState<'dashboard' | 'reports' | 'budgets' | 'transactions' | 'donations' | 'members' | 'memberProfile' | 'donors' | 'users' | 'myProfile' | 'announcements'>('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthBudgets = getBudgetsForMonth(currentMonth);

  const handleViewProfile = (memberId: string) => {
    setSelectedMemberId(memberId);
    setView('memberProfile');
  };

  const handleBackToMembers = () => {
    setSelectedMemberId(null);
    setView('members');
  };

  const renderView = () => {
    switch(view) {
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'budgets':
        return <Budgets
                  getBudgetsForMonth={getBudgetsForMonth}
                  setBudgetsForMonth={setBudgetsForMonth}
                  expenseCategories={expenseCategories}
                  addExpenseCategory={addExpenseCategory}
                />;
      case 'transactions':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddTransactionForm
                onAddTransaction={addTransaction}
                expenseCategories={expenseCategories}
              />
            </div>
            <div className="lg:col-span-2">
              <TransactionList
                transactions={transactions}
                onDeleteTransaction={deleteTransaction}
                onEditTransaction={editTransaction}
                onImportTransactions={addMultipleTransactions}
                expenseCategories={expenseCategories}
              />
            </div>
          </div>
        );
      case 'donations':
        const donationTransactions = transactions.filter(t => t.type === 'Income');
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddDonationForm onAddTransaction={addTransaction} />
            </div>
            <div className="lg:col-span-2">
              <TransactionList
                transactions={donationTransactions}
                onDeleteTransaction={deleteTransaction}
                onEditTransaction={editTransaction}
                onImportTransactions={addMultipleTransactions}
                expenseCategories={expenseCategories}
              />
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddMemberForm onAddMember={addMember} />
            </div>
            <div className="lg:col-span-2">
              <MemberList
                members={members}
                onDeleteMember={deleteMember}
                onEditMember={editMember}
                onViewProfile={handleViewProfile}
              />
            </div>
          </div>
        );
      case 'donors':
        return <DonorManagement transactions={transactions} />;
      case 'users':
        return <UserManagement />;
      case 'myProfile':
        return <MyProfile members={members} transactions={transactions} onBack={() => setView('dashboard')} onEditMember={editMember} />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'memberProfile':
        const selectedMember = members.find(m => m.id === selectedMemberId);
        return selectedMember ? (
          <MemberProfile
            member={selectedMember}
            transactions={transactions}
            onBack={handleBackToMembers}
            onEditMember={editMember}
          />
        ) : null;
      case 'dashboard':
      default:
        return (
          <Dashboard
            transactions={transactions}
            budgets={currentMonthBudgets}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header currentView={view} onViewChange={setView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // Show setup screen if Firebase is not configured
  if (!isConfigured) {
    return <FirebaseSetupScreen />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard>
          <MainApp />
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
