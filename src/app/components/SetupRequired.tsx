export function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F6FF] via-[#E6F0FB] to-[#DBEAFE] p-6">
      <div className="max-w-2xl w-full bg-white border-2 border-[#2563EB] rounded-[20px] p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-[#1A2E4A] mb-2">Supabase Setup Required</h1>
          <p className="text-sm text-[#4A6A8A]">
            Your BNRI Infrastructure System needs to be connected to Supabase
          </p>
        </div>

        <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-[#92400E] mb-1">Environment Variables Not Configured</div>
              <div className="text-sm text-[#78350F]">
                The application requires valid Supabase credentials to function.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg p-4">
            <h2 className="font-bold text-[#1A2E4A] mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Setup Instructions</span>
            </h2>
            <ol className="space-y-3 text-sm text-[#4A6A8A]">
              <li className="flex gap-2">
                <span className="font-bold text-[#2563EB] min-w-[24px]">1.</span>
                <div>
                  <strong>Create a Supabase Project</strong>
                  <div className="text-xs mt-1">
                    Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] underline">app.supabase.com</a> and create a new project
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#2563EB] min-w-[24px]">2.</span>
                <div>
                  <strong>Run the Database Schema</strong>
                  <div className="text-xs mt-1">
                    In your Supabase project, go to SQL Editor and run the SQL from <code className="bg-[#1A2E4A] text-[#E6F0FB] px-1.5 py-0.5 rounded">supabase-schema.sql</code>
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#2563EB] min-w-[24px]">3.</span>
                <div>
                  <strong>Get Your API Credentials</strong>
                  <div className="text-xs mt-1">
                    Navigate to Project Settings → API and copy your Project URL and anon/public key
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#2563EB] min-w-[24px]">4.</span>
                <div>
                  <strong>Update Environment Variables</strong>
                  <div className="text-xs mt-1">
                    Edit <code className="bg-[#1A2E4A] text-[#E6F0FB] px-1.5 py-0.5 rounded">.env.local</code> and replace the placeholder values:
                  </div>
                  <div className="bg-[#1A2E4A] text-[#E6F0FB] p-2 rounded mt-2 text-xs font-mono">
                    VITE_SUPABASE_URL=https://yourproject.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=your-actual-anon-key
                  </div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#2563EB] min-w-[24px]">5.</span>
                <div>
                  <strong>Restart the Development Server</strong>
                  <div className="text-xs mt-1">
                    After updating the environment variables, restart your development server
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-[#DBEAFE] border border-[#2563EB] rounded-lg p-4">
            <h3 className="font-bold text-[#1A2E4A] mb-2 flex items-center gap-2">
              <span>📖</span>
              <span>Complete Documentation</span>
            </h3>
            <p className="text-sm text-[#4A6A8A] mb-2">
              For detailed setup instructions including user creation and GitHub deployment, see:
            </p>
            <code className="bg-white border border-[#C2D9F0] text-[#2563EB] px-3 py-1.5 rounded text-sm font-mono inline-block">
              DEPLOYMENT.md
            </code>
          </div>
        </div>

        <div className="text-center text-xs text-[#8AAAC8]">
          <p>BNRI Infrastructure Request & Approval System</p>
          <p className="mt-1">Powered by Supabase + React + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
