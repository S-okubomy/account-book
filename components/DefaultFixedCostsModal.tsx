import React from 'react';

export const DefaultFixedCostsModal = ({ isOpen, onClose, onEdit, onDelete, onAddNew, defaultFixedCosts, categoryIcons }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">固定費設定</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          ここで設定した項目は、毎月の支出として自動的に計上されます。
        </p>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {defaultFixedCosts.length > 0 ? (
            defaultFixedCosts.map(item => (
              <div key={item.id} className="p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-teal-500">{categoryIcons[item.category]}</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{item.description || item.category}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.amount.toLocaleString('ja-JP')}円
                      {item.description && ` • ${item.category}`}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <button onClick={() => onEdit(item)} className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                  <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">設定済みの固定費はありません。</p>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={onAddNew}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
          >
            新規追加
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
