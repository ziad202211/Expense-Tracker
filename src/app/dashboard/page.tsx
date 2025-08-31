'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseStats, Expense, UserProfile, MonthlyExpenseData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Calendar, Wallet, List } from 'lucide-react';
import YearlyExpenseChart from '@/components/YearlyExpenseChart';
import ExpensePieChart from '@/components/ExpensePieChart';

export default function Dashboard() {
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [yearlyData, setYearlyData] = useState<MonthlyExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const userId = user?.id;
      
      if (!userId) {
        console.log('No user logged in');
        return;
      }
      
      // Load user-specific data from localStorage
      const userExpensesKey = `expense-tracker-${userId}-expenses`;
      const userProfileKey = `expense-tracker-${userId}-profile`;
      
      console.log('Loading dashboard data for user:', userId);
      console.log('Expenses key:', userExpensesKey);
      console.log('Profile key:', userProfileKey);
      
      const storedExpenses = localStorage.getItem(userExpensesKey);
      const storedProfile = localStorage.getItem(userProfileKey);
      
      console.log('Raw expenses data:', storedExpenses);
      console.log('Raw profile data:', storedProfile);
      
      const expensesData = storedExpenses ? JSON.parse(storedExpenses) : [];
      const profileData = storedProfile ? JSON.parse(storedProfile) : { salary: 0, currency: 'USD' };
      
      console.log('Parsed expenses:', expensesData);
      console.log('Parsed profile:', profileData);

      // Calculate stats from expenses
      const totalExpenses = expensesData.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const thisMonthExpenses = expensesData.filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      }).reduce((sum: number, expense: any) => sum + expense.amount, 0);

      // Calculate category breakdown
      const categoryBreakdown: { [key: string]: number } = {};
      expensesData.forEach((expense: any) => {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      });

      // Calculate yearly breakdown
      const yearlyBreakdown: { [key: string]: number } = {};
      expensesData.forEach((expense: any) => {
        const year = new Date(expense.date).getFullYear().toString();
        yearlyBreakdown[year] = (yearlyBreakdown[year] || 0) + expense.amount;
      });

      const statsData = {
        totalExpenses,
        monthlyExpenses: thisMonthExpenses,
        categoryCount: Object.keys(categoryBreakdown).length,
        transactionCount: expensesData.length,
        categoryBreakdown,
        yearlyBreakdown
      };

      setStats(statsData);
      setRecentExpenses(expensesData.slice(0, 5));
      setProfile(profileData);
      
      // Generate yearly data for chart
      const monthlyData = generateYearlyData(expensesData, profileData.salary);
      setYearlyData(monthlyData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateYearlyData = (expenses: Expense[], monthlySalary: number): MonthlyExpenseData[] => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentYear = new Date().getFullYear();
    const monthlyExpenses: { [key: string]: number } = {};
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyExpenses[`${month} ${currentYear}`] = 0;
    });
    
    // Calculate expenses for each month
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === currentYear) {
        const monthKey = `${months[expenseDate.getMonth()]} ${currentYear}`;
        monthlyExpenses[monthKey] += expense.amount;
      }
    });
    
    // Convert to chart data format
    return months.map(month => {
      const monthKey = `${month} ${currentYear}`;
      const expenses = monthlyExpenses[monthKey] || 0;
      const remaining = Math.max(0, monthlySalary - expenses);
      
      return {
        month,
        expenses,
        salary: monthlySalary,
        remaining
      };
    });
  };

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your expense tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <DollarSign className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(stats?.totalExpenses || 0)}
            </p>
          </div>
          
          <div className="card text-center">
            <Calendar className="w-12 h-12 text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">This Month</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(stats?.monthlyExpenses || 0)}
            </p>
          </div>
          
          <div className="card text-center">
            <Wallet className="w-12 h-12 text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Remaining Money</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency((profile?.salary || 0) - (stats?.monthlyExpenses || 0))}
            </p>
          </div>
          
          <div className="card text-center">
            <List className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.transactionCount || 0}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Yearly Expense Chart */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Yearly Expense Overview</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Monthly expenses vs salary comparison for {new Date().getFullYear()}</p>
            <YearlyExpenseChart data={yearlyData} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Expense Chart */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Expenses by Category</h2>
              {stats && Object.keys(stats.categoryBreakdown).length > 0 ? (
                <ExpensePieChart stats={stats} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  No expenses to display
                </div>
              )}
            </div>

            {/* Recent Expenses */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Expenses</h2>
              {recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{expense.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent expenses
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
