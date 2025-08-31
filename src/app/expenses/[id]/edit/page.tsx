'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import ExpenseForm from '@/components/ExpenseForm';
import { Expense, ExpenseFormData } from '@/types';
import { getExpenseById, updateExpense } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditExpensePageProps {
  params: { id: string };
}

export default function EditExpensePage({ params }: EditExpensePageProps) {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExpense, setIsLoadingExpense] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpense();
    }
  }, [params.id, user]);

  const fetchExpense = async () => {
    try {
      const userId = user?.id;
      
      if (!userId) {
        router.push('/expenses');
        return;
      }
      
      // Load from user-specific localStorage
      const userExpensesKey = `expense-tracker-${userId}-expenses`;
      const storedExpenses = localStorage.getItem(userExpensesKey);
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      const foundExpense = expenses.find((exp: Expense) => exp.id === params.id);
      
      if (foundExpense) {
        setExpense(foundExpense);
      } else {
        alert('Expense not found');
        router.push('/expenses');
      }
    } catch (error) {
      console.error('Failed to fetch expense:', error);
      alert('Failed to load expense');
      router.push('/expenses');
    } finally {
      setIsLoadingExpense(false);
    }
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    
    try {
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Update in user-specific localStorage
      const userExpensesKey = `expense-tracker-${userId}-expenses`;
      const storedExpenses = localStorage.getItem(userExpensesKey);
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      const expenseIndex = expenses.findIndex((exp: Expense) => exp.id === params.id);
      
      if (expenseIndex !== -1) {
        expenses[expenseIndex] = {
          ...expenses[expenseIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        
        localStorage.setItem(userExpensesKey, JSON.stringify(expenses));
        console.log('Expense updated in:', userExpensesKey);
        router.push('/expenses');
      } else {
        throw new Error('Expense not found');
      }
    } catch (error) {
      console.error('Failed to update expense:', error);
      alert('Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingExpense) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading expense...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Expense Not Found</h1>
            <Link href="/expenses" className="btn-primary">
              Back to Expenses
            </Link>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link 
                href="/expenses" 
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Expenses
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Expense</h1>
              <p className="text-gray-600 dark:text-gray-400">Update your expense details</p>
            </div>

            <div className="card">
              <ExpenseForm 
                onSubmit={handleSubmit} 
                initialData={{
                  title: expense.title,
                  amount: expense.amount,
                  category: expense.category,
                  date: expense.date,
                  description: expense.description || '',
                }}
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
