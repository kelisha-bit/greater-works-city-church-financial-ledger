
import React from 'react';

interface SummaryProps {
  income: number;
  expenses: number;
  balance: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const SummaryCard: React.FC<{ title: string; amount: number; colorClass: string; icon: string }> = ({
  title,
  amount,
  colorClass,
  icon
}) => (
  <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    {/* Gradient overlay */}
    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass.replace('text-', 'from-').replace('-600', '-500/10')} to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

    {/* Content */}
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass.replace('text-', 'from-').replace('-600', '-500/20')} ${colorClass.replace('text-', 'to-').replace('-600', '-600/10')}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`text-right ${colorClass} opacity-80`}>
          <div className="text-sm font-medium">{title}</div>
        </div>
      </div>

      <div className={`text-3xl font-bold ${colorClass} mb-2`}>
        {formatCurrency(amount)}
      </div>

      {/* Animated pulse for positive values */}
      {amount > 0 && (
        <div className="flex items-center space-x-1 text-sm text-slate-500">
          <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-').replace('-600', '-400')} animate-pulse`} />
          <span>This month</span>
        </div>
      )}
    </div>

    {/* Subtle border gradient */}
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClass.replace('text-', 'from-').replace('-600', '-500/20')} via-transparent ${colorClass.replace('text-', 'to-').replace('-600', '-500/20')} p-[1px] -z-10`}>
      <div className="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl" />
    </div>
  </div>
);

const Summary: React.FC<SummaryProps> = ({ income, expenses, balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <SummaryCard
        title="Total Income"
        amount={income}
        colorClass="text-emerald-600"
        icon="💰"
      />
      <SummaryCard
        title="Total Expenses"
        amount={expenses}
        colorClass="text-red-600"
        icon="💸"
      />
      <SummaryCard
        title="Current Balance"
        amount={balance}
        colorClass={balance >= 0 ? 'text-blue-600' : 'text-red-600'}
        icon={balance >= 0 ? "📈" : "📉"}
      />
    </div>
  );
};

export default Summary;
