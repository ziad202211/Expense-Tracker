'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Save, DollarSign } from 'lucide-react';

interface SettingsFormData {
  salary: number;
  currency: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SettingsFormData>();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const userId = user?.id;
      
      // Load user-specific data from localStorage
      const userProfileKey = userId ? `expense-tracker-${userId}-profile` : 'expense-tracker-profile';
      const storedProfile = localStorage.getItem(userProfileKey);
      const data = storedProfile ? JSON.parse(storedProfile) : { salary: 0, currency: 'USD' };
      
      setProfile(data);
      reset({
        salary: data.salary,
        currency: data.currency
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmit = (data: SettingsFormData) => {
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Form data received:', data);
      console.log('Current user:', user);
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Skip API call and save directly to localStorage for user-specific data
      const userProfileKey = `expense-tracker-${userId}-profile`;
      console.log('Using storage key:', userProfileKey);
      
      const currentProfile = localStorage.getItem(userProfileKey);
      const profileData = currentProfile ? JSON.parse(currentProfile) : { salary: 0, currency: 'USD' };
      console.log('Current profile data:', profileData);
      
      const updatedProfile = {
        ...profileData,
        salary: Number(data.salary), // Ensure salary is a number
        currency: data.currency,
        id: userId,
        updatedAt: new Date().toISOString(),
        createdAt: profileData.createdAt || new Date().toISOString(),
      };
      
      console.log('Updated profile:', updatedProfile);
      localStorage.setItem(userProfileKey, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setMessage('Settings saved successfully!');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading settings...</div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your profile and preferences</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-primary-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Financial Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">Set your monthly salary for budget tracking</p>
                </div>
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Salary
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="salary"
                  {...register('salary', { 
                    required: 'Salary is required',
                    min: { value: 0, message: 'Salary must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="5000.00"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salary.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  {...register('currency', { required: 'Currency is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="EGP">EGP - Egyptian Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currency.message}</p>
                )}
              </div>

              {profile && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Settings</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Monthly Salary: {formatCurrency(profile.salary)}</p>
                    <p>Currency: {profile.currency}</p>
                    <p>Last Updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-md ${
                  message.includes('successfully') 
                    ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' 
                    : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
