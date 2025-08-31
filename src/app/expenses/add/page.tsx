'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createExpense } from '@/lib/data';
import ExpenseForm from '@/components/ExpenseForm';
import { ExpenseFormData } from '@/types';

export default function AddExpensePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newExpense = await response.json();
        
        // Save created expense to user-specific localStorage after API call
        const userId = user?.id;
        
        if (!userId) {
          throw new Error('User not logged in');
        }
        
        const userExpensesKey = `expense-tracker-${userId}-expenses`;
        const storedExpenses = localStorage.getItem(userExpensesKey);
        const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
        expenses.push(newExpense);
        localStorage.setItem(userExpensesKey, JSON.stringify(expenses));
        
        console.log('Expense saved to:', userExpensesKey);
        console.log('Updated expenses:', expenses);
        
        router.push('/expenses');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add New Expense</h1>
            <p className="text-gray-600 dark:text-gray-400">Track a new expense in your budget</p>
          </div>

          <div className="card">
            <ExpenseForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
