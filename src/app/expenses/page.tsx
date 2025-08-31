'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Expense, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, Download, FileText, Calendar, Tag, DollarSign, Edit, Trash2, Plus } from 'lucide-react';
import { useSnackbar } from '@/contexts/SnackbarContext';
import Link from 'next/link';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
    
    // Refresh data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchExpenses();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory, dateFrom, dateTo, minAmount, maxAmount]);

  const fetchExpenses = async () => {
    try {
      const userId = user?.id;
      
      if (!userId) {
        console.log('No user logged in for expenses');
        setExpenses([]);
        return;
      }
      
      // Load user-specific data from localStorage
      const userExpensesKey = `expense-tracker-${userId}-expenses`;
      console.log('Loading expenses from:', userExpensesKey);
      
      const storedExpenses = localStorage.getItem(userExpensesKey);
      const expensesData = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      console.log('Loaded expenses:', expensesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(expense => new Date(expense.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(expense => new Date(expense.date) <= new Date(dateTo));
    }

    // Amount range filter
    if (minAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(maxAmount));
    }

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const userId = user?.id;
      
      if (!userId) {
        showSnackbar('Please log in to delete expenses', 'error');
        return;
      }

      // Delete from localStorage directly since we're using client-side storage
      const userExpensesKey = `expense-tracker-${userId}-expenses`;
      const storedExpenses = localStorage.getItem(userExpensesKey);
      const expensesData = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      const updatedExpenses = expensesData.filter((expense: any) => expense.id !== id);
      localStorage.setItem(userExpensesKey, JSON.stringify(updatedExpenses));
      
      // Update state
      setExpenses(updatedExpenses);
      setFilteredExpenses(filteredExpenses.filter(expense => expense.id !== id));
      
      showSnackbar('Expense deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete expense:', error);
      showSnackbar('Failed to delete expense', 'error');
    }
  };

  const categories = Array.from(new Set(expenses.map(expense => expense.category)));

  // Export functions
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      showSnackbar('No expenses to export', 'warning');
      return;
    }

    const headers = ['Date', 'Title', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense.date,
        `"${expense.title}"`,
        expense.category,
        expense.amount,
        `"${expense.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredExpenses.length === 0) {
      showSnackbar('No expenses to export', 'warning');
      return;
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Expense Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${filteredExpenses.map(expense => `
              <tr>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>${expense.title}</td>
                <td>${expense.category}</td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>${expense.description || '-'}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3"><strong>Total</strong></td>
              <td><strong>${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading expenses...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">All Expenses</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center gap-2"
                title="Export as Excel/CSV"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="btn-secondary flex items-center gap-2"
                title="Export as PDF"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
            <Link href="/expenses/add" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setDateFrom('');
                  setDateTo('');
                  setMinAmount('');
                  setMaxAmount('');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="card">
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{expense.title}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                        {expense.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                    {expense.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/expenses/edit/${expense.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
