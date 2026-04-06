import { useState } from 'react';
import { User, Request, ROLE_LABELS } from '../data/mockData';
import { openWhatsAppOwner } from '../utils/whatsapp';
import { HelpModal } from './HelpModal';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  requests: Request[];
  onNavigate: (page: any, mode?: 'all' | 'mine') => void;
  onLogout: () => void;
}

export function Sidebar({ currentUser, currentPage, requests, onNavigate, onLogout }: SidebarProps) {
  const [showHelp, setShowHelp] = useState(false);
  const pendingStatuses = ['Pending Review', 'Under Review', 'Needs Clarification'];

  const getPendingCount = () => {
    return requests.filter(r => {
      if (currentUser.role === 'requester') {
        return r.submitter === currentUser.name && !['Approved', 'Rejected'].includes(r.status);
      }
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
    }).length;
  };

  return (
    <div className="w-[220px] bg-white border-r border-[#C2D9F0] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#C2D9F0]">
        <h2 className="text-lg font-bold tracking-tight">
          BNRI<span className="text-[#2563EB]">INFRA</span>
        </h2>
        <span className="text-[10px] text-[#8AAAC8] tracking-wide uppercase">Approval System</span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-[#C2D9F0] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#DBEAFE] border border-[#2563EB] flex items-center justify-center text-sm font-bold text-[#2563EB]">
          {currentUser.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#1A2E4A] truncate">{currentUser.name}</div>
          <div className="text-[10px] text-[#4A6A8A]">{ROLE_LABELS[currentUser.role]}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-3 flex-1">
        <div
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer transition-all border-l-3 ${
            currentPage === 'dashboard'
              ? 'bg-[#DBEAFE] text-[#2563EB] border-l-[#2563EB]'
              : 'text-[#4A6A8A] border-l-transparent hover:bg-[#E6F0FB] hover:text-[#1A2E4A]'
          }`}
        >
          <span className="text-base w-5 text-center">⬛</span>
          <span className="text-sm font-medium">Dashboard</span>
        </div>

        <div
          onClick={() => onNavigate('requests', 'all')}
          className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer transition-all border-l-3 ${
            currentPage === 'requests'
              ? 'bg-[#DBEAFE] text-[#2563EB] border-l-[#2563EB]'
              : 'text-[#4A6A8A] border-l-transparent hover:bg-[#E6F0FB] hover:text-[#1A2E4A]'
          }`}
        >
          <span className="text-base w-5 text-center">📄</span>
          <span className="text-sm font-medium">All Requests</span>
          {getPendingCount() > 0 && (
            <span className="ml-auto bg-[#2563EB] text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
              {getPendingCount()}
            </span>
          )}
        </div>

        {currentUser.role !== 'requester' && (
          <div
            onClick={() => onNavigate('requests', 'mine')}
            className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer transition-all border-l-3 ${
              currentPage === 'requests'
                ? 'bg-[#DBEAFE] text-[#2563EB] border-l-[#2563EB]'
                : 'text-[#4A6A8A] border-l-transparent hover:bg-[#E6F0FB] hover:text-[#1A2E4A]'
            }`}
          >
            <span className="text-base w-5 text-center">👤</span>
            <span className="text-sm font-medium">My Tasks</span>
          </div>
        )}

        <div
          onClick={() => onNavigate('new-request')}
          className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer transition-all border-l-3 ${
            currentPage === 'new-request'
              ? 'bg-[#DBEAFE] text-[#2563EB] border-l-[#2563EB]'
              : 'text-[#4A6A8A] border-l-transparent hover:bg-[#E6F0FB] hover:text-[#1A2E4A]'
          }`}
        >
          <span className="text-base w-5 text-center">➕</span>
          <span className="text-sm font-medium">New Request</span>
        </div>
      </nav>

      {/* WhatsApp button */}
      <div className="px-5 py-3 border-t border-[#C2D9F0]">
        <button
          onClick={openWhatsAppOwner}
          className="w-full bg-[#1a3323] border border-[#25D366] text-[#25D366] rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all"
        >
          💬 WhatsApp
        </button>
      </div>

      {/* Help & Logout */}
      <div className="px-5 py-4 border-t border-[#C2D9F0] space-y-2">
        <div
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 text-xs text-[#8AAAC8] cursor-pointer px-2 py-2 rounded-lg hover:text-[#2563EB] hover:bg-[#DBEAFE]/20 transition-all"
        >
          <span>❓</span>
          <span>Help & Guide</span>
        </div>
        <div
          onClick={onLogout}
          className="flex items-center gap-2 text-xs text-[#8AAAC8] cursor-pointer px-2 py-2 rounded-lg hover:text-[#DC2626] hover:bg-[#FEE2E2]/20 transition-all"
        >
          <span>⬅</span>
          <span>Logout</span>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
