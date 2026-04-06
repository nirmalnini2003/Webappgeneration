import { useState } from 'react';
import type { Database } from '../../lib/database.types';
import { useRequest } from '../../hooks/useRequests';
import { notifyApprovalAction, contactSubmitter } from '../utils/whatsapp';
import { exportRequestDetailToExcel } from '../utils/exportExcel';
import { updateRequest as apiUpdateRequest } from '../../lib/api/requests';

type User = Database['public']['Tables']['users']['Row'];

interface RequestDetailProps {
  requestId: string;
  currentUser: User;
  users: User[];
  onBack: () => void;
}

export function RequestDetail({ requestId, currentUser, users, onBack }: RequestDetailProps) {
  const { request, approvals, comments, loading, addApproval, addComment } = useRequest(requestId);
  const [comment, setComment] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'clarify' | null>(null);
  const [processing, setProcessing] = useState(false);

  if (loading || !request) {
    return (
      <div className="p-7 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-[#1A2E4A]">Loading Request...</div>
        </div>
      </div>
    );
  }

  const canApprove = () => {
    if (currentUser.role === 'requester') return false;

    if (currentUser.role === 'approver_final') {
      return ['Pending Final', 'Approved L1'].includes(request.status);
    }

    const typeMap: Record<string, string> = {
      approver_finance: 'Finance',
      approver_it: 'IT',
      approver_legal: 'Legal',
      approver_hr: 'HR'
    };

    const myType = typeMap[currentUser.role];
    if (!myType || request.type !== myType) return false;

    return ['Pending Review', 'Under Review', 'Needs Clarification'].includes(request.status);
  };

  const handleAction = (action: 'approve' | 'reject' | 'clarify') => {
    setModalAction(action);
    setActionComment('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalAction) return;

    try {
      setProcessing(true);
      let newStatus = request.status;
      let actionName = '';
      let stage = currentUser.role === 'approver_final' ? 'Final' : 'L1';

      if (modalAction === 'approve') {
        actionName = 'Approved';
        newStatus = currentUser.role === 'approver_final' ? 'Approved' : 'Approved L1';
      } else if (modalAction === 'reject') {
        actionName = 'Rejected';
        newStatus = 'Rejected';
      } else if (modalAction === 'clarify') {
        actionName = 'Clarification Requested';
        newStatus = 'Needs Clarification';
      }

      // Update request status
      await apiUpdateRequest(
        request.id,
        { status: newStatus },
        currentUser.id,
        currentUser.name
      );

      // Add approval history
      await addApproval({
        request_id: request.id,
        stage,
        action: actionName,
        by_user_id: currentUser.id,
        by_user_name: currentUser.name,
        comment: actionComment || actionName
      });

      setShowModal(false);
      setModalAction(null);

      // Send WhatsApp notification
      setTimeout(() => {
        notifyApprovalAction(
          {
            id: request.id,
            refNo: request.ref_no,
            title: request.title,
            description: request.description,
            type: request.type,
            priority: request.priority,
            status: newStatus,
            submitter: request.submitter_name,
            dept: request.dept,
            createdAt: request.created_at,
            approvals: [],
            comments: []
          },
          actionName,
          currentUser.name,
          actionComment
        );
      }, 100);
    } catch (error: any) {
      alert(`Failed to process action: ${error.message}`);
      console.error('Error processing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await addComment({
        request_id: request.id,
        by_user_id: currentUser.id,
        by_user_name: currentUser.name,
        comment: comment.trim()
      });
      setComment('');
    } catch (error: any) {
      alert(`Failed to add comment: ${error.message}`);
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContactSubmitter = () => {
    const submitter = users.find(u => u.id === request.submitter_id);
    contactSubmitter(
      {
        id: request.id,
        refNo: request.ref_no,
        title: request.title,
        description: request.description,
        type: request.type,
        priority: request.priority,
        status: request.status,
        submitter: request.submitter_name,
        dept: request.dept,
        createdAt: request.created_at,
        approvals: [],
        comments: []
      },
      submitter?.phone
    );
  };

  const handleExportDetail = () => {
    exportRequestDetailToExcel({
      id: request.id,
      refNo: request.ref_no,
      title: request.title,
      description: request.description,
      type: request.type,
      priority: request.priority,
      status: request.status,
      submitter: request.submitter_name,
      dept: request.dept,
      createdAt: request.created_at,
      approvals: approvals.map(a => ({
        stage: a.stage,
        by: a.by_user_name,
        action: a.action,
        comment: a.comment,
        timestamp: a.created_at
      })),
      comments: comments.map(c => ({
        by: c.by_user_name,
        text: c.comment,
        timestamp: c.created_at
      }))
    });
  };

  return (
    <div className="p-7">
      {/* Back button */}
      <div
        onClick={onBack}
        className="flex items-center gap-2 text-[#2563EB] text-sm cursor-pointer mb-5 font-semibold hover:underline"
      >
        <span>←</span>
        <span>Back to Requests</span>
      </div>

      {/* Header card */}
      <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-6 mb-4">
        <div className="text-xs text-[#2563EB] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {request.ref_no}
        </div>
        <div className="text-xl font-bold text-[#1A2E4A] mb-3">{request.title}</div>
        <div className="flex gap-4 flex-wrap text-xs text-[#4A6A8A]">
          <div className="flex items-center gap-1">
            <span>📋</span>
            <span>{request.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>{request.priority}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👤</span>
            <span>{request.submitter_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{formatDate(request.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Main content */}
        <div className="flex flex-col gap-4">
          {/* Description */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3.5">Description</div>
            <p className="text-sm text-[#1A2E4A] leading-relaxed">{request.description}</p>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3.5">Approval Timeline</div>

            {approvals.length === 0 ? (
              <div className="text-center py-8 text-[#8AAAC8] text-sm">
                <div className="text-3xl mb-2">⏳</div>
                <div>No approvals yet</div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {approvals.map((approval, idx) => {
                  const isApproved = approval.action === 'Approved';
                  const isRejected = approval.action === 'Rejected';
                  const borderColor = isApproved ? '#22C55E44' : isRejected ? '#EF444444' : '#A78BFA44';
                  const dotColor = isApproved ? '#22C55E' : isRejected ? '#EF4444' : '#A78BFA';

                  return (
                    <div key={idx} className="flex gap-3">
                      <div className={`flex gap-3 flex-1 p-3.5 rounded-xl border bg-[#E6F0FB]`} style={{ borderColor }}>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0"
                          style={{ borderColor: dotColor, color: dotColor, background: `${dotColor}22` }}
                        >
                          {isApproved ? '✓' : isRejected ? '✗' : '?'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-[#1A2E4A]">{approval.action}</div>
                          <div className="text-xs text-[#4A6A8A] mt-0.5 flex items-center gap-2">
                            <span>by {approval.by_user_name}</span>
                            <span
                              className="text-[10px] bg-[#D6E8F8] px-1.5 py-0.5 rounded"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {formatDate(approval.created_at)}
                            </span>
                          </div>
                          {approval.comment && (
                            <div className="text-xs text-[#4A6A8A] bg-[#F0F6FF] border-l-3 border-l-[#A8C8E8] rounded-lg px-2.5 py-2 mt-2 italic">
                              {approval.comment}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-bold px-2 py-1 rounded-md bg-white text-[#4A6A8A] h-fit">
                          {approval.stage}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3.5">Comments</div>

            {comments.length === 0 ? (
              <div className="text-center py-6 text-[#8AAAC8] text-sm mb-4">
                <div className="text-2xl mb-1">💬</div>
                <div>No comments yet</div>
              </div>
            ) : (
              <div className="space-y-2.5 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className="bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#1A2E4A]">{c.by_user_name}</span>
                      <span className="text-[10px] text-[#8AAAC8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <div className="text-sm text-[#4A6A8A]">{c.comment}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
              <button
                onClick={handleAddComment}
                className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-[#1D4ED8] transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3">Current Status</div>
            <div className="bg-[#DBEAFE] border border-[#2563EB] text-[#2563EB] rounded-xl px-4 py-3 text-center font-bold text-sm">
              {request.status}
            </div>
          </div>

          {/* Actions */}
          {canApprove() && (
            <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
              <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3">Actions</div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAction('approve')}
                  className="bg-[#22C55E] text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#16A34A] transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className="bg-[#EF4444] text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#DC2626] transition-colors"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => handleAction('clarify')}
                  className="bg-[#A855F7] text-white rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-[#9333EA] transition-colors"
                >
                  ? Request Clarification
                </button>
              </div>
            </div>
          )}

          {/* Export & Contact */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3">Tools</div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportDetail}
                className="bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-[#4CAF50] hover:text-white transition-all"
              >
                📊 Export to Excel
              </button>
              <button
                onClick={handleContactSubmitter}
                className="bg-[#E8F8F5] border border-[#14B8A6] text-[#0F766E] rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-[#14B8A6] hover:text-white transition-all"
              >
                💬 Contact Submitter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-[#C2D9F0] rounded-[20px] p-8 w-full max-w-md">
            <div className="text-lg font-bold text-[#1A2E4A] mb-4">
              Confirm {modalAction === 'approve' ? 'Approval' : modalAction === 'reject' ? 'Rejection' : 'Clarification Request'}
            </div>
            <div className="mb-5">
              <label className="text-xs text-[#4A6A8A] font-bold tracking-wide uppercase block mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors resize-vertical h-20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmAction}
                disabled={processing}
                className="flex-1 bg-[#2563EB] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="flex-1 bg-[#F0F6FF] border border-[#C2D9F0] text-[#4A6A8A] rounded-lg py-3 text-sm font-bold hover:bg-[#E6F0FB] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
