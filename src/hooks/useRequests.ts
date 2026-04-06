import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchRequests,
  fetchRequestById,
  createRequest as apiCreateRequest,
  updateRequest as apiUpdateRequest,
  deleteRequest as apiDeleteRequest,
  fetchApprovalHistory,
  fetchRequestComments,
  createApprovalHistory,
  createComment,
  subscribeToRequests,
  subscribeToRequestComments,
} from '../lib/api/requests';
import type { Database } from '../lib/database.types';

type Request = Database['public']['Tables']['requests']['Row'];
type RequestInsert = Database['public']['Tables']['requests']['Insert'];
type RequestUpdate = Database['public']['Tables']['requests']['Update'];

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!isSupabaseConfigured) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchRequests();
      setRequests(data);
    } catch (err: any) {
      if (isSupabaseConfigured) {
        setError(err.message || 'Failed to load requests');
        console.error('Error loading requests:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    if (!isSupabaseConfigured) {
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRequests(() => {
      loadRequests();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const createRequest = async (request: RequestInsert) => {
    try {
      const newRequest = await apiCreateRequest(request);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
      throw err;
    }
  };

  const updateRequest = async (id: string, updates: RequestUpdate, userId: string, userName: string) => {
    try {
      const updated = await apiUpdateRequest(id, updates, userId, userName);
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      await apiDeleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete request');
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequest,
    deleteRequest,
    refresh: loadRequests,
  };
}

export function useRequest(id: string) {
  const [request, setRequest] = useState<Request | null>(null);
  const [approvals, setApprovals] = useState<Database['public']['Tables']['approval_history']['Row'][]>([]);
  const [comments, setComments] = useState<Database['public']['Tables']['request_comments']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequest = async () => {
    if (!isSupabaseConfigured) {
      setRequest(null);
      setApprovals([]);
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [requestData, approvalsData, commentsData] = await Promise.all([
        fetchRequestById(id),
        fetchApprovalHistory(id),
        fetchRequestComments(id),
      ]);

      setRequest(requestData);
      setApprovals(approvalsData);
      setComments(commentsData);
    } catch (err: any) {
      if (isSupabaseConfigured) {
        setError(err.message || 'Failed to load request');
        console.error('Error loading request:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadRequest();

      if (!isSupabaseConfigured) {
        return;
      }

      // Subscribe to comment updates
      const unsubscribe = subscribeToRequestComments(id, () => {
        loadRequest();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [id]);

  const addApproval = async (approval: Database['public']['Tables']['approval_history']['Insert']) => {
    try {
      await createApprovalHistory(approval);
      await loadRequest(); // Reload to get updated data
    } catch (err: any) {
      setError(err.message || 'Failed to add approval');
      throw err;
    }
  };

  const addComment = async (comment: Database['public']['Tables']['request_comments']['Insert']) => {
    try {
      await createComment(comment);
      await loadRequest(); // Reload to get updated comments
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
      throw err;
    }
  };

  return {
    request,
    approvals,
    comments,
    loading,
    error,
    addApproval,
    addComment,
    refresh: loadRequest,
  };
}
