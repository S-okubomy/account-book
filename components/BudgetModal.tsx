import React, { useState, useEffect } from 'react';
import { Category, Budgets } from '../types.ts';

export const BudgetModal = ({ isOpen, onClose, onSave, currentBudgets }) => {
  const [budgets, setBudgets] = useState({ overall: 0, categories: {} });

  useEffect(() => {
    if (isOpen) {
      // Ensure all categories exist in the state to avoid uncontrolled component warnings
      const initialCategories = {};
      Object.values(Category).forEach(cat => {
        initialCategories[cat] = currentBudgets?.categories?.[cat] || 0;
      });
      setBudgets({
        overall: currentBudgets?.overall || 0,
        categories: initialCategories
      });
    }
  }, [currentBudgets, isOpen]);

  if (!isOpen) return null;

  const handleBudgetChange = (key, value) => {
    const parsedValue = value === '' ? 0 : parseFloat(value);
    const finalValue = isNaN(parsedValue) ? 0 : parsedValue;

    if (key === 'overall') {
      setBudgets(prev => ({ ...prev, overall: finalValue }));
    } else {
      setBudgets(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [key]: finalValue,
        },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(budgets);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">予算設定</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label htmlFor="overall-budget" className="block text-sm font-medium text-slate-600 dark:text-slate-300">総合予算</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="overall-budget"
                  id="overall-budget"
                  value={budgets.overall || ''}
                  onChange={(e) => handleBudgetChange('overall', e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-3 pr-7 py-2 text-right focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="0"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate-500 sm:text-sm">円</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">カテゴリ別予算</h3>
            {Object.values(Category).map(cat => (
              <div key={cat}>
                <label htmlFor={`budget-${cat}`} className="block text-sm font-medium text-slate-600 dark:text-slate-300">{cat}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name={`budget-${cat}`}
                      id={`budget-${cat}`}
                      value={budgets.categories[cat] || ''}
                      onChange={(e) => handleBudgetChange(cat, e.target.value)}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-3 pr-7 py-2 text-right focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-slate-500 sm:text-sm">円</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
            >
              予算を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
