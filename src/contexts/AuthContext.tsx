'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('expense-tracker-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple client-side authentication (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('expense-tracker-users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const userSession = { id: user.id, email: user.email, name: user.name };
      setUser(userSession);
      localStorage.setItem('expense-tracker-user', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('expense-tracker-users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      return false; // User already exists
    }

    // Create new user
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password, // In real app, this would be hashed
    };

    users.push(newUser);
    localStorage.setItem('expense-tracker-users', JSON.stringify(users));

    // Auto-login after registration
    const userSession = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(userSession);
    localStorage.setItem('expense-tracker-user', JSON.stringify(userSession));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsLoading(false);
    localStorage.removeItem('expense-tracker-user');
    // Note: User-specific data remains in localStorage for when they log back in
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
