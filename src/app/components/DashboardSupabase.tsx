import type { Database } from '../../lib/database.types';
import { openWhatsAppOwner } from '../utils/whatsapp';

type User = Database['public']['Tables']['users']['Row'];
type Request = Database['public']['Tables']['requests']['Row'];

interface DashboardProps {
  currentUser: User;
  requests: Request[];
  loading: boolean;
}

export function Dashboard({ currentUser, requests, loading }: DashboardProps) {

  // Calculate stats based on user role
  const getStats = () => {
    let filteredRequests = requests;

    // Filter by role
    if (currentUser.role === 'requester') {
      filteredRequests = requests.filter(r => r.submitter_id === currentUser.id);
    } else if (currentUser.role !== 'approver_final' && currentUser.role !== 'admin') {
      const typeMap: Record<string, string> = {
        approver_finance: 'Finance',
        approver_it: 'IT',
        approver_legal: 'Legal',
        approver_hr: 'HR'
      };
      const myType = typeMap[currentUser.role];
      if (myType) {
        filteredRequests = requests.filter(r => r.type === myType);
      }
    }

    const total = filteredRequests.length;
    const pending = filteredRequests.filter(r => !['Approved', 'Rejected'].includes(r.status)).length;
    const approved = filteredRequests.filter(r => r.status === 'Approved').length;
    const rejected = filteredRequests.filter(r => r.status === 'Rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  // Get type breakdown
  const getTypeBreakdown = () => {
    const types = ['Finance', 'IT', 'Procurement', 'Legal', 'HR'];
    const breakdown: { type: string; count: number; color: string }[] = [];
    const maxCount = Math.max(...types.map(t => requests.filter(r => r.type === t).length), 1);

    const colors: Record<string, string> = {
      Finance: '#3B82F6',
      IT: '#A78BFA',
      Procurement: '#2DD4BF',
      Legal: '#F59E0B',
      HR: '#EF4444'
    };

    types.forEach(type => {
      const count = requests.filter(r => r.type === type).length;
      breakdown.push({ type, count, color: colors[type] || '#888' });
    });

    return { breakdown, maxCount };
  };

  const { breakdown, maxCount } = getTypeBreakdown();

  // Get status breakdown
  const getStatusBreakdown = () => {
    const statuses = [
      'Pending Review',
      'Under Review',
      'Needs Clarification',
      'Approved L1',
      'Pending Final',
      'Approved',
      'Rejected'
    ];

    const statusColors: Record<string, string> = {
      'Pending Review': '#F59E0B',
      'Under Review': '#3B82F6',
      'Needs Clarification': '#A78BFA',
      'Approved L1': '#2DD4BF',
      'Pending Final': '#2DD4BF',
      'Approved': '#22C55E',
      'Rejected': '#EF4444'
    };

    return statuses.map(status => ({
      status,
      count: requests.filter(r => r.status === status).length,
      color: statusColors[status] || '#888'
    })).filter(s => s.count > 0);
  };

  const statusBreakdown = getStatusBreakdown();

  if (loading) {
    return (
      <div className="p-7 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-[#1A2E4A]">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[22px] font-bold tracking-tight text-[#1A2E4A]">Dashboard</div>
          <div className="text-sm text-[#4A6A8A] mt-0.5">
            Welcome back, {currentUser.name.split(' ')[0]}
          </div>
        </div>
        <button
          onClick={openWhatsAppOwner}
          className="bg-[#1a3323] border border-[#25D366] text-[#25D366] rounded-lg px-4 py-2.5 text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all"
        >
          💬 WhatsApp Chat
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-l-[3px] border-l-[#3B82F6]">
          <div className="text-[32px] font-bold tracking-tight text-[#3B82F6]">{stats.total}</div>
          <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Total Requests</div>
        </div>
        <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-l-[3px] border-l-[#F59E0B]">
          <div className="text-[32px] font-bold tracking-tight text-[#F59E0B]">{stats.pending}</div>
          <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Pending</div>
        </div>
        <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-l-[3px] border-l-[#22C55E]">
          <div className="text-[32px] font-bold tracking-tight text-[#22C55E]">{stats.approved}</div>
          <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Approved</div>
        </div>
        <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-4 border-l-[3px] border-l-[#EF4444]">
          <div className="text-[32px] font-bold tracking-tight text-[#EF4444]">{stats.rejected}</div>
          <div className="text-xs text-[#4A6A8A] mt-1 font-semibold tracking-wide uppercase">Rejected</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Type breakdown */}
        <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
          <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-4">Requests by Type</div>
          <div className="flex flex-col gap-2.5">
            {breakdown.map(({ type, count, color }) => (
              <div key={type} className="flex items-center gap-2.5">
                <div className="text-xs text-[#4A6A8A] w-[90px] flex-shrink-0">{type}</div>
                <div className="flex-1 bg-[#E6F0FB] rounded h-2 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${Math.round((count / maxCount) * 100)}%`,
                      background: color
                    }}
                  />
                </div>
                <div className="text-xs text-[#1A2E4A] w-6 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-[#C2D9F0] rounded-[14px] p-5">
          <div className="text-xs font-bold text-[#4A6A8A] tracking-wide uppercase mb-4">Status Overview</div>
          <div className="flex flex-col gap-2">
            {statusBreakdown.map(({ status, count, color }) => (
              <div key={status} className="flex items-center justify-between py-2 border-b border-[#C2D9F0] last:border-b-0">
                <div className="flex items-center gap-2 flex-1 text-sm text-[#4A6A8A]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span>{status}</span>
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
  );
}
