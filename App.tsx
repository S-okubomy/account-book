import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Category, ExpenseType, CategoryExpenseType, Budgets } from './types.ts';
import { ExpenseModal } from './components/ExpenseModal.tsx';
import { IncomeModal } from './components/IncomeModal.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { ReceiptScannerModal } from './components/ReceiptScannerModal.tsx';
import { SalesInfo } from './components/SalesInfo.tsx';
import { BudgetModal } from './components/BudgetModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { RakutenAffiliateWidget } from './components/RakutenAffiliateWidget.tsx';
import { A8AffiliateWidget } from './components/A8AffiliateWidget.tsx';
import { AmazonAffiliateWidget } from './components/AmazonAffiliateWidget.tsx';
import { analyzeReceipt } from './services/geminiService.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

  const [budgets, setBudgets] = useState<Budgets>({ overall: 0, categories: {} });
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('expenses');
  
  const chartContainerRef = useRef(null);

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      const storedIncomes = localStorage.getItem('incomes');
      if (storedIncomes) setIncomes(JSON.parse(storedIncomes));
      const storedBudgets = localStorage.getItem('budgets');
      if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
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

  useEffect(() => {
    try {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
        console.error("Failed to save budgets to localStorage", error);
    }
  }, [budgets]);

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
  
  const handleSaveBudgets = useCallback((newBudgets) => {
    setBudgets(newBudgets);
  }, []);


  const isNextMonthDisabled = useMemo(() => {
    const today = new Date();
    const currentSelectedMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const thisActualMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentSelectedMonthStart.getTime() >= thisActualMonthStart.getTime();
  }, [currentMonth]);


  const { monthlyExpenses, monthlyIncomes, monthlyTotalSpent, monthlyTotalIncome, monthlyBalance, monthlyCategoryData, monthlyFixedCost, monthlyVariableCost, categoryMap } = useMemo(() => {
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
    let fixedCost = 0;
    let variableCost = 0;

    filteredExpenses.forEach(expense => {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
      
      if (CategoryExpenseType[expense.category] === ExpenseType.Fixed) {
        fixedCost += expense.amount;
      } else {
        variableCost += expense.amount;
      }
    });
    const categoryData = Array.from(categoryMap, ([name, value]) => ({ name, value }));

    return { 
        monthlyExpenses: filteredExpenses,
        monthlyIncomes: filteredIncomes,
        monthlyTotalSpent: totalSpent,
        monthlyTotalIncome: totalIncome,
        monthlyBalance: balance,
        monthlyCategoryData: categoryData,
        monthlyFixedCost: fixedCost,
        monthlyVariableCost: variableCost,
        categoryMap: categoryMap,
    };
  }, [expenses, incomes, currentMonth]);
  
  const COLORS = ['#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777', '#e11d48', '#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#16a34a'];

  const categoryIcons = {
    // Fixed
    [Category.Housing]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    [Category.Insurance]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.052A11.954 11.954 0 0110 18.456A11.954 11.954 0 0117.834 5.052A11.954 11.954 0 0110 1.944zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    [Category.Communication]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>,
    [Category.Car]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15 15a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM11 5v2h3V5h-3z" /><path d="M11 8v2h3V8h-3z" /><path d="M15 5a1 1 0 00-1 1v7a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1h-2z" /></svg>,
    [Category.Utilities]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
    [Category.Education]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.41V13a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1v-3.59l6.606-2.47a1 1 0 000-1.84l-7-3zM9 13.5l-6-2.25L9 9l6 2.25L9 13.5z" /></svg>,
    // Variable
    [Category.Food]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18.333 7.825c0-3.321-2.612-4.25-3.083-4.325a.833.833 0 00-.917.917c.017.25.167.833.167 1.417 0 .583-.15 1.167-.167 1.417a.833.833 0 00.917.917c.471-.075 3.083-1 3.083-4.325zM1.667 7.825c0-3.321 2.612-4.25 3.083-4.325a.833.833 0 01.917.917c-.017.25-.167.833-.167 1.417 0 .583.15 1.167.167 1.417a.833.833 0 01-.917.917C4.279 8.825 1.667 8.825 1.667 7.825z" /><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.885 6.512a.833.833 0 01.954-.616c.38.117.953.334 1.542.334s1.162-.217 1.542-.334a.833.833 0 11.568 1.232c-.471.217-.953.488-1.722.488s-1.251-.271-1.722-.488a.833.833 0 01-.662-1.048zM14 11.5a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
    [Category.DailyNecessities]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>,
    [Category.EatingOut]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.39 2.91a1 1 0 00-1.23.4l-1.3 2.18a1 1 0 000 .88l.84 1.4a1 1 0 00.88.54H18a1 1 0 001-1V4a1 1 0 00-1.61-1.09zM4.22 5.49a1 1 0 00-1.23-.4L1.61 3.99A1 1 0 000 5v13a1 1 0 001 1h14a1 1 0 001-1v-2a1 1 0 00-1-1h-3.32a1 1 0 00-.88.54l-.84 1.4a1 1 0 000 .88l1.3 2.18a1 1 0 001.23.4A1 1 0 0013 18.9V9a1 1 0 00-1-1H4a1 1 0 00-.88.54l-.84 1.4a1 1 0 000 .88l1.3 2.18a1 1 0 001.23.4A1 1 0 006 13.9V5a1 1 0 00-1.78-.51z" /></svg>,
    [Category.Socializing]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>,
    [Category.Transport]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 6.5a.5.5 0 00-.5-.5h-2a.5.5 0 000 1h2a.5.5 0 00.5-.5zM12.879 6.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zM10 6.5a.5.5 0 00-.5.5v2a.5.5 0 101 0v-2a.5.5 0 00-.5-.5zM7.121 6.5a.5.5 0 00-.5.5v2a.5.5 0 101 0v-2a.5.5 0 00-.5-.5zM5 7.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM2 9.5A.5.5 0 012.5 9h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z" clipRule="evenodd" /><path d="M16 3.5A2.5 2.5 0 0013.5 1h-7A2.5 2.5 0 004 3.5v11A2.5 2.5 0 006.5 17h7a2.5 2.5 0 002.5-2.5v-11zM6.5 2a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112.5 2v1h-7V2zM5 14.5A1.5 1.5 0 016.5 13h7a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 15.5v-1z" /></svg>,
    [Category.Medical]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>,
    [Category.Beauty]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.036 5.036a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm2.97 4.03a.75.75 0 010-1.06l1.06-1.061a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18zm4.03-2.97a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zm-2.97-4.03a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>,
    [Category.Special]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
    [Category.Other]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-1V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1H5V4zM3 7a2 2 0 012-2h10a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>,
  };
  
  const formatMarkdown = (text) => {
    if (!text) {
      return { __html: '' };
    }
    const html = marked.parse(text, { gfm: true, breaks: true, async: false });
    return { __html: html };
  };
  
  const remainingBudget = budgets.overall - monthlyTotalSpent;
  const budgetProgress = budgets.overall > 0 ? (monthlyTotalSpent / budgets.overall) * 100 : 0;

  const getProgressBarColor = (percentage) => {
    if (percentage > 100) return 'bg-red-600';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-teal-600';
  };

  const shareSummaryText = useMemo(() => {
    const monthString = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
    
    const top10Expenses = [...monthlyCategoryData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item, index) => `${index + 1}. ${item.name}: ${item.value.toLocaleString('ja-JP')}円`)
      .join('\n');

    return `【${monthString}の家計簿サマリー】\n\n` +
           `収入: ${monthlyTotalIncome.toLocaleString('ja-JP')}円\n` +
           `支出: ${monthlyTotalSpent.toLocaleString('ja-JP')}円\n` +
           `残高: ${monthlyBalance.toLocaleString('ja-JP')}円\n\n` +
           `--- 支出の内訳 Top 10 ---\n` +
           `${top10Expenses || '支出はありませんでした。'}\n\n` +
           `簡単家計簿アプリより`;
  }, [currentMonth, monthlyTotalIncome, monthlyTotalSpent, monthlyBalance, monthlyCategoryData]);

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
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
            >
              予算設定
            </button>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex items-center justify-center relative mb-6">
              <div className="flex items-center space-x-4">
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
              <div className="absolute right-0">
                 <button onClick={() => setIsShareModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" aria-label="共有">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span>共有</span>
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の収入`}</h3>
                    <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400 mt-2">{monthlyTotalIncome.toLocaleString('ja-JP')}円</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の支出`}</h3>
                    <p className="text-3xl font-bold text-red-500 dark:text-red-400 mt-2">{monthlyTotalSpent.toLocaleString('ja-JP')}円</p>
                    {monthlyTotalSpent > 0 && (
                        <div className="mt-auto pt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                                <span>{ExpenseType.Fixed}:</span>
                                <span className="font-medium">{monthlyFixedCost.toLocaleString('ja-JP')}円</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{ExpenseType.Variable}:</span>
                                <span className="font-medium">{monthlyVariableCost.toLocaleString('ja-JP')}円</span>
                            </div>
                        </div>
                    )}
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の残高`}</h3>
                    <p className={`text-3xl font-bold mt-2 ${monthlyBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{monthlyBalance.toLocaleString('ja-JP')}円</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{`${currentMonth.getMonth() + 1}月の予算`}</h3>
                    {budgets.overall > 0 ? (
                        <>
                            <p className={`text-3xl font-bold mt-2 ${remainingBudget >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{remainingBudget.toLocaleString('ja-JP')}円</p>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                                <div className={`${getProgressBarColor(budgetProgress)} h-2 rounded-full`} style={{ width: `${Math.min(budgetProgress, 100)}%` }}></div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                                {monthlyTotalSpent.toLocaleString('ja-JP')} / {budgets.overall.toLocaleString('ja-JP')} 円
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <button onClick={() => setIsBudgetModalOpen(true)} className="text-sm text-teal-600 dark:text-teal-400 hover:underline">予算を設定する</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
              <SalesInfo formatMarkdown={formatMarkdown} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('expenses')} className={`${activeTab === 'expenses' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>支出一覧</button>
                        <button onClick={() => setActiveTab('incomes')} className={`${activeTab === 'incomes' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>収入一覧</button>
                        <button onClick={() => setActiveTab('budgets')} className={`${activeTab === 'budgets' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>予算の内訳</button>
                    </nav>
                </div>
                
                {activeTab === 'expenses' && (
                     monthlyExpenses.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                        {monthlyExpenses.map(expense => (
                            <li key={expense.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg -mx-4 px-4 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className="text-teal-500">{categoryIcons[expense.category]}</span>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{expense.description || expense.category}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {expense.date}{expense.description && ` • ${expense.category}`}
                                    </p>
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
                    )
                )}
                {activeTab === 'incomes' && (
                     monthlyIncomes.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                        {monthlyIncomes.map(income => (
                            <li key={income.id} className="py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg -mx-4 px-4 transition-colors">
                            <div className="flex items-center space-x-4">
                                <span className="text-emerald-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{income.description || '(内容なし)'}</p>
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
                        </div>
                    )
                )}
                 {activeTab === 'budgets' && (
                    <div className="max-h-96 overflow-y-auto">
                      {Object.keys(budgets.categories).length > 0 ? (
                        <ul className="space-y-4">
                            {Object.values(Category).map(category => {
                                const spent = categoryMap.get(category) || 0;
                                const budget = budgets.categories[category] || 0;
                                if (budget === 0 && spent === 0) return null;
                                const remaining = budget - spent;
                                const progress = budget > 0 ? (spent / budget) * 100 : 0;
                                return (
                                    <li key={category}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-teal-500">{categoryIcons[category]}</span>
                                                <span className="font-medium">{category}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-800 dark:text-slate-100 font-semibold">{spent.toLocaleString()}</span>
                                                <span className="text-slate-500 dark:text-slate-400"> / {budget > 0 ? budget.toLocaleString() : '0'} 円</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div className={`${getProgressBarColor(progress)} h-2 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                        <p className={`text-xs text-right mt-1 ${remaining < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {remaining >= 0 ? `残り ${remaining.toLocaleString()} 円` : `${Math.abs(remaining).toLocaleString()} 円オーバー`}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                      ) : (
                        <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">予算が設定されていません</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                <button onClick={() => setIsBudgetModalOpen(true)} className="text-teal-600 dark:text-teal-400 hover:underline">こちら</button>
                                から予算を設定してください。
                            </p>
                        </div>
                      )}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6" ref={chartContainerRef}>
                    <h2 className="text-xl font-bold mb-4">カテゴリ別支出</h2>
                    {monthlyCategoryData.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 items-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                  data={monthlyCategoryData} 
                                  dataKey="value" 
                                  nameKey="name" 
                                  cx="50%" 
                                  cy="50%" 
                                  outerRadius={100} 
                                  fill="#8884d8" 
                                  labelLine={false}
                                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                                >
                                    {monthlyCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toLocaleString('ja-JP')}円`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="max-h-[300px] overflow-y-auto pr-2">
                            <ul className="space-y-2 text-sm">
                                {[...monthlyCategoryData]
                                    .sort((a, b) => b.value - a.value)
                                    .map((entry, index) => (
                                        <li key={`item-${index}`} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <div className="flex items-center truncate">
                                                <span className="w-3 h-3 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                <span className="truncate">{entry.name}</span>
                                            </div>
                                            <span className="font-semibold whitespace-nowrap">{entry.value.toLocaleString('ja-JP')}円</span>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                      </div>
                    ) : (
                        <div className="flex items-center justify-center h-[300px]">
                             <p className="text-slate-500 dark:text-slate-400">この月の支出を追加すると、ここに内訳が表示されます。</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2">
                    <AIAssistant 
                        expenses={monthlyExpenses} 
                        incomes={monthlyIncomes} 
                        currentMonth={currentMonth} 
                        formatMarkdown={formatMarkdown}
                        totalSpent={monthlyTotalSpent}
                        fixedCost={monthlyFixedCost}
                        variableCost={monthlyVariableCost}
                        budgets={budgets}
                    />
                </div>
            </div>
        </main>
        <footer className="w-full text-center py-6 px-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold mb-2">【ご利用上の注意】</h4>
            <ul className="space-y-1 list-inside list-disc text-left max-w-md mx-auto">
                <li>本アプリのデータは、お使いのブラウザ内にのみ保存されます。他のデバイスとの同期はされず、キャッシュを削除するとデータが消えることがあります。</li>
                <li>レシートの読み取り結果は100%の精度を保証するものではありません。保存前に必ずご自身で内容の確認・修正をお願いします。</li>
                <li>AIによるヒントの取得やレシート分析機能のご利用には、APIキーの設定とインターネット接続が必要です。</li>
                <li>本アプリには、運営資金のためのプロモーションが含まれる場合があります。</li>
            </ul>
            <div className="flex justify-center items-center flex-wrap gap-6 mt-6">
              <RakutenAffiliateWidget />
              <A8AffiliateWidget />
              <AmazonAffiliateWidget />
            </div>
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
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudgets}
        currentBudgets={budgets}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        summaryText={shareSummaryText}
        chartContainerRef={chartContainerRef}
      />
    </>
  );
};

export default App;