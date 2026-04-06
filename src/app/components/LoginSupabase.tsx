import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { openWhatsAppOwner } from '../utils/whatsapp';

export function Login() {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'select' | 'requester' | 'staff'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F6FF] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 -top-48 -right-48"
           style={{ background: 'radial-gradient(circle, rgba(191,219,254,0.4) 0%, transparent 70%)' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 -bottom-24 -left-24"
           style={{ background: 'radial-gradient(circle, rgba(219,234,254,0.3) 0%, transparent 70%)' }} />

      <div className="bg-white border border-[#C2D9F0] rounded-[20px] p-10 w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[11px] tracking-[4px] text-[#8AAAC8] block mb-2 uppercase">Request & Approval System</span>
          <h1 className="text-4xl font-bold tracking-tight">
            BNR<span className="text-[#2563EB]">INFRA</span>
          </h1>
        </div>

        {/* Supabase Configuration Warning */}
        {!isSupabaseConfigured && (
          <div className="mb-6 bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-xs">
                <div className="font-bold text-[#92400E] mb-1">Configuration Required</div>
                <div className="text-[#78350F]">
                  Supabase environment variables are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file or GitHub secrets.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={openWhatsAppOwner}
            className="bg-[#1a3323] border border-[#25D366] text-[#25D366] rounded-lg px-6 py-2.5 text-sm font-bold hover:bg-[#25D366] hover:text-white transition-all"
          >
            💬 Owner WhatsApp
          </button>
        </div>

        {/* Step 1: Select type */}
        {step === 'select' && (
          <div>
            <p className="text-sm text-[#4A6A8A] mb-4 text-center font-medium">How would you like to continue?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('requester')}
                className="bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-xl p-4 text-left hover:border-[#2563EB] hover:bg-[#DBEAFE] transition-all"
              >
                <div className="text-2xl mb-1">📝</div>
                <div className="text-sm font-bold text-[#1A2E4A]">I'm a Requester</div>
                <div className="text-xs text-[#4A6A8A] mt-0.5">Submit and track approval requests</div>
              </button>
              <button
                onClick={() => setStep('staff')}
                className="bg-[#F0FDF4] border-2 border-[#BBF7D0] rounded-xl p-4 text-left hover:border-[#16A34A] hover:bg-[#DCFCE7] transition-all"
              >
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-bold text-[#1A2E4A]">I'm an Approver / Admin</div>
                <div className="text-xs text-[#4A6A8A] mt-0.5">Review and approve requests</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2a: Requester login */}
        {step === 'requester' && (
          <div>
            <button
              onClick={() => { setStep('select'); setError(''); }}
              className="text-[#2563EB] text-sm font-semibold mb-4 hover:underline"
            >
              ← Back
            </button>

            <div className="mb-4">
              <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice.requester@bnriinfra.com"
                className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Your password"
                className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            {error && (
              <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-lg px-4 py-3 text-sm text-[#DC2626] font-semibold mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-[#2563EB] text-white rounded-lg py-3 text-base font-bold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : !isSupabaseConfigured ? 'Configuration Required' : 'Sign In'}
            </button>
            <div className="mt-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-3">
              <p className="text-xs text-[#2563EB] font-bold mb-1">Demo Credentials</p>
              <p className="text-xs text-[#4A6A8A] leading-relaxed">
                alice.requester@bnriinfra.com / demo123
              </p>
            </div>
          </div>
        )}

        {/* Step 2b: Staff/Admin login */}
        {step === 'staff' && (
          <div>
            <button
              onClick={() => { setStep('select'); setError(''); }}
              className="text-[#2563EB] text-sm font-semibold mb-4 hover:underline"
            >
              ← Back
            </button>
            <div className="mb-4">
              <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bnriinfra.com"
                className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            {error && (
              <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-lg px-4 py-3 text-sm text-[#DC2626] font-semibold mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-[#16A34A] text-white rounded-lg py-3 text-base font-bold hover:bg-[#15803D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : !isSupabaseConfigured ? 'Configuration Required' : 'Sign In'}
            </button>
            <div className="mt-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-3">
              <p className="text-xs text-[#2563EB] font-bold mb-1">Demo Credentials</p>
              <p className="text-xs text-[#4A6A8A] leading-relaxed">
                admin@bnriinfra.com / demo123<br />
                bob.finance@bnriinfra.com / demo123<br />
                david.director@bnriinfra.com / demo123
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
