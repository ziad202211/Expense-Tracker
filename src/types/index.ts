export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  monthlyExpenses: number;
  categoryCount: number;
  transactionCount: number;
  categoryBreakdown: { [key: string]: number };
  yearlyBreakdown: { [key: string]: number };
}

export interface UserProfile {
  id: string;
  salary: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpenseData {
  month: string;
  expenses: number;
  salary: number;
  remaining: number;
}
