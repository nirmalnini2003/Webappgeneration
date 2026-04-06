import { useState } from 'react';
import { User, Request, ROLE_LABELS } from '../data/mockData';
import { exportRequestsToExcel } from '../utils/exportExcel';

interface AdminShellProps {
  currentUser: User;
  users: User[];
  requests: Request[];
  onLogout: () => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (id: number) => void;
  onDeleteRequest: (id: number) => void;
  onViewRequest: (id: number) => void;
}

type AdminPage = 'overview' | 'requests' | 'users' | 'tat' | 'reports';

export function AdminShell({ currentUser, users, requests, onLogout, onAddUser, onDeleteUser, onDeleteRequest }: AdminShellProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserMobile, setNewUserMobile] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('requester');
  const [newUserDept, setNewUserDept] = useState('');
  const [newUserPwd, setNewUserPwd] = useState('');
  const [newUserPwd2, setNewUserPwd2] = useState('');
  const [addUserError, setAddUserError] = useState('');
  const [adminReqFilter, setAdminReqFilter] = useState('All');
  const [adminSearch, setAdminSearch] = useState('');

  const stats = {
    total: requests.length,
    pending: requests.filter(r => !['Approved', 'Rejected'].includes(r.status)).length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
    users: users.filter(u => u.active && u.role !== 'admin').length
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserMobile || !newUserEmail || !newUserDept || !newUserPwd) {
      setAddUserError('All fields are required');
      return;
    }
    if (newUserPwd.length < 6) {
      setAddUserError('Password must be at least 6 characters');
      return;
    }
    if (newUserPwd !== newUserPwd2) {
      setAddUserError('Passwords do not match');
      return;
    }

    const user: User = {
      id: users.length + 1,
      name: newUserName,
      username: newUserMobile,
      password: newUserPwd,
      role: newUserRole,
      dept: newUserDept,
      active: true,
      mustChangePwd: false,
      phone: newUserMobile,
      email: newUserEmail
    };

    onAddUser(user);
    setShowAddUserModal(false);
    resetAddUserForm();
  };

  const resetAddUserForm = () => {
    setNewUserName('');
    setNewUserMobile('');
    setNewUserEmail('');
    setNewUserRole('requester');
    setNewUserDept('');
    setNewUserPwd('');
    setNewUserPwd2('');
    setAddUserError('');
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
        r.refNo.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.submitter.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  const handleExportExcel = () => {
    const filename = `BNRI_Admin_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportRequestsToExcel(filteredRequests, filename);
  };

  const handleExportPDF = () => {
    alert('PDF export - Print this page or use browser Print to PDF feature');
    window.print();
  };

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
            { id: 'users', icon: '👥', label: 'User Management' },
            { id: 'tat', icon: '⏱', label: 'TAT Metrics' },
            { id: 'reports', icon: '📊', label: 'Reports' }
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
              <div className="grid grid-cols-[50px_1fr_100px_90px_120px_100px_80px] gap-0 bg-[#E6F0FB] px-4 py-2.5 text-[10px] font-bold text-[#8AAAC8] tracking-wide uppercase">
                <div>#</div><div>Title</div><div>Type</div><div>Priority</div><div>Status</div><div>Submitter</div><div>Delete</div>
              </div>
              {filteredRequests.map((r, idx) => (
                <div key={r.id} className="grid grid-cols-[50px_1fr_100px_90px_120px_100px_80px] gap-0 px-4 py-3 border-t border-[#C2D9F0] hover:bg-[#D6E8F8] transition-all items-center">
                  <div className="text-xs text-[#4A6A8A]">{idx + 1}</div>
                  <div className="text-sm font-semibold text-[#1A2E4A] truncate">{r.title}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.type}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.priority}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.status}</div>
                  <div className="text-xs text-[#4A6A8A]">{r.submitter}</div>
                  <div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete request ${r.refNo}?`)) {
                          onDeleteRequest(r.id);
                        }
                      }}
                      className="bg-[#FEE2E2] border border-[#DC2626] text-[#DC2626] rounded-md px-2.5 py-1 text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all"
                    >
                      Del
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
                <div className="text-sm text-[#4A6A8A]">Add, remove, and manage all system users</div>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1D4ED8] transition-colors"
              >
                + Add User
              </button>
            </div>

            <div className="bg-white border border-[#C2D9F0] rounded-[14px] overflow-hidden">
              <div className="grid grid-cols-[36px_1fr_1fr_140px_80px_130px] gap-0 bg-[#E6F0FB] px-4 py-2.5 text-[10px] font-bold text-[#8AAAC8] tracking-wide uppercase">
                <div>#</div><div>Name</div><div>Email</div><div>Role</div><div>Status</div><div>Action</div>
              </div>
              {users.map((u, idx) => {
                const roleColors: Record<string, [string, string]> = {
                  requester: ['#DBEAFE', '#2563EB'],
                  approver_finance: ['#DCFCE7', '#16A34A'],
                  approver_it: ['#EDE9FE', '#7C3AED'],
                  approver_legal: ['#FEF3C7', '#D97706'],
                  approver_hr: ['#FFE4E6', '#E11D48'],
                  final_approver: ['#CCFBF1', '#0D9488'],
                  admin: ['#FEE2E2', '#DC2626']
                };
                const [bg, fg] = roleColors[u.role] || ['#F0F6FF', '#4A6A8A'];

                return (
                  <div key={u.id} className="grid grid-cols-[36px_1fr_1fr_140px_80px_130px] gap-0 px-4 py-3 border-t border-[#C2D9F0] items-center hover:bg-[#D6E8F8] transition-all">
                    <div className="text-xs text-[#4A6A8A]">{idx + 1}</div>
                    <div className="text-sm font-semibold text-[#1A2E4A]">{u.name}</div>
                    <div className="text-xs text-[#4A6A8A]">{u.email}</div>
                    <div>
                      <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: bg, color: fg }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </div>
                    <div className="text-xs text-[#4A6A8A]">{u.active ? 'Active' : 'Inactive'}</div>
                    <div>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete user ${u.name}?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="bg-[#FEE2E2] border border-[#DC2626] text-[#DC2626] rounded-md px-2.5 py-1 text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAT Metrics */}
        {currentPage === 'tat' && (
          <div className="p-7">
            <div className="text-[22px] font-extrabold text-[#1A2E4A] mb-1">TAT Metrics</div>
            <div className="text-sm text-[#4A6A8A] mb-6">Turnaround time analysis — how fast are requests being processed?</div>

            <div className="grid grid-cols-5 gap-2.5 mb-5">
              <div className="bg-white border border-[#C2D9F0] rounded-lg p-3 text-center">
                <div className="text-[22px] font-extrabold text-[#3B82F6]">2.4d</div>
                <div className="text-[10px] text-[#7A90B8] mt-0.5">Avg Total TAT</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-lg p-3 text-center">
                <div className="text-[22px] font-extrabold text-[#22C55E]">1.1d</div>
                <div className="text-[10px] text-[#7A90B8] mt-0.5">Avg L1 TAT</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-lg p-3 text-center">
                <div className="text-[22px] font-extrabold text-[#F59E0B]">1.3d</div>
                <div className="text-[10px] text-[#7A90B8] mt-0.5">Avg Final TAT</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-lg p-3 text-center">
                <div className="text-[22px] font-extrabold text-[#EF4444]">2</div>
                <div className="text-[10px] text-[#7A90B8] mt-0.5">Overdue Requests</div>
              </div>
              <div className="bg-white border border-[#C2D9F0] rounded-lg p-3 text-center">
                <div className="text-[22px] font-extrabold text-[#A78BFA]">83%</div>
                <div className="text-[10px] text-[#7A90B8] mt-0.5">On-Time Rate</div>
              </div>
            </div>

            <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
              <div className="text-xs font-bold text-[#7A90B8] tracking-wide uppercase mb-3.5">TAT by Request Type (avg days)</div>
              <div className="space-y-2.5">
                {[
                  { type: 'Finance', tat: '3.0d', width: 60, color: '#3B82F6' },
                  { type: 'IT', tat: '2.0d', width: 40, color: '#A78BFA' },
                  { type: 'Procurement', tat: '2.5d', width: 50, color: '#2DD4BF' },
                  { type: 'Legal', tat: '1.5d', width: 30, color: '#F59E0B' },
                  { type: 'HR', tat: '2.2d', width: 45, color: '#EF4444' }
                ].map(({ type, tat, width, color }) => (
                  <div key={type} className="flex items-center gap-2.5">
                    <div className="text-xs text-[#7A90B8] w-[110px] flex-shrink-0">{type}</div>
                    <div className="flex-1 bg-[#E6F0FB] rounded h-2.5 overflow-hidden">
                      <div className="h-full" style={{ width: `${width}%`, background: color }} />
                    </div>
                    <div className="text-xs text-[#1A2E4A] w-10 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {tat}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {currentPage === 'reports' && (
          <div className="p-7">
            <div className="text-[22px] font-extrabold text-[#1A2E4A] mb-1">Department Reports</div>
            <div className="text-sm text-[#4A6A8A] mb-6">Requests breakdown by department and category</div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
                <div className="text-xs font-bold text-[#7A90B8] tracking-wide uppercase mb-3.5">By Department</div>
                <div className="space-y-3">
                  {[
                    { dept: 'Operations', count: 6, width: 100, color: '#3B82F6' },
                    { dept: 'Finance', count: 4, width: 67, color: '#A78BFA' },
                    { dept: 'Legal', count: 2, width: 33, color: '#2DD4BF' },
                    { dept: 'HR', count: 1, width: 17, color: '#F59E0B' }
                  ].map(({ dept, count, width, color }) => (
                    <div key={dept} className="flex items-center gap-3">
                      <div className="text-xs text-[#7A90B8] w-[100px] flex-shrink-0">{dept}</div>
                      <div className="flex-1 bg-[#E6F0FB] rounded-md h-3.5 overflow-hidden">
                        <div className="h-full" style={{ width: `${width}%`, background: color }} />
                      </div>
                      <div className="text-xs text-[#C8D8F0] w-6 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
                <div className="text-xs font-bold text-[#7A90B8] tracking-wide uppercase mb-3.5">Approval Rate by Type</div>
                <div className="space-y-3">
                  {[
                    { type: 'Finance', rate: '50%', width: 50 },
                    { type: 'IT', rate: '100%', width: 100 },
                    { type: 'Legal', rate: '100%', width: 100 },
                    { type: 'HR', rate: '0%', width: 0 }
                  ].map(({ type, rate, width }) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="text-xs text-[#7A90B8] w-[100px] flex-shrink-0">{type}</div>
                      <div className="flex-1 bg-[#E6F0FB] rounded-md h-3.5 overflow-hidden">
                        <div className="h-full bg-[#22C55E]" style={{ width: `${width}%` }} />
                      </div>
                      <div className="text-xs text-[#C8D8F0] w-8 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {rate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAddUserModal(false)}>
          <div className="bg-white border border-[#C2D9F0] rounded-2xl p-7 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-[#2563EB] mb-5">🛡 Add New User</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John David"
                  className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Mobile Number *</label>
                <input
                  type="tel"
                  value={newUserMobile}
                  onChange={(e) => setNewUserMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Email *</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="e.g. john.david@bnriinfra.com"
                className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                  className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                >
                  <option value="requester">Requester</option>
                  <option value="approver_finance">Finance Approver</option>
                  <option value="approver_it">IT Approver</option>
                  <option value="approver_legal">Legal Approver</option>
                  <option value="approver_hr">HR Approver</option>
                  <option value="final_approver">Final Approver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Department *</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  placeholder="e.g. Finance"
                  className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div>
                <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Password *</label>
                <input
                  type="password"
                  value={newUserPwd}
                  onChange={(e) => setNewUserPwd(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase block mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  value={newUserPwd2}
                  onChange={(e) => setNewUserPwd2(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {addUserError && (
              <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-lg px-3.5 py-2.5 text-xs text-[#DC2626] font-semibold mb-3">
                {addUserError}
              </div>
            )}

            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-lg px-3 py-2.5 mb-3.5">
              <div className="text-xs text-[#15803D] font-bold">📱 WhatsApp Auto Notifications</div>
              <div className="text-xs text-[#166534] mt-1">
                Request intake: <strong>9500329430</strong> | Owner approval: <strong>9150459992</strong>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowAddUserModal(false); resetAddUserForm(); }}
                className="flex-1 bg-[#E6F0FB] border border-[#C2D9F0] text-[#4A6A8A] rounded-lg py-2.5 text-sm font-bold hover:bg-[#D6E8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 bg-[#2563EB] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#1D4ED8] transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
