import { supabase, handleSupabaseError, isSupabaseConfigured } from '../supabase';
import type { Database } from '../database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// Fetch all active users
export async function fetchUsers(): Promise<User[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) handleSupabaseError(error, 'Fetch users');
    return data || [];
  } catch (error) {
    if (!isSupabaseConfigured) {
      return [];
    }
    handleSupabaseError(error, 'Fetch users');
    return [];
  }
}

// Fetch user by ID
export async function fetchUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error, 'Fetch user');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'Fetch user');
    return null;
  }
}

// Fetch user by auth user ID
export async function fetchUserByAuthId(authUserId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error) handleSupabaseError(error, 'Fetch user by auth ID');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'Fetch user by auth ID');
    return null;
  }
}

// Fetch user by username or email
export async function fetchUserByUsername(usernameOrEmail: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .single();

    if (error) handleSupabaseError(error, 'Fetch user by username');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'Fetch user by username');
    return null;
  }
}

// Create new user
export async function createUser(user: UserInsert): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'Create user');
    return data!;
  } catch (error) {
    handleSupabaseError(error, 'Create user');
    throw error;
  }
}

// Update user
export async function updateUser(id: string, updates: UserUpdate): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'Update user');
    return data!;
  } catch (error) {
    handleSupabaseError(error, 'Update user');
    throw error;
  }
}

// Deactivate user (soft delete)
export async function deactivateUser(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id);

    if (error) handleSupabaseError(error, 'Deactivate user');
  } catch (error) {
    handleSupabaseError(error, 'Deactivate user');
    throw error;
  }
}

// Fetch users by role
export async function fetchUsersByRole(role: User['role']): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('active', true)
      .order('name');

    if (error) handleSupabaseError(error, 'Fetch users by role');
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'Fetch users by role');
    return [];
  }
}

// Fetch approvers by request type
export async function fetchApproverForType(type: 'Finance' | 'IT' | 'Legal' | 'HR'): Promise<User | null> {
  const roleMap = {
    Finance: 'approver_finance',
    IT: 'approver_it',
    Legal: 'approver_legal',
    HR: 'approver_hr',
  };

  const role = roleMap[type];

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('active', true)
      .limit(1)
      .single();

    if (error) handleSupabaseError(error, 'Fetch approver for type');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'Fetch approver for type');
    return null;
  }
}

// Fetch final approver
export async function fetchFinalApprover(): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'final_approver')
      .eq('active', true)
      .limit(1)
      .single();

    if (error) handleSupabaseError(error, 'Fetch final approver');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'Fetch final approver');
    return null;
  }
}
