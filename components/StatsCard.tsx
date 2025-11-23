import React from 'react';

interface StatsCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trendColor: 'green' | 'red' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, amount, icon, trendColor }) => {
  const colorClasses = {
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-rose-600 bg-rose-50',
    blue: 'text-blue-600 bg-blue-50',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${colorClasses[trendColor]}`}>
        {icon}
      </div>
    </div>
  );
};
