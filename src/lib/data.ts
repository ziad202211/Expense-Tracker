import { Expense, Category, UserProfile } from '@/types';

// localStorage keys - now user-specific
const getUserStorageKey = (userId: string, type: string) => `expense-tracker-${userId}-${type}`;

// Legacy keys for backward compatibility
const EXPENSES_KEY = 'expense-tracker-expenses';
const PROFILE_KEY = 'expense-tracker-profile';
const CATEGORIES_KEY = 'expense-tracker-categories';

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#ef4444', icon: '🍕' },
  { id: '2', name: 'Transportation', color: '#3b82f6', icon: '🚗' },
  { id: '3', name: 'Shopping', color: '#8b5cf6', icon: '🛍️' },
  { id: '4', name: 'Entertainment', color: '#06b6d4', icon: '🎬' },
  { id: '5', name: 'Bills & Utilities', color: '#f59e0b', icon: '💡' },
  { id: '6', name: 'Healthcare', color: '#10b981', icon: '🏥' },
  { id: '7', name: 'Education', color: '#6366f1', icon: '📚' },
  { id: '8', name: 'Other', color: '#6b7280', icon: '📦' },
];

// Default user profile
const defaultProfile: UserProfile = {
  id: '1',
  salary: 0,
  currency: 'USD',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Helper functions for localStorage operations
// In-memory storage for server-side operations
let serverStorage: { [key: string]: any } = {};

function getFromStorage<T>(key: string, defaultValue: T, userId?: string): T {
  const storageKey = userId ? getUserStorageKey(userId, key.replace('expense-tracker-', '')) : key;
  
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key ${storageKey}:`, error);
      return defaultValue;
    }
  }
  // Server-side fallback
  return serverStorage[storageKey] || defaultValue;
}

function saveToStorage<T>(key: string, value: T, userId?: string): void {
  const storageKey = userId ? getUserStorageKey(userId, key.replace('expense-tracker-', '')) : key;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage for key ${storageKey}:`, error);
    }
  } else {
    // Server-side fallback
    serverStorage[storageKey] = value;
  }
}

// Initialize data from localStorage or defaults for a specific user
function initializeUserData(userId: string) {
  if (typeof window === 'undefined') return; // Skip on server side
  
  // Initialize categories if not exists for this user
  const categories = getFromStorage(CATEGORIES_KEY, null, userId);
  if (!categories) {
    saveToStorage(CATEGORIES_KEY, defaultCategories, userId);
  }
  
  // Initialize profile if not exists for this user
  const profile = getFromStorage(PROFILE_KEY, null, userId);
  if (!profile) {
    saveToStorage(PROFILE_KEY, { ...defaultProfile, id: userId }, userId);
  }
  
  // Initialize expenses if not exists for this user
  const expenses = getFromStorage(EXPENSES_KEY, null, userId);
  if (!expenses) {
    saveToStorage(EXPENSES_KEY, [], userId);
  }
}

// Legacy initialize function for backward compatibility
function initializeData() {
  if (typeof window === 'undefined') return; // Skip on server side
  
  // Initialize categories if not exists
  const categories = getFromStorage(CATEGORIES_KEY, null);
  if (!categories) {
    saveToStorage(CATEGORIES_KEY, defaultCategories);
  }
  
  // Initialize profile if not exists
  const profile = getFromStorage(PROFILE_KEY, null);
  if (!profile) {
    saveToStorage(PROFILE_KEY, defaultProfile);
  }
  
  // Initialize expenses if not exists
  const expenses = getFromStorage(EXPENSES_KEY, null);
  if (!expenses) {
    saveToStorage(EXPENSES_KEY, []);
  }
}

export async function getExpenses(userId?: string): Promise<Expense[]> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    return getFromStorage(EXPENSES_KEY, [], userId);
  } else {
    initializeData(); // Ensure data is initialized
    return getFromStorage(EXPENSES_KEY, []);
  }
}

export async function getExpenseById(id: string, userId?: string): Promise<Expense | null> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, [], userId);
    return expenses.find((expense: Expense) => expense.id === id) || null;
  } else {
    initializeData(); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, []);
    return expenses.find((expense: Expense) => expense.id === id) || null;
  }
}

export async function createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<Expense> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, [], userId);
    const expense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expenses.push(expense);
    saveToStorage(EXPENSES_KEY, expenses, userId);
    return expense;
  } else {
    initializeData(); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, []);
    const expense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expenses.push(expense);
    saveToStorage(EXPENSES_KEY, expenses);
    return expense;
  }
}

export async function updateExpense(id: string, updates: Partial<Expense>, userId?: string): Promise<Expense | null> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, [], userId);
    const index = expenses.findIndex((expense: Expense) => expense.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedExpense = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    expenses[index] = updatedExpense;
    saveToStorage(EXPENSES_KEY, expenses, userId);
    return updatedExpense;
  } else {
    initializeData(); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, []);
    const index = expenses.findIndex((expense: Expense) => expense.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedExpense = {
      ...expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    expenses[index] = updatedExpense;
    saveToStorage(EXPENSES_KEY, expenses);
    return updatedExpense;
  }
}

export async function deleteExpense(id: string, userId?: string): Promise<boolean> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, [], userId);
    const index = expenses.findIndex((expense: Expense) => expense.id === id);
    
    if (index === -1) {
      return false;
    }
    
    expenses.splice(index, 1);
    saveToStorage(EXPENSES_KEY, expenses, userId);
    return true;
  } else {
    initializeData(); // Ensure data is initialized
    const expenses = getFromStorage<Expense[]>(EXPENSES_KEY, []);
    const index = expenses.findIndex((expense: Expense) => expense.id === id);
    
    if (index === -1) {
      return false;
    }
    
    expenses.splice(index, 1);
    saveToStorage(EXPENSES_KEY, expenses);
    return true;
  }
}

export async function getCategories(userId?: string): Promise<Category[]> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    return getFromStorage(CATEGORIES_KEY, defaultCategories, userId);
  } else {
    initializeData(); // Ensure data is initialized
    return getFromStorage(CATEGORIES_KEY, defaultCategories);
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  initializeData(); // Ensure data is initialized
  const categories = getFromStorage<Category[]>(CATEGORIES_KEY, defaultCategories);
  return categories.find((category: Category) => category.id === id) || null;
}

export async function getUserProfile(userId?: string): Promise<UserProfile> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    return getFromStorage(PROFILE_KEY, { ...defaultProfile, id: userId }, userId);
  } else {
    initializeData(); // Ensure data is initialized
    return getFromStorage(PROFILE_KEY, defaultProfile);
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>, userId?: string): Promise<UserProfile> {
  if (userId) {
    initializeUserData(userId); // Ensure data is initialized
    const currentProfile = getFromStorage<UserProfile>(PROFILE_KEY, { ...defaultProfile, id: userId }, userId);
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(PROFILE_KEY, updatedProfile, userId);
    return updatedProfile;
  } else {
    initializeData(); // Ensure data is initialized
    const currentProfile = getFromStorage<UserProfile>(PROFILE_KEY, defaultProfile);
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(PROFILE_KEY, updatedProfile);
    return updatedProfile;
  }
}
