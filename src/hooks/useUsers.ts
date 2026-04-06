import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchUsers,
  fetchUserById,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deactivateUser as apiDeactivateUser,
} from '../lib/api/users';
import type { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!isSupabaseConfigured) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      if (isSupabaseConfigured) {
        setError(err.message || 'Failed to load users');
        console.error('Error loading users:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (user: UserInsert) => {
    try {
      const newUser = await apiCreateUser(user);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    }
  };

  const updateUser = async (id: string, updates: UserUpdate) => {
    try {
      const updated = await apiUpdateUser(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    }
  };

  const deactivateUser = async (id: string) => {
    try {
      await apiDeactivateUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate user');
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deactivateUser,
    refresh: loadUsers,
  };
}
