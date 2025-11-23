import React, { useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
       {/* Decorative blob */}
       <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
       
       <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
             </div>
             <div>
               <h3 className="text-lg font-bold">Gemini Advisor</h3>
               <p className="text-indigo-200 text-sm">AI-Powered Financial Insights</p>
             </div>
          </div>
          
          <button
            onClick={handleGetAdvice}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              loading 
                ? 'bg-indigo-800 text-indigo-300 cursor-wait' 
                : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg'
            }`}
          >
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </button>
        </div>

        <div className="min-h-[100px] text-indigo-100/90 text-sm leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="animate-pulse">Crunching the numbers...</p>
            </div>
          ) : advice ? (
            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
          ) : (
            <p className="italic text-indigo-300/60">
              Click the button above to let Gemini analyze your spending patterns and provide actionable savings tips.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
