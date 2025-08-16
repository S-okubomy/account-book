import React, { useState, useEffect } from 'react';
import { Category, CategoryExpenseType, ExpenseType } from '../types.ts';

const fixedCategories = Object.keys(Category).filter(key => CategoryExpenseType[Category[key]] === ExpenseType.Fixed).map(key => Category[key]);

export const DefaultFixedCostEditModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(fixedCategories[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setAmount(String(itemToEdit.amount));
        setCategory(itemToEdit.category);
        setDescription(itemToEdit.description);
      } else {
        setAmount('');
        setCategory(fixedCategories[0]);
        setDescription('');
      }
      setError('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('有効な正の金額を入力してください。');
      return;
    }

    onSave({
      amount: parsedAmount,
      category,
      description: description.trim(),
    });
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{itemToEdit ? '固定費を編集' : '固定費を追加'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="dfc-amount" className="block text-sm font-medium text-slate-600 dark:text-slate-300">金額</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="amount"
                  id="dfc-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-3 pr-7 py-2 text-right focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="0"
                  required
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-slate-500 sm:text-sm">円</span></div>
              </div>
            </div>
            <div>
              <label htmlFor="dfc-category" className="block text-sm font-medium text-slate-600 dark:text-slate-300">カテゴリ</label>
              <select
                id="dfc-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              >
                {fixedCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
             <div>
              <label htmlFor="dfc-description" className="block text-sm font-medium text-slate-600 dark:text-slate-300">内容</label>
              <input
                type="text"
                name="description"
                id="dfc-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                placeholder="例：家賃 (任意)"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">キャンセル</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};
