import React, { useState, useCallback, useEffect } from 'react';
import { getSavingsTips } from '../services/geminiService.ts';

export const AIAssistant = ({ expenses, incomes, currentMonth, formatMarkdown }) => {
  const [tips, setTips] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTips('');
    setError('');
  }, [expenses, incomes, currentMonth]);

  const handleFetchTips = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setTips('');
    try {
      const result = await getSavingsTips(expenses, incomes, currentMonth);
      setTips(result);
    } catch (err) {
      setError('予期せぬエラーが発生しました。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [expenses, incomes, currentMonth]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
             </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">あなたのAI節約先生</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">あなたに合った節約術をAIが提案します。</p>
          <button
            onClick={handleFetchTips}
            disabled={isLoading}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                分析中...
              </>
            ) : (
              'AIのヒントを見る'
            )}
          </button>
        </div>
      </div>
      
      {error && <div className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}
      
      {tips && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={formatMarkdown(tips)} />
        </div>
      )}
    </div>
  );
};