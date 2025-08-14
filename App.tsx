import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category } from './types.ts';
import { ExpenseModal } from './components/ExpenseModal.tsx';
import { IncomeModal } from './components/IncomeModal.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { ReceiptScannerModal } from './components/ReceiptScannerModal.tsx';
import { SalesInfo } from './components/SalesInfo.tsx';
import { analyzeReceipt } from './services/geminiService.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { marked } from 'marked';

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseInitialData, setExpenseInitialData] = useState(null);

  const [incomes, setIncomes] = useState([]);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      const storedIncomes = localStorage.getItem('incomes');
      if (storedIncomes) setIncomes(JSON.parse(storedIncomes));
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expenses to localStorage", error);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('incomes', JSON.stringify(incomes));
    } catch (error) {
      console.error("Failed to save incomes to localStorage", error);
    }
  }, [incomes]);

  const handleAddExpense = useCallback((expenseData) => {
    const newExpense = { ...expenseData, id: new Date().getTime().toString() };
    setExpenses(prev => [...prev, newExpense].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);
  
  const handleUpdateExpense = useCallback((expenseData) => {
    if (!expenseToEdit) return;
    setExpenses(prev => prev.map(exp => exp.id === expenseToEdit.id ? { ...exp, ...expenseData } : exp).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [expenseToEdit]);

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };
  
  const openEditExpenseModal = (expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };
  
  const openAddExpenseModal = () => {
    setExpenseToEdit(null);
    setExpenseInitialData(null);
    setIsExpenseModalOpen(true);
  };
  
  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseInitialData(null);
    setExpenseToEdit(null);
  }

  const handleAddIncome = useCallback((incomeData) => {
    const newIncome = { ...incomeData, id: new Date().getTime().toString() };
    setIncomes(prev => [...prev, newIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleUpdateIncome = useCallback((incomeData) => {
    if (!incomeToEdit) return;
    setIncomes(prev => prev.map(inc => inc.id === incomeToEdit.id ? { ...inc, ...incomeData } : inc).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [incomeToEdit]);

  const handleDeleteIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  const openEditIncomeModal = (income) => {
    setIncomeToEdit(income);
    setIsIncomeModalOpen(true);
  };

  const openAddIncomeModal = () => {
    setIncomeToEdit(null);
    setIsIncomeModalOpen(true);
  };

  const handleReceiptCapture = useCallback(async (imageData) => {
    setIsProcessingReceipt(true);
    try {
        const base64Data = imageData.split(',')[1];
        const parsedData = await analyzeReceipt(base64Data);
        setExpenseInitialData(parsedData);
        setIsScannerOpen(false);
        setIsExpenseModalOpen(true);
    } catch (error) {
        console.error(error);
        alert((error).message || "レシートの解析中にエラーが発生しました。");
    } finally {
        setIsProcessingReceipt(false);
    }
  }, []);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);
  
  const handleFabAddExpense = () => {
    openAddExpenseModal();
  };

  const handleFabScanReceipt = () => {
    setIsScannerOpen(true);
  };

  const handleFabAddIncome = () => {
    openAddIncomeModal();
  };

  const isNextMonthDisabled = useMemo(() => {
    const today = new Date();
    const currentSelectedMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const thisActualMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentSelectedMonthStart.getTime() >= thisActualMonthStart.getTime();
  }, [currentMonth]);


  const { monthlyExpenses, monthlyIncomes, monthlyTotalSpent, monthlyTotalIncome, monthlyBalance, monthlyCategoryData } = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });

    const filteredIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= startOfMonth && incomeDate <= endOfMonth;
    });

    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
    const balance = totalIncome - totalSpent;

    const categoryMap = new Map();
    filteredExpenses.forEach(expense => {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
    });
    const categoryData = Array.from(categoryMap, ([name, value]) => ({ name, value }));

    return { 
        monthlyExpenses: filteredExpenses,
        monthlyIncomes: filteredIncomes,
        monthlyTotalSpent: totalSpent,
        monthlyTotalIncome: totalIncome,
        monthlyBalance: balance,
        monthlyCategoryData: categoryData,
    };
  }, [expenses, incomes, currentMonth]);
  
  const COLORS = ['#0d9488', '#0891b2', '#0ea5e9', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  const categoryIcons = {
    [Category.Food]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18.333 7.825c0-3.321-2.612-4.25-3.083-4.325a.833.833 0 00-.917.917c.017.25.167.833.167 1.417 0 .583-.15 1.167-.167 1.417a.833.833 0 00.917.917c.471-.075 3.083-1 3.083-4.325zM1.667 7.825c0-3.321 2.612-4.25 3.083-4.325a.833.833 0 01.917.917c-.017.25-.167.833-.167 1.417 0 .583.15 1.167.167 1.417a.833.833 0 01-.917.917C4.279 8.825 1.667 8.825 1.667 7.825z" /><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.885 6.512a.833.833 0 01.954-.616c.38.117.953.334 1.542.334s1.162-.217 1.542-.334a.833.833 0 11.568 1.232c-.471.217-.953.488-1.722.488s-1.251-.271-1.722-.488a.833.833 0 01-.662-1.048zM14 11.5a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
    [Category.Transport]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 6.5a.5.5 0 00-.5-.5h-2a.5.5 0 000 1h2a.5.5 0 00.5-.5zM12.879 6.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zM10 6.5a.5.5 0 00-.5.5v2a.5.5 0 101 0v-2a.5.5 0 00-.5-.5zM7.121 6.5a.5.5 0 00-.5.5v2a.5.5 0 101 0v-2a.5.5 0 00-.5-.5zM5 7.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM2 9.5A.5.5 0 012.5 9h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z" clipRule="evenodd" /><path d="M16 3.5A2.5 2.5 0 0013.5 1h-7A2.5 2.5 0 004 3.5v11A2.5 2.5 0 006.5 17h7a2.5 2.5 0 002.5-2.5v-11zM6.5 2a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112.5 2v1h-7V2zM5 14.5A1.5 1.5 0 016.5 13h7a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 15.5v-1z" /></svg>,
    [Category.Shopping]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1h2V3zM15.5 5A1.5 1.5 0 0014 3.5h-1.528A3.001 3.001 0 0010 1 3.001 3.001 0 007.528 3.5H6A1.5 1.5 0 004.5 5v1.5a.5.5 0 001 0V5a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v1.5a.5.5 0 001 0V5z" /><path fillRule="evenodd" d="M4.5 7a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h2zM15.5 7a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h2zM8.5 7a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h2z" clipRule="evenodd" /></svg>,
    [Category.Utilities]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
    [Category.Entertainment]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2-1a1 1 0 00-1 1v2h14V6a1 1 0 00-1-1H4zM3 14a1 1 0 001 1h12a1 1 0 001-1v-4H3v4z" /></svg>,
    [Category.Housing]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a1 1 0 011 1v1H3V5a1 1 0 011-1zm6 0h3a1 1 0 011 1v1h-5V5a1 1 0 011-1zM4 8h12V7H4v1zm0 2h12v-1H4v1zm0 2h12v-1H4v1zm0 2h12v-1H4v1z" clipRule="evenodd" /></svg>,
    [Category.Health]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1H8a1 1 0 000 2h1v1a1 1 0 002 0V6h1a1 1 0 100-2h-1V3a1 1 0 00-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 3a1 1 0 100 2h12a1 1 0 100-2H4zm-1 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    [Category.Other]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-1V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1H5V4zM3 7a2 2 0 012-2h10a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  };
  
  const formatMarkdown = (text) => {
    if (!text) {
      return { __html: '' };
    }
    const html = marked.parse(text, { gfm: true, breaks: true, async: false });
    return { __html: html };
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col">
        <header className="bg-white dark:bg-slate-800/50 shadow-sm sticky top-0 z-30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className='flex items-center space-x-2'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">簡単家計簿</h1>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex items-center justify-center space-x-4 mb-6">
                <button onClick={handlePreviousMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="前の月">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 w-40 text-center tabular-nums">
                    {`${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`}
                </h2>
                <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="次の月">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の収入`}</h3>
                    <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400 mt-2">{monthlyTotalIncome.toLocaleString('ja-JP')}円</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の支出`}</h3>
                    <p className="text-3xl font-bold text-red-500 dark:text-red-400 mt-2">{monthlyTotalSpent.toLocaleString('ja-JP')}円</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の残高`}</h3>
                    <p className={`text-3xl font-bold mt-2 ${monthlyBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{monthlyBalance.toLocaleString('ja-JP')}円</p>
                </div>
            </div>

            <div className="mb-8">
              <SalesInfo formatMarkdown={formatMarkdown} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">今月の支出</h2>
                     {monthlyExpenses.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                        {monthlyExpenses.map(expense => (
                            <li key={expense.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg -mx-4 px-4 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className="text-teal-500">{categoryIcons[expense.category]}</span>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{expense.description}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{expense.date} &bull; {expense.category}</p>
                                </div>
                            </div>
                            <div className='flex items-center space-x-4'>
                                <p className="font-semibold text-base text-red-500">-{expense.amount.toLocaleString('ja-JP')}円</p>
                                <button onClick={() => openEditExpenseModal(expense)} className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                            </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">この月の支出はありません</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">下のボタンから記録を始めましょう。</p>
                        </div>
                    )}
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">今月の収入</h2>
                     {monthlyIncomes.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                        {monthlyIncomes.map(income => (
                            <li key={income.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg -mx-4 px-4 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className="text-emerald-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{income.description}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{income.date}</p>
                                </div>
                            </div>
                            <div className='flex items-center space-x-4'>
                                <p className="font-semibold text-base text-emerald-500">+{income.amount.toLocaleString('ja-JP')}円</p>
                                <button onClick={() => openEditIncomeModal(income)} className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                <button onClick={() => handleDeleteIncome(income.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                            </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                         <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">この月の収入はありません</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">下のボタンから記録を始めましょう。</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">カテゴリ別支出</h2>
                    {monthlyCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={monthlyCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {monthlyCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('ja-JP')}円`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                             <p className="text-slate-500 dark:text-slate-400">この月の支出を追加すると、ここに内訳が表示されます。</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2">
                    <AIAssistant expenses={monthlyExpenses} incomes={monthlyIncomes} currentMonth={currentMonth} formatMarkdown={formatMarkdown} />
                </div>
            </div>
        </main>
        <footer className="w-full text-center py-6 px-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold mb-2">【ご利用上の注意】</h4>
            <ul className="space-y-1 list-inside list-disc text-left max-w-md mx-auto">
                <li>本アプリのデータは、お使いのブラウザ内にのみ保存されます。他のデバイスとの同期はされず、キャッシュを削除するとデータが消えることがあります。</li>
                <li>レシートの読み取り結果は100%の精度を保証するものではありません。保存前に必ずご自身で内容の確認・修正をお願いします。</li>
                <li>AIによるヒントの取得やレシート分析機能のご利用には、APIキーの設定とインターネット接続が必要です。</li>
            </ul>
        </footer>
      </div>
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-y-4">
        <div className="group relative flex items-center">
          <span className="absolute right-16 w-max rounded-lg bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-white shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            支出を追加
          </span>
          <button
            onClick={handleFabAddExpense}
            className="flex items-center justify-center w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
            aria-label="支出を追加"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="group relative flex items-center">
          <span className="absolute right-16 w-max rounded-lg bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-white shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            レシート読込
          </span>
          <button
            onClick={handleFabScanReceipt}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
            aria-label="レシート読込"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 4a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM2 9a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V9zM2 14a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1zM7 4a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V4zM7 9a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V9zM7 14a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1zM12 4a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V4zM12 9a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V9zM12 14a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1z" />
              <path
                fillRule="evenodd"
                d="M3 1a1 1 0 00-1 1v16a1 1 0 001 1h14a1 1 0 001-1V2a1 1 0 00-1-1H3zm13 1v16H4V2h12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="group relative flex items-center">
          <span className="absolute right-16 w-max rounded-lg bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-white shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            収入を追加
          </span>
          <button
            onClick={handleFabAddIncome}
            className="flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform transform hover:scale-110"
            aria-label="収入を追加"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        onSave={expenseToEdit ? handleUpdateExpense : handleAddExpense}
        expenseToEdit={expenseToEdit}
        initialData={expenseInitialData}
      />
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={incomeToEdit ? handleUpdateIncome : handleAddIncome}
        incomeToEdit={incomeToEdit}
      />
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCapture={handleReceiptCapture}
        isProcessing={isProcessingReceipt}
      />
    </>
  );
};

export default App;