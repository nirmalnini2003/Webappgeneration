import { useState } from 'react';
import { Request, User } from '../data/mockData';
import { notifyApprovalAction, contactSubmitter } from '../utils/whatsapp';
import { exportRequestDetailToExcel } from '../utils/exportExcel';

interface RequestDetailProps {
  request: Request;
  currentUser: User;
  users: User[];
  onBack: () => void;
  onUpdateRequest: (request: Request) => void;
}

export function RequestDetail({ request, currentUser, users, onBack, onUpdateRequest }: RequestDetailProps) {
  const [comment, setComment] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'clarify' | null>(null);

  const canApprove = () => {
    if (currentUser.role === 'requester') return false;

    if (currentUser.role === 'final_approver') {
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

  const confirmAction = () => {
    if (!modalAction) return;

    const updatedRequest = { ...request };
    let actionName = '';

    if (modalAction === 'approve') {
      actionName = 'Approved';
      if (currentUser.role === 'final_approver') {
        updatedRequest.status = 'Approved';
        updatedRequest.approvals = [
          ...updatedRequest.approvals,
          {
            stage: 'Final',
            by: currentUser.name,
            action: 'Approved',
            comment: actionComment || 'Approved',
            timestamp: new Date().toISOString()
          }
        ];
      } else {
        updatedRequest.status = 'Approved L1';
        updatedRequest.approvals = [
          ...updatedRequest.approvals,
          {
            stage: 'L1',
            by: currentUser.name,
            action: 'Approved',
            comment: actionComment || 'Approved',
            timestamp: new Date().toISOString()
          }
        ];
      }
    } else if (modalAction === 'reject') {
      actionName = 'Rejected';
      updatedRequest.status = 'Rejected';
      updatedRequest.approvals = [
        ...updatedRequest.approvals,
        {
          stage: currentUser.role === 'final_approver' ? 'Final' : 'L1',
          by: currentUser.name,
          action: 'Rejected',
          comment: actionComment || 'Rejected',
          timestamp: new Date().toISOString()
        }
      ];
    } else if (modalAction === 'clarify') {
      actionName = 'Clarification Requested';
      updatedRequest.status = 'Needs Clarification';
      updatedRequest.approvals = [
        ...updatedRequest.approvals,
        {
          stage: currentUser.role === 'final_approver' ? 'Final' : 'L1',
          by: currentUser.name,
          action: 'Clarification',
          comment: actionComment || 'Needs clarification',
          timestamp: new Date().toISOString()
        }
      ];
    }

    onUpdateRequest(updatedRequest);
    setShowModal(false);
    setModalAction(null);

    // Send WhatsApp notification
    setTimeout(() => {
      notifyApprovalAction(updatedRequest, actionName, currentUser.name, actionComment);
    }, 100);
  };

  const addComment = () => {
    if (!comment.trim()) return;

    const updatedRequest = {
      ...request,
      comments: [
        ...request.comments,
        {
          by: currentUser.name,
          text: comment,
          timestamp: new Date().toISOString()
        }
      ]
    };

    onUpdateRequest(updatedRequest);
    setComment('');
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
    const submitter = users.find(u => u.name === request.submitter);
    contactSubmitter(request, submitter?.phone);
  };

  const handleExportDetail = () => {
    exportRequestDetailToExcel(request);
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
          {request.refNo}
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
            <span>{request.submitter}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{formatDate(request.createdAt)}</span>
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

            {request.approvals.length === 0 ? (
              <div className="text-center py-8 text-[#8AAAC8] text-sm">
                <div className="text-3xl mb-2">⏳</div>
                <div>No approvals yet</div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {request.approvals.map((approval, idx) => {
                  const isApproved = approval.action === 'Approved';
                  const isRejected = approval.action === 'Rejected';
                  const isClarify = approval.action === 'Clarification';
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
                            <span>by {approval.by}</span>
                            <span
                              className="text-[10px] bg-[#D6E8F8] px-1.5 py-0.5 rounded"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {formatDate(approval.timestamp)}
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

            {request.comments.length === 0 ? (
              <div className="text-center py-6 text-[#8AAAC8] text-sm">No comments yet</div>
            ) : (
              <div className="space-y-3 mb-4">
                {request.comments.map((c, idx) => (
                  <div key={idx} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#E6F0FB] border border-[#C2D9F0] flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {c.by[0]}
                    </div>
                    <div className="flex-1 bg-[#E6F0FB] rounded-lg px-3 py-2.5">
                      <div className="flex gap-2 items-center mb-1">
                        <div className="text-xs font-bold text-[#2563EB]">{c.by}</div>
                        <div className="text-[10px] text-[#8AAAC8]">{formatDate(c.timestamp)}</div>
                      </div>
                      <div className="text-sm text-[#1A2E4A] leading-relaxed">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
              <button
                onClick={addComment}
                className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1D4ED8] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status workflow */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3.5">Workflow Status</div>
            <div className="flex flex-col gap-1.5">
              {['L1 Review', 'Final Review', 'Completed'].map((stage, idx) => {
                const isL1Done = request.approvals.some(a => a.stage === 'L1' && a.action === 'Approved');
                const isFinalDone = request.approvals.some(a => a.stage === 'Final' && a.action === 'Approved');
                const isRejected = request.status === 'Rejected';

                let active = false;
                let done = false;
                let rejected = false;

                if (idx === 0) {
                  done = isL1Done;
                  active = !done && !isRejected;
                  rejected = isRejected && !isL1Done;
                } else if (idx === 1) {
                  done = isFinalDone;
                  active = isL1Done && !done && !isRejected;
                  rejected = isRejected && isL1Done;
                } else {
                  done = isFinalDone;
                  active = isFinalDone;
                }

                return (
                  <div
                    key={stage}
                    className={`py-2.5 px-3 text-center text-[10px] font-bold tracking-wide transition-all rounded ${
                      done
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : rejected
                        ? 'bg-[#FEE2E2] text-[#DC2626]'
                        : active
                        ? 'bg-[#DBEAFE] text-[#2563EB]'
                        : 'bg-[#E6F0FB] text-[#8AAAC8]'
                    }`}
                  >
                    {stage}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Request info */}
          <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
            <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3.5">Request Details</div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-[#8AAAC8] mb-1">Type</div>
                <div className="font-semibold text-[#1A2E4A]">{request.type}</div>
              </div>
              <div>
                <div className="text-xs text-[#8AAAC8] mb-1">Priority</div>
                <div className="font-semibold text-[#1A2E4A]">{request.priority}</div>
              </div>
              <div>
                <div className="text-xs text-[#8AAAC8] mb-1">Department</div>
                <div className="font-semibold text-[#1A2E4A]">{request.dept}</div>
              </div>
              <div>
                <div className="text-xs text-[#8AAAC8] mb-1">Submitted by</div>
                <div className="font-semibold text-[#1A2E4A]">{request.submitter}</div>
              </div>
            </div>
          </div>

          {/* Export Detail */}
          <button
            onClick={handleExportDetail}
            className="bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] rounded-lg px-4 py-3 text-xs font-bold hover:bg-[#4CAF50] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            📊 Export Detail
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleContactSubmitter}
            className="bg-[#1a3323] border border-[#25D366] text-[#25D366] rounded-lg px-4 py-3 text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            💬 Contact Submitter
          </button>

          {/* Approval actions */}
          {canApprove() && (
            <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
              <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-3.5">Actions</div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAction('approve')}
                  className="bg-[#16A34A] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#15803D] transition-colors flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleAction('clarify')}
                  className="bg-[#7C3AED] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2"
                >
                  <span>?</span>
                  <span>Request Clarification</span>
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className="bg-[#DC2626] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#B91C1C] transition-colors flex items-center justify-center gap-2"
                >
                  <span>✗</span>
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white border border-[#C2D9F0] rounded-t-[20px] p-7 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1A2E4A] mb-4">
              {modalAction === 'approve' ? 'Approve Request' : modalAction === 'reject' ? 'Reject Request' : 'Request Clarification'}
            </h3>
            <textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              placeholder="Add your comment (optional)..."
              className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg p-3 text-sm outline-none focus:border-[#2563EB] resize-none h-24 mb-4"
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-[#E6F0FB] border border-[#C2D9F0] text-[#4A6A8A] rounded-lg py-3 text-sm font-bold hover:bg-[#D6E8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 rounded-lg py-3 text-sm font-bold text-white transition-colors ${
                  modalAction === 'approve'
                    ? 'bg-[#16A34A] hover:bg-[#15803D]'
                    : modalAction === 'reject'
                    ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
