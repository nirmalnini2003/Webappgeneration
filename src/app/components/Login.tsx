import { useState } from 'react';
import { User } from '../data/mockData';
import { openWhatsAppOwner } from '../utils/whatsapp';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

export function Login({ onLogin, users }: LoginProps) {
  const [step, setStep] = useState<'select' | 'requester' | 'staff'>('select');
  const [requesterTab, setRequesterTab] = useState<'signin' | 'register'>('signin');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regDept, setRegDept] = useState('Operations');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');

  const handleLogin = () => {
    const user = users.find(u =>
      u.username.toLowerCase() === mobile.toLowerCase() &&
      u.password === password &&
      u.active
    );

    if (!user) {
      setError('Invalid mobile number or password.');
      return;
    }

    setError('');
    onLogin(user);
  };

  const handleRegister = () => {
    if (!regName || !regMobile || !regPassword) {
      setError('All fields are required');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regPassword2) {
      setError('Passwords do not match');
      return;
    }
    if (users.find(u => u.username === regMobile)) {
      setError('Mobile number already registered');
      return;
    }

    const newUser: User = {
      id: users.length + 1,
      name: regName,
      username: regMobile,
      password: regPassword,
      role: 'requester',
      dept: regDept,
      active: true,
      mustChangePwd: false,
      phone: regMobile,
      email: `${regMobile}@bnriinfra.com`
    };

    onLogin(newUser);
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

        {/* Step 2a: Requester login/register */}
        {step === 'requester' && (
          <div>
            <button
              onClick={() => setStep('select')}
              className="text-[#2563EB] text-sm font-semibold mb-4 hover:underline"
            >
              ← Back
            </button>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setRequesterTab('signin'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  requesterTab === 'signin'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F0F6FF] text-[#4A6A8A] border border-[#C2D9F0]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setRequesterTab('register'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  requesterTab === 'register'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F0F6FF] text-[#4A6A8A] border border-[#C2D9F0]'
                }`}
              >
                Register
              </button>
            </div>

            {requesterTab === 'signin' ? (
              <div>
                <div className="mb-4">
                  <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
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
                  className="w-full bg-[#2563EB] text-white rounded-lg py-3 text-base font-bold hover:bg-[#1D4ED8] transition-colors"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Nivetha R."
                    className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Mobile Number (used as Login ID)</label>
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Department</label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option>Operations</option>
                    <option>Finance</option>
                    <option>IT</option>
                    <option>Legal</option>
                    <option>HR</option>
                    <option>Marketing</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={regPassword2}
                    onChange={(e) => setRegPassword2(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    placeholder="Re-enter password"
                    className="w-full bg-[#F0F6FF] border border-[#C2D9F0] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                {error && (
                  <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-lg px-4 py-3 text-sm text-[#DC2626] font-semibold mb-4">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleRegister}
                  className="w-full bg-[#2563EB] text-white rounded-lg py-3 text-base font-bold hover:bg-[#1D4ED8] transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2b: Staff/Admin login */}
        {step === 'staff' && (
          <div>
            <button
              onClick={() => setStep('select')}
              className="text-[#2563EB] text-sm font-semibold mb-4 hover:underline"
            >
              ← Back
            </button>
            <div className="mb-4">
              <label className="text-xs text-[#4A6A8A] font-semibold tracking-wide uppercase block mb-2">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
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
              className="w-full bg-[#16A34A] text-white rounded-lg py-3 text-base font-bold hover:bg-[#15803D] transition-colors"
            >
              Sign In
            </button>
            <div className="mt-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-3">
              <p className="text-xs text-[#2563EB] font-bold mb-1">Default Credentials</p>
              <p className="text-xs text-[#4A6A8A] leading-relaxed">
                admin / admin123 | bob, ravi, carol, priya, david / pass123
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
