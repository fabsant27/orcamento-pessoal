import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary } from './types';
import { StatsCard } from './components/StatsCard';
import { TransactionForm } from './components/TransactionForm';
import { FinancialChart } from './components/FinancialChart';
import { AIAdvisor } from './components/AIAdvisor';

const STORAGE_KEY = 'finglow_transactions_v1';
const STORAGE_KEY_BALANCES = 'finglow_initial_balances_v1';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalances, setInitialBalances] = useState<Record<string, number>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState('');
  
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // Initialize to the first day of the current month
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Load transactions from local storage on mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem(STORAGE_KEY);
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }

    const storedBalances = localStorage.getItem(STORAGE_KEY_BALANCES);
    if (storedBalances) {
      try {
        setInitialBalances(JSON.parse(storedBalances));
      } catch (e) {
        console.error("Failed to parse initial balances", e);
      }
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(initialBalances));
  }, [initialBalances]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setIsEditingBalance(false);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setIsEditingBalance(false);
  };

  // Helper to get current month key for initial balances
  const currentMonthKey = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }, [currentDate]);

  const currentInitialBalance = initialBalances[currentMonthKey] || 0;

  // Filter transactions based on selected Month/Year
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const [year, month] = t.date.split('-').map(Number);
      // month in date string is 1-12, getMonth() returns 0-11
      return year === currentDate.getFullYear() && (month - 1) === currentDate.getMonth();
    });
  }, [transactions, currentDate]);

  const summary: FinancialSummary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: currentInitialBalance + income - expense
    };
  }, [filteredTransactions, currentInitialBalance]);

  const formattedMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  // Helper to determine initial date for the form based on current view
  const getInitialFormDate = () => {
    const now = new Date();
    if (now.getMonth() === currentDate.getMonth() && now.getFullYear() === currentDate.getFullYear()) {
      return now.toISOString().split('T')[0];
    }
    // Return 1st of the viewed month
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const handleSaveInitialBalance = () => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val)) {
      setInitialBalances(prev => ({
        ...prev,
        [currentMonthKey]: val
      }));
    }
    setIsEditingBalance(false);
  };

  const startEditingBalance = () => {
    setTempBalance(currentInitialBalance === 0 ? '' : currentInitialBalance.toString());
    setIsEditingBalance(true);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              F
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FinGlow AI</h1>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-slate-900/20 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Transaction</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Date Controls & Initial Balance */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          
          {/* Month Selector */}
          <div className="flex items-center justify-between w-full md:w-auto md:min-w-[300px] p-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            
            <h2 className="text-lg font-semibold text-slate-800 text-center mx-4">
              {formattedMonth}
            </h2>

            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          {/* Divider on desktop */}
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>

          {/* Initial Balance Input */}
          <div className="flex items-center space-x-3 px-4 py-2 w-full md:w-auto justify-center md:justify-end">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Starting Balance:</span>
            
            {isEditingBalance ? (
              <div className="flex items-center space-x-2 animate-in fade-in zoom-in duration-200">
                 <div className="relative">
                    <span className="absolute left-2 top-1.5 text-slate-400 text-sm">$</span>
                    <input 
                      type="number" 
                      value={tempBalance}
                      onChange={(e) => setTempBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-32 pl-6 pr-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInitialBalance();
                        if (e.key === 'Escape') setIsEditingBalance(false);
                      }}
                    />
                 </div>
                 <button 
                  onClick={handleSaveInitialBalance}
                  className="p-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </button>
                 <button 
                  onClick={() => setIsEditingBalance(false)}
                  className="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
            ) : (
              <button 
                onClick={startEditingBalance}
                className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
              >
                <span className="font-semibold text-slate-700">
                  ${currentInitialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Balance" 
            amount={summary.balance} 
            trendColor={summary.balance >= 0 ? 'blue' : 'red'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
          />
          <StatsCard 
            title="Income" 
            amount={summary.totalIncome} 
            trendColor="green"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>}
          />
          <StatsCard 
            title="Expenses" 
            amount={summary.totalExpense} 
            trendColor="red"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Advisor Section */}
            <section>
              <AIAdvisor transactions={filteredTransactions} />
            </section>

            {/* Transactions List */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{filteredTransactions.length} items</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    </div>
                    <p className="text-slate-500">No transactions for {formattedMonth}.</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredTransactions.map((t) => (
                      <div key={t.id} className="group px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {t.type === TransactionType.INCOME ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{t.description}</p>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span>{t.date}</span>
                              <span>•</span>
                              <span>{t.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toFixed(2)}
                          </span>
                          <button 
                            onClick={() => deleteTransaction(t.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                            title="Delete transaction"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Expenses by Category</h3>
              <FinancialChart transactions={filteredTransactions} />
            </section>

             <section className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                <p className="text-blue-100 text-sm opacity-90">
                  Try the "Gemini Advisor" on the left to analyze your spending habits for {formattedMonth} and find hidden savings opportunities!
                </p>
             </section>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isFormOpen && (
        <TransactionForm 
          onAddTransaction={addTransaction} 
          onClose={() => setIsFormOpen(false)} 
          initialDate={getInitialFormDate()}
        />
      )}
    </div>
  );
};

export default App;