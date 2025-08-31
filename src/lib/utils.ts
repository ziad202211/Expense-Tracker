import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Expense, ExpenseStats } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function calculateExpenseStats(expenses: Expense[]): ExpenseStats {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyExpenses = expenses
    .filter(expense => 
      isWithinInterval(new Date(expense.date), { start: monthStart, end: monthEnd })
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const categories = new Set(expenses.map(expense => expense.category));
  const categoryCount = categories.size;

  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate yearly breakdown by month
  const yearlyBreakdown = expenses.reduce((acc, expense) => {
    const expenseDate = new Date(expense.date);
    const monthKey = format(expenseDate, 'MMM yyyy');
    acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  return {
    totalExpenses,
    monthlyExpenses,
    categoryCount,
    transactionCount: expenses.length,
    categoryBreakdown,
    yearlyBreakdown,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
