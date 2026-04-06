import { useState } from 'react';
import { User, Request, STATUS_COLORS, TYPE_COLORS, PRIORITY_COLORS } from '../data/mockData';
import { exportRequestsToExcel } from '../utils/exportExcel';

interface RequestsListProps {
  currentUser: User;
  requests: Request[];
  viewMode: 'all' | 'mine';
  onViewRequest: (id: number) => void;
  onSetViewMode: (mode: 'all' | 'mine') => void;
}

export function RequestsList({ currentUser, requests, viewMode, onViewRequest, onSetViewMode }: RequestsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const getFilteredRequests = () => {
    let filtered = requests;

    // Filter by view mode
    if (viewMode === 'mine') {
      if (currentUser.role === 'requester') {
        filtered = filtered.filter(r => r.submitter === currentUser.name);
      } else {
        const pendingStatuses = ['Pending Review', 'Under Review', 'Needs Clarification'];
        filtered = filtered.filter(r => {
          if (['Approved', 'Rejected'].includes(r.status)) return false;
          if (currentUser.role === 'final_approver') {
            return ['Pending Final', 'Approved L1'].includes(r.status);
          }
          const typeMap: Record<string, string> = {
            approver_finance: 'Finance',
            approver_it: 'IT',
            approver_legal: 'Legal',
            approver_hr: 'HR'
          };
          const myType = typeMap[currentUser.role];
          return myType && r.type === myType && pendingStatuses.includes(r.status);
        });
      }
    } else {
      // All requests - filter by scope
      const typeMap: Record<string, string> = {
        approver_finance: 'Finance',
        approver_it: 'IT',
        approver_legal: 'Legal',
        approver_hr: 'HR'
      };

      if (currentUser.role !== 'final_approver' && currentUser.role !== 'admin') {
        const myType = typeMap[currentUser.role];
        if (myType) {
          filtered = filtered.filter(r => r.type === myType);
        } else if (currentUser.role === 'requester') {
          const myDept = currentUser.dept || '';
          if (myDept) {
            filtered = filtered.filter(r => r.dept === myDept || r.submitter === currentUser.name);
          } else {
            filtered = filtered.filter(r => r.submitter === currentUser.name);
          }
        }
      }
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.refNo.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  const handleExportExcel = () => {
    const filename = viewMode === 'mine'
      ? `BNRI_My_Tasks_${new Date().toISOString().split('T')[0]}.xlsx`
      : `BNRI_All_Requests_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportRequestsToExcel(filteredRequests, filename);
  };

  const handleExportPDF = () => {
    alert('PDF export - Print this page or use browser Print to PDF feature');
    window.print();
  };

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[22px] font-bold tracking-tight text-[#1A2E4A]">
            {viewMode === 'mine' ? 'My Tasks' : 'All Requests'}
          </div>
          <div className="text-sm text-[#4A6A8A] mt-0.5">
            {filteredRequests.length} {viewMode === 'mine' ? (currentUser.role === 'requester' ? 'requests submitted by you' : 'pending requests assigned to you') : 'requests in your scope'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#4CAF50] hover:text-white transition-all"
          >
            📊 Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-[#FDE8E8] border border-[#EF4444] text-[#C62828] rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        {/* View mode tabs */}
        <div className="flex gap-1 bg-white border border-[#C2D9F0] rounded-lg p-1">
          <button
            onClick={() => onSetViewMode('all')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-transparent text-[#4A6A8A] hover:bg-[#F0F6FF]'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => onSetViewMode('mine')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'mine'
                ? 'bg-[#2563EB] text-white'
                : 'bg-transparent text-[#4A6A8A] hover:bg-[#F0F6FF]'
            }`}
          >
            My Tasks
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search requests..."
          className="flex-1 min-w-[160px] bg-white border border-[#C2D9F0] rounded-lg px-3.5 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors"
        />

        {/* Status filters */}
        <div className="flex gap-1.5">
          {['All', 'Pending Review', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                  : 'border-[#C2D9F0] bg-white text-[#4A6A8A] hover:border-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#2563EB]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#C2D9F0] rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[100px_1fr_100px_90px_110px_80px] gap-0 bg-[#E6F0FB] px-4 py-2.5 text-[10px] font-bold text-[#8AAAC8] tracking-wide uppercase">
          <div>Ref No</div>
          <div>Title</div>
          <div>Type</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Rows */}
        {filteredRequests.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#4A6A8A]">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm font-semibold">No requests found</div>
            <div className="text-xs mt-1">Try adjusting your filters</div>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => onViewRequest(request.id)}
              className="grid grid-cols-[100px_1fr_100px_90px_110px_80px] gap-0 px-4 py-3.5 border-t border-[#C2D9F0] hover:bg-[#E6F0FB] cursor-pointer transition-all items-center"
            >
              <div className="text-xs text-[#2563EB] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {request.refNo}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1A2E4A] truncate">{request.title}</div>
                <div className="text-xs text-[#8AAAC8] mt-0.5 truncate max-w-[300px]">
                  {request.description}
                </div>
              </div>
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md ${TYPE_COLORS[request.type]}`}>
                  {request.type}
                </span>
              </div>
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md ${PRIORITY_COLORS[request.priority]}`}>
                  {request.priority}
                </span>
              </div>
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-xl border whitespace-nowrap ${STATUS_COLORS[request.status]}`}>
                  {request.status}
                </span>
              </div>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewRequest(request.id);
                  }}
                  className="bg-[#2563EB] text-white px-2.5 py-1.5 rounded-md text-xs font-bold hover:bg-[#1D4ED8] transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
