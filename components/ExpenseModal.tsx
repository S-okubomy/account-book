import React, { useState, useEffect } from 'react';
import { Category } from '../types.ts';

export const ExpenseModal = ({ isOpen, onClose, onSave, expenseToEdit, initialData }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(Category.Food);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (expenseToEdit) {
      setAmount(String(expenseToEdit.amount));
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setDate(expenseToEdit.date);
      setError('');
    } else {
      // Pre-fill with initial data if available, otherwise reset
      setAmount(String(initialData?.amount || ''));
      setCategory(initialData?.category || Category.Food);
      setDescription(initialData?.description || '');
      setDate(initialData?.date || new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [expenseToEdit, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('有効な正の金額を入力してください。');
      return;
    }
    if (!description.trim()) {
      setError('内容を入力してください。');
      return;
    }

    onSave({
      amount: parsedAmount,
      category,
      description,
      date,
    });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{expenseToEdit ? '支出を編集' : '支出を追加'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="expense-amount" className="block text-sm font-medium text-slate-600 dark:text-slate-300">金額</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="amount"
                  id="expense-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-3 pr-7 py-2 text-right focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="0"
                  required
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate-500 sm:text-sm">円</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="expense-category" className="block text-sm font-medium text-slate-600 dark:text-slate-300">カテゴリ</label>
              <select
                id="expense-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
             <div>
              <label htmlFor="expense-description" className="block text-sm font-medium text-slate-600 dark:text-slate-300">内容</label>
              <input
                type="text"
                name="description"
                id="expense-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                placeholder="例：友人とのコーヒー"
                required
              />
            </div>
            <div>
              <label htmlFor="expense-date" className="block text-sm font-medium text-slate-600 dark:text-slate-300">日付</label>
              <input
                type="date"
                name="date"
                id="expense-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                required
              />
            </div>
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
              支出を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};