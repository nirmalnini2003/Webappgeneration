interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold">📘 BNRI Infra - System Guide</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg px-3 py-1 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">📋 System Overview</h3>
            <p className="text-gray-600 leading-relaxed">
              BNRI Infrastructure Request & Approval System is a comprehensive workflow management platform for handling
              organizational requests with multi-level approval processes.
            </p>
          </section>

          {/* Workflow */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">🔄 Approval Workflow</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <ol className="space-y-2 text-sm text-gray-700">
                <li><strong>1. Request Submission</strong> - User creates a request with details and attachments</li>
                <li><strong>2. L1 Approval</strong> - Routes to Finance/IT/Legal/HR approver based on request type</li>
                <li><strong>3. Final Approval</strong> - After L1 approval, goes to final approver (Director/Manager)</li>
                <li><strong>4. Completion</strong> - Request is marked as Approved or Rejected</li>
              </ol>
            </div>
          </section>

          {/* Request Types */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">📑 Request Types & Routing</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-bold text-blue-800 text-sm">💰 Finance</div>
                <div className="text-xs text-gray-600 mt-1">→ Finance Approver (Bob)</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="font-bold text-purple-800 text-sm">💻 IT</div>
                <div className="text-xs text-gray-600 mt-1">→ IT Approver (Ravi)</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="font-bold text-amber-800 text-sm">⚖️ Legal</div>
                <div className="text-xs text-gray-600 mt-1">→ Legal Approver (Carol)</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="font-bold text-red-800 text-sm">👥 HR</div>
                <div className="text-xs text-gray-600 mt-1">→ HR Approver (Priya)</div>
              </div>
            </div>
          </section>

          {/* Approver Actions */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">✅ Approver Actions</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <span className="text-xl">✓</span>
                <div>
                  <div className="font-bold text-green-800 text-sm">Approve</div>
                  <div className="text-xs text-gray-600">Accept the request and move to next stage</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-xl">✗</span>
                <div>
                  <div className="font-bold text-red-800 text-sm">Reject</div>
                  <div className="text-xs text-gray-600">Deny the request with comments</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <span className="text-xl">?</span>
                <div>
                  <div className="font-bold text-purple-800 text-sm">Request Clarification</div>
                  <div className="text-xs text-gray-600">Ask submitter for more information</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 Key Features</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📊</span>
                <span>Excel export for reports</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">💬</span>
                <span>WhatsApp notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">📝</span>
                <span>Comment threads</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-600">📎</span>
                <span>Document attachments</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-600">🔍</span>
                <span>Advanced search & filters</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">📈</span>
                <span>Real-time dashboard</span>
              </li>
            </ul>
          </section>

          {/* Login Credentials */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">🔐 Demo Login Credentials</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono space-y-1">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Finance:</strong> bob / pass123</div>
              <div><strong>IT:</strong> ravi / pass123</div>
              <div><strong>Legal:</strong> carol / pass123</div>
              <div><strong>HR:</strong> priya / pass123</div>
              <div><strong>Final Approver:</strong> david / pass123</div>
              <div><strong>Requester:</strong> 9123456789 / alice123</div>
            </div>
          </section>

          {/* WhatsApp */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">💬 WhatsApp Integration</h3>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Owner Contact:</strong> 9150459992
              </p>
              <p className="text-xs text-gray-600">
                Automatic WhatsApp notifications are sent for request submissions and approval actions.
                Click WhatsApp buttons throughout the app to send instant notifications.
              </p>
            </div>
          </section>

          {/* Data Persistence */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">💾 Data Persistence</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                All data is stored in your browser's localStorage. Your requests, users, and session will persist
                across page refreshes. To reset the system, clear your browser's localStorage.
              </p>
            </div>
          </section>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            BNRI Infrastructure Request & Approval System • Powered by React & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
