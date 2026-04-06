import { supabase, handleSupabaseError, isSupabaseConfigured } from '../supabase';
import type { Database } from '../database.types';

type Request = Database['public']['Tables']['requests']['Row'];
type RequestInsert = Database['public']['Tables']['requests']['Insert'];
type RequestUpdate = Database['public']['Tables']['requests']['Update'];
type ApprovalHistory = Database['public']['Tables']['approval_history']['Row'];
type ApprovalHistoryInsert = Database['public']['Tables']['approval_history']['Insert'];
type RequestComment = Database['public']['Tables']['request_comments']['Row'];
type RequestCommentInsert = Database['public']['Tables']['request_comments']['Insert'];

// Fetch all requests (with RLS filtering)
export async function fetchRequests(): Promise<Request[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'Fetch requests');
    return data || [];
  } catch (error) {
    if (!isSupabaseConfigured) {
      return [];
    }
    handleSupabaseError(error, 'Fetch requests');
    return [];
  }
}

// Fetch single request by ID
export async function fetchRequestById(id: string): Promise<Request | null> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error, 'Fetch request');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'Fetch request');
    return null;
  }
}

// Create new request
export async function createRequest(request: RequestInsert): Promise<Request> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert(request)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'Create request');

    // Create audit log
    if (data) {
      await createAuditLog({
        request_id: data.id,
        action: 'Request Created',
        new_value: JSON.stringify(request),
        performed_by: request.submitter_id,
        performed_by_name: request.submitter_name,
      });
    }

    return data!;
  } catch (error) {
    handleSupabaseError(error, 'Create request');
    throw error;
  }
}

// Update request
export async function updateRequest(id: string, updates: RequestUpdate, userId: string, userName: string): Promise<Request> {
  try {
    // Fetch current request for audit log
    const current = await fetchRequestById(id);

    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'Update request');

    // Create audit log
    if (data) {
      await createAuditLog({
        request_id: id,
        action: 'Request Updated',
        old_value: JSON.stringify(current),
        new_value: JSON.stringify(updates),
        performed_by: userId,
        performed_by_name: userName,
      });
    }

    return data!;
  } catch (error) {
    handleSupabaseError(error, 'Update request');
    throw error;
  }
}

// Delete request
export async function deleteRequest(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error, 'Delete request');
  } catch (error) {
    handleSupabaseError(error, 'Delete request');
    throw error;
  }
}

// Fetch approval history for a request
export async function fetchApprovalHistory(requestId: string): Promise<ApprovalHistory[]> {
  try {
    const { data, error } = await supabase
      .from('approval_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) handleSupabaseError(error, 'Fetch approval history');
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'Fetch approval history');
    return [];
  }
}

// Create approval history entry
export async function createApprovalHistory(approval: ApprovalHistoryInsert): Promise<void> {
  try {
    const { error } = await supabase
      .from('approval_history')
      .insert(approval);

    if (error) handleSupabaseError(error, 'Create approval history');

    // Create audit log
    await createAuditLog({
      request_id: approval.request_id,
      action: `${approval.action} by ${approval.action_by_name}`,
      new_value: approval.comment || '',
      performed_by: approval.action_by,
      performed_by_name: approval.action_by_name,
    });
  } catch (error) {
    handleSupabaseError(error, 'Create approval history');
    throw error;
  }
}

// Fetch comments for a request
export async function fetchRequestComments(requestId: string): Promise<RequestComment[]> {
  try {
    const { data, error } = await supabase
      .from('request_comments')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) handleSupabaseError(error, 'Fetch comments');
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'Fetch comments');
    return [];
  }
}

// Create comment
export async function createComment(comment: RequestCommentInsert): Promise<void> {
  try {
    const { error } = await supabase
      .from('request_comments')
      .insert(comment);

    if (error) handleSupabaseError(error, 'Create comment');

    // Create audit log
    await createAuditLog({
      request_id: comment.request_id,
      action: 'Comment Added',
      new_value: comment.comment,
      performed_by: comment.user_id,
      performed_by_name: comment.user_name,
    });
  } catch (error) {
    handleSupabaseError(error, 'Create comment');
    throw error;
  }
}

// Create audit log (internal helper)
async function createAuditLog(log: Database['public']['Tables']['audit_logs']['Insert']): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert(log);

    if (error) console.error('Audit log error:', error);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Subscribe to request changes (real-time)
export function subscribeToRequests(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('requests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// Subscribe to comments for a specific request (real-time)
export function subscribeToRequestComments(requestId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`request_comments_${requestId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'request_comments',
        filter: `request_id=eq.${requestId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
