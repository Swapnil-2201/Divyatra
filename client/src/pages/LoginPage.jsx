import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  Lock,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { TempleEmblem } from '../components/common/Logo';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('pilgrim@divyatra.in');
  const [password, setPassword] = useState('Pilgrim@123');
  const [phone, setPhone] = useState('+91 98250 12345');
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, loading } = useAuth();
  const { showToast } = useNotification();

  // Quick Devotee Demo Fill
  const handleQuickDemoFill = () => {
    setEmail('pilgrim@divyatra.in');
    setPassword('Pilgrim@123');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'login') {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome, ${res.user.name}! Authenticated successfully.`, 'success');
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      } else {
        setErrorMessage(res.error || 'Invalid devotee credentials');
        showToast(res.error || 'Authentication failed', 'error');
      }
    } else {
      if (!name || !phone || !email || !password) {
        setErrorMessage('Please fill in all devotee details');
        return;
      }

      const res = await register({
        name,
        email,
        password,
        phone,
        role: 'pilgrim',
      });

      if (res.success) {
        showToast(`Devotee account created successfully! Welcome to DivYatra.`, 'success');
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      } else {
        setErrorMessage(res.error || 'Registration failed');
        showToast(res.error || 'Registration failed', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-5 sm:space-y-6 bg-white p-5 sm:p-9 rounded-3xl border border-[#E5DED0] shadow-luxury animate-fade-in">
        
        {/* Devotee Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <TempleEmblem className="h-12 sm:h-16 w-auto drop-shadow-md" />
          </div>

          <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest text-[#E97820] block">
            Official Pilgrim Portal
          </span>
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#102A56]">
            {activeTab === 'login' ? 'Devotee Sign In' : 'Create Devotee Account'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {activeTab === 'login'
              ? 'Access your Darshan E-Passes, Aarti slot reservations, and sacred Prasadam orders.'
              : 'Register to manage guaranteed Darshan slots, family yatra circuits, and fast-track entries.'}
          </p>

          {redirectPath && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] sm:text-[11.5px] font-semibold text-amber-900 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E97820] shrink-0" />
              <span>Please sign in to proceed with your booking reservation.</span>
            </div>
          )}
        </div>

        {/* 1-Click Demo Devotee Login */}
        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5DED0] flex items-center justify-between gap-2.5">
          <div className="text-left min-w-0 pr-2">
            <span className="text-[11px] font-bold text-[#102A56] block">Demo Pilgrim Account</span>
            <span className="text-[10px] text-gray-500 font-mono truncate block">pilgrim@divyatra.in</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C5] text-[#102A56] hover:bg-orange-50 hover:border-[#E97820] text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0 min-h-[36px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E97820]" />
            <span>Quick Fill</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#102A56] mb-1">Devotee Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A56] mb-1">Mobile Number (for SMS Passes) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#102A56] mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devotee@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102A56] mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{activeTab === 'login' ? 'Sign In as Devotee' : 'Create Devotee Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center pt-3 border-t border-slate-100 space-y-3">
          {activeTab === 'login' ? (
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className="text-xs text-[#102A56] hover:text-[#E97820] font-semibold transition-colors"
            >
              New devotee? <strong>Create your free account</strong>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className="text-xs text-[#102A56] hover:text-[#E97820] font-semibold transition-colors"
            >
              Already registered? <strong>Sign in to your account</strong>
            </button>
          )}

          {/* Discreet Staff Portal Link */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/DivyatraAdministration"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-[#102A56] hover:underline"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#D5A63A]" />
              <span>Temple Authority & State Trust Administration Portal &rarr;</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
