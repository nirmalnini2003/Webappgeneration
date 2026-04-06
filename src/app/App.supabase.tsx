import { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from './components/LoginSupabase';
import { Dashboard } from './components/DashboardSupabase';
import { RequestsList } from './components/RequestsListSupabase';
import { RequestDetail } from './components/RequestDetailSupabase';
import { NewRequest } from './components/NewRequestSupabase';
import { AdminShell } from './components/AdminShellSupabase';
import { Sidebar } from './components/SidebarSupabase';
import { useRequests } from '../hooks/useRequests';
import { useUsers } from '../hooks/useUsers';

type Page = 'login' | 'dashboard' | 'requests' | 'detail' | 'new-request' | 'admin';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { requests, loading: requestsLoading } = useRequests();
  const { users, loading: usersLoading } = useUsers();

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F6FF]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-[#1A2E4A]">Loading BNRI System...</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('dashboard');
    setViewMode('all');
  };

  const handleNavigate = (page: Page, mode?: 'all' | 'mine') => {
    setCurrentPage(page);
    if (mode) setViewMode(mode);
  };

  const handleViewRequest = (id: string) => {
    setSelectedRequestId(id);
    setCurrentPage('detail');
  };

  // Admin view
  if (user.role === 'admin' && currentPage === 'admin') {
    return (
      <AdminShell
        currentUser={user}
        users={users}
        requests={requests}
        loading={usersLoading || requestsLoading}
        onLogout={handleLogout}
        onNavigate={() => setCurrentPage('dashboard')}
        onViewRequest={handleViewRequest}
      />
    );
  }

  // Main app layout
  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar
        currentUser={user}
        currentPage={currentPage}
        requests={requests}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex-1 bg-[#F0F6FF] overflow-y-auto">
        {currentPage === 'dashboard' && (
          <Dashboard currentUser={user} requests={requests} loading={requestsLoading} />
        )}

        {currentPage === 'requests' && (
          <RequestsList
            currentUser={user}
            requests={requests}
            viewMode={viewMode}
            loading={requestsLoading}
            onViewRequest={handleViewRequest}
            onSetViewMode={setViewMode}
          />
        )}

        {currentPage === 'detail' && selectedRequestId && (
          <RequestDetail
            requestId={selectedRequestId}
            currentUser={user}
            users={users}
            onBack={() => setCurrentPage('requests')}
          />
        )}

        {currentPage === 'new-request' && (
          <NewRequest
            currentUser={user}
            onNavigate={() => setCurrentPage('requests')}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
