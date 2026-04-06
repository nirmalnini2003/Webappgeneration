import { useState } from 'react';
import type { Database } from '../../lib/database.types';
import { exportRequestsToExcel } from '../utils/exportExcel';

type User = Database['public']['Tables']['users']['Row'];
type Request = Database['public']['Tables']['requests']['Row'];

interface AdminShellProps {
  currentUser: User;
  users: User[];
  requests: Request[];
  loading: boolean;
  onLogout: () => void;
  onNavigate: () => void;
  onViewRequest: (id: string) => void;
}

type AdminPage = 'overview' | 'requests' | 'users';

const ROLE_LABELS: Record<string, string> = {
  requester: 'Requester',
  approver_finance: 'Finance Approver',
  approver_it: 'IT Approver',
  approver_legal: 'Legal Approver',
  approver_hr: 'HR Approver',
  approver_final: 'Final Approver',
  admin: 'Administrator'
};

export function AdminShell({ currentUser, users, requests, loading, onLogout, onNavigate, onViewRequest }: AdminShellProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('overview');
  const [adminReqFilter, setAdminReqFilter] = useState('All');
  const [adminSearch, setAdminSearch] = useState('');

  const stats = {
    total: requests.length,
    pending: requests.filter(r => !['Approved', 'Rejected'].includes(r.status)).length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
    users: users.filter(u => u.active && u.role !== 'admin').length
  };

  const getDeptBreakdown = () => {
    const types = ['Finance', 'IT', 'Procurement', 'Legal', 'HR'];
    const maxCount = Math.max(...types.map(t => requests.filter(r => r.type === t).length), 1);
    const colors: Record<string, string> = {
      Finance: '#3B82F6',
      IT: '#A78BFA',
      Procurement: '#2DD4BF',
      Legal: '#F59E0B',
      HR: '#EF4444'
    };

    return types.map(type => ({
      type,
      count: requests.filter(r => r.type === type).length,
      color: colors[type],
      percentage: Math.round((requests.filter(r => r.type === type).length / maxCount) * 100)
    }));
  };

  const getStatusBreakdown = () => {
    const statuses = [
      { name: 'Pending Review', color: '#F59E0B' },
      { name: 'Under Review', color: '#3B82F6' },
      { name: 'Needs Clarification', color: '#A78BFA' },
      { name: 'Approved L1', color: '#2DD4BF' },
      { name: 'Pending Final', color: '#2DD4BF' },
      { name: 'Approved', color: '#22C55E' },
      { name: 'Rejected', color: '#EF4444' }
    ];

    return statuses.map(s => ({
      ...s,
      count: requests.filter(r => r.status === s.name).length
    })).filter(s => s.count > 0);
  };

  const getFilteredRequests = () => {
    let filtered = requests;

    if (adminReqFilter !== 'All') {
      filtered = filtered.filter(r => r.status === adminReqFilter);
    }

    if (adminSearch) {
      const term = adminSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.ref_no.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.submitter_name.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  const handleExportExcel = () => {
    const filename = `BNRI_Admin_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    const exportData = filteredRequests.map(r => ({
      id: r.id,
      refNo: r.ref_no,
      title: r.title,
      description: r.description,
      type: r.type,
      priority: r.priority,
      status: r.status,
      submitter: r.submitter_name,
      dept: r.dept,
      createdAt: r.created_at,
      approvals: [],
      comments: []
    }));
    exportRequestsToExcel(exportData, filename);
  };

  const handleExportPDF = () => {
    alert('PDF export - Print this page or use browser Print to PDF feature');
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F6FF]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-[#1A2E4A]">Loading Admin Panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Admin Sidebar */}
      <div className="w-[230px] bg-[#FFFBEB] border-r border-[#FDE68A] flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-[#FDE68A]">
          <h2 className="text-base font-extrabold text-[#D97706] tracking-wide uppercase">🛡 BNRI Admin</h2>
          <span className="text-[10px] text-[#B45309] tracking-wider uppercase">Super User Console</span>
        </div>

        <div className="px-5 py-3.5 border-b border-[#FDE68A] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#F59E0B] flex items-center justify-center text-sm font-extrabold text-[#EF4444]">
            A
          </div>
          <div>
            <div className="text-sm font-bold text-[#EF4444]">Admin</div>
            <div className="text-[10px] text-[#92400E]">Super User</div>
          </div>
        </div>

        <nav className="py-2.5 flex-1">
          {[
            { id: 'overview', icon: '⚡', label: 'Overview' },
            { id: 'requests', icon: '📋', label: 'All Requests' },
            { id: 'users', icon: '👥', label: 'User Management' }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setCurrentPage(item.id as AdminPage)}
              className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer transition-all border-l-3 text-sm font-semibold ${
                currentPage === item.id
                  ? 'bg-[#FDE68A] text-[#92400E] border-l-[#D97706]'
                  : 'text-[#92400E] border-l-transparent hover:bg-[#FEF3C7] hover:text-[#D97706]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-[#FDE68A]">
          <button
            onClick={onNavigate}
            className="w-full bg-[#DBEAFE] border border-[#2563EB] text-[#2563EB] rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#2563EB] hover:text-white transition-all mb-2"
          >
            ← Back to Main
          </button>
        </div>

        <div className="px-5 py-4 border-t border-[#FDE68A]">
          <div
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-[#92400E] cursor-pointer px-2 py-2 rounded-lg hover:text-[#DC2626] hover:bg-[#FEE2E2]/30 transition-all"
          >
            <span>⬅</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Admin Main Content */}
      <div className="flex-1 bg-[#F0F6FF] overflow-y-auto">
        {/* Overview */}
        {currentPage === 'overview' && (
          <div className="p-7">
            <div className="text-[22px] font-extrabold text-[#1A2E4A] mb-1">Admin Overview</div>
            <div className="text-sm text-[#4A6A8A] mb-6">Full system snapshot — all departments, all requests</div>

            <div className="grid grid-cols-4 gap-3.5 mb-5">
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#3B82F6]">
                <div className="text-[30px] font-extrabold text-[#3B82F6]">{stats.total}</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Total Requests</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#F59E0B]">
                <div className="text-[30px] font-extrabold text-[#F59E0B]">{stats.pending}</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Pending</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#22C55E]">
                <div className="text-[30px] font-extrabold text-[#22C55E]">{stats.approved}</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Approved</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#EF4444]">
                <div className="text-[30px] font-extrabold text-[#EF4444]">{stats.rejected}</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Rejected</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5 mb-5">
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#A78BFA]">
                <div className="text-[30px] font-extrabold text-[#A78BFA]">{stats.users}</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Active Users</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#2DD4BF]">
                <div className="text-[30px] font-extrabold text-[#2DD4BF]">2.4d</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Avg TAT</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-t-[3px] border-t-[#F59E0B]">
                <div className="text-[30px] font-extrabold text-[#F59E0B]">2</div>
                <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Overdue (&gt;5 days)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
                <div className="text-xs font-bold text-[#7A90B8] tracking-wide uppercase mb-3.5">Requests by Department</div>
                <div className="space-y-3">
                  {getDeptBreakdown().map(({ type, count, color, percentage }) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="text-xs text-[#7A90B8] w-[100px] flex-shrink-0">{type}</div>
                      <div className="flex-1 bg-[#E6F0FB] rounded-md h-3.5 overflow-hidden">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${percentage}%`, background: color }}
                        />
                      </div>
                      <div className="text-xs text-[#C8D8F0] w-6 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
                <div className="text-xs font-bold text-[#7A90B8] tracking-wide uppercase mb-3.5">Status Breakdown</div>
                <div className="space-y-2">
                  {getStatusBreakdown().map(({ name, count, color }) => (
                    <div key={name} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 text-sm text-[#7A90B8]">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span>{name}</span>
                      </div>
                      <div className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Requests */}
        {currentPage === 'requests' && (
          <div className="p-7">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="text-[22px] font-extrabold text-[#1A2E4A]">All Requests</div>
                <div className="text-sm text-[#4A6A8A]">Full view — every request across all users</div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportExcel} className="bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#4CAF50] hover:text-white transition-all">📊 Export Excel</button>
                <button onClick={handleExportPDF} className="bg-[#FDE8E8] border border-[#EF4444] text-[#C62828] rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all">📄 Export PDF</button>
              </div>
            </div>

            <div className="flex gap-2 mb-3.5 flex-wrap">
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="🔍 Search..."
                className="flex-1 min-w-[180px] bg-white border border-[#C2D9F0] rounded-lg px-3.5 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
              <div className="flex gap-1.5">
                {['All', 'Pending Review', 'Approved', 'Rejected', 'Needs Clarification'].map(status => (
                  <button
                    key={status}
                    onClick={() => setAdminReqFilter(status)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      adminReqFilter === status
                        ? 'border-[#2563EB] bg-[#DBEAFE] text-[#2563EB]'
                        : 'border-[#C2D9F0] bg-white text-[#4A6A8A] hover:border-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#2563EB]'
                    }`}
                  >
                    {status === 'All' ? 'All' : status.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#C2D9F0] rounded-[14px] overflow-hidden">
              <div className="grid grid-cols-[50px_100px_1fr_100px_90px_120px_80px] gap-0 bg-[#E6F0FB] px-4 py-2.5 text-[10px] font-bold text-[#8AAAC8] tracking-wide uppercase">
                <div>#</div><div>Ref No</div><div>Title</div><div>Type</div><div>Priority</div><div>Status</div><div>Action</div>
              </div>
              {filteredRequests.map((r, idx) => (
                <div key={r.id} className="grid grid-cols-[50px_100px_1fr_100px_90px_120px_80px] gap-0 px-4 py-3 border-t border-[#C2D9F0] hover:bg-[#D6E8F8] transition-all items-center">
                  <div className="text-xs text-[#4A6A8A]">{idx + 1}</div>
                  <div className="text-xs text-[#2563EB] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.ref_no}</div>
                  <div className="text-sm font-semibold text-[#1A2E4A] truncate">{r.title}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.type}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.priority}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.status}</div>
                  <div>
                    <button
                      onClick={() => onViewRequest(r.id)}
                      className="bg-[#2563EB] text-white px-2.5 py-1 rounded-md text-xs font-bold hover:bg-[#1D4ED8] transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Management */}
        {currentPage === 'users' && (
          <div className="p-7">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="text-[22px] font-extrabold text-[#1A2E4A]">User Management</div>
                <div className="text-sm text-[#4A6A8A]">Manage all system users</div>
              </div>
            </div>

            <div className="bg-white border border-[#C2D9F0] rounded-[14px] overflow-hidden">
              <div className="grid grid-cols-[36px_1fr_1fr_140px_80px] gap-0 bg-[#E6F0FB] px-4 py-2.5 text-[10px] font-bold text-[#8AAAC8] tracking-wide uppercase">
                <div>#</div><div>Name</div><div>Email</div><div>Role</div><div>Status</div>
              </div>
              {users.map((u, idx) => {
                const roleColors: Record<string, [string, string]> = {
                  requester: ['#DBEAFE', '#2563EB'],
                  approver_finance: ['#DCFCE7', '#16A34A'],
                  approver_it: ['#EDE9FE', '#7C3AED'],
                  approver_legal: ['#FEF3C7', '#D97706'],
                  approver_hr: ['#FFE4E6', '#E11D48'],
                  approver_final: ['#CCFBF1', '#0D9488'],
                  admin: ['#FEE2E2', '#DC2626']
                };
                const [bg, fg] = roleColors[u.role] || ['#F0F6FF', '#4A6A8A'];

                return (
                  <div key={u.id} className="grid grid-cols-[36px_1fr_1fr_140px_80px] gap-0 px-4 py-3 border-t border-[#C2D9F0] items-center hover:bg-[#D6E8F8] transition-all">
                    <div className="text-xs text-[#4A6A8A]">{idx + 1}</div>
                    <div className="text-sm font-semibold text-[#1A2E4A]">{u.name}</div>
                    <div className="text-xs text-[#4A6A8A]">{u.email}</div>
                    <div>
                      <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: bg, color: fg }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </div>
                    <div className="text-xs text-[#4A6A8A]">{u.active ? 'Active' : 'Inactive'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
