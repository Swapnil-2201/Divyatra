import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Shield,
  Lock,
  Mail,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Server,
  Activity,
  Layers,
} from 'lucide-react';
import { TempleEmblem } from '../../components/common/Logo';

export const DivyatraAdministration = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { showToast } = useNotification();

  const [selectedRole, setSelectedRole] = useState('authority'); // 'authority' | 'admin'
  const [email, setEmail] = useState('authority@divyatra.in');
  const [password, setPassword] = useState('Authority@123');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedTemple, setAssignedTemple] = useState('somnath');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleSelect = (roleType) => {
    setSelectedRole(roleType);
    setErrorMessage('');
    if (roleType === 'authority') {
      setEmail('authority@divyatra.in');
      setPassword('Authority@123');
    } else if (roleType === 'admin') {
      setEmail('admin@divyatra.in');
      setPassword('Admin@123');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const res = await login(email, password);

    if (res.success) {
      if (res.user.role === 'admin' || res.user.role === 'authority') {
        showToast(
          `Security Clearance Approved: Logged in as ${res.user.name} (${res.user.role.toUpperCase()})`,
          'success'
        );
        navigate('/admin');
      } else {
        setErrorMessage(
          'Access Denied: Standard devotee accounts are restricted from accessing the State Command Matrix.'
        );
        showToast('Devotee credentials cannot access the Command Center', 'error');
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials or security key.');
      showToast(res.error || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#070D19] text-white flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#102A56]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D5A63A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <TempleEmblem className="w-11 h-11" isDark={true} />
          <div>
            <strong className="text-sm font-serif tracking-wide text-white block">
              DivYatra Administration
            </strong>
            <span className="text-[10px] text-[#D5A63A] uppercase tracking-widest block font-mono">
              State Operations Matrix
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cluster: Online (256-bit TLS)
          </span>
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            &larr; Devotee Portal
          </Link>
        </div>
      </div>

      {/* Main Admin Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-4">
        <div className="bg-[#0B172E]/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 sm:p-9 shadow-2xl space-y-5 sm:space-y-6">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5A63A]/10 border border-[#D5A63A]/30 text-[#D5A63A] text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>Official Shrine Management Gate</span>
            </div>

            <h1 className="font-serif text-xl sm:text-3xl font-bold text-white tracking-tight">
              Command Matrix Login
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Authorized access for Gujarat Temple Trust Officers, Shrine Marshals & State Operations Board.
            </p>
          </div>

          {/* Quick 1-Click Role Switcher */}
          <div className="bg-[#070D19]/80 p-2.5 sm:p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center font-mono">
              Authorized Operational Clearances
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('authority')}
                className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                  selectedRole === 'authority'
                    ? 'bg-[#102A56] text-[#D5A63A] border border-[#D5A63A]/50 shadow-md'
                    : 'bg-[#0B172E] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#D5A63A] shrink-0" />
                <span className="truncate">Temple Authority</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                  selectedRole === 'admin'
                    ? 'bg-[#102A56] text-[#D5A63A] border border-[#D5A63A]/50 shadow-md'
                    : 'bg-[#0B172E] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D5A63A] shrink-0" />
                <span className="truncate">Trust Admin</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Official Department Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@divyatra.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#070D19] border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#D5A63A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Security Passcode *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#070D19] border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#D5A63A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {selectedRole === 'authority' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Assigned Shrine Jurisdiction
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={assignedTemple}
                    onChange={(e) => setAssignedTemple(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070D19] border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#D5A63A] transition-colors"
                  >
                    <option value="somnath">Shree Somnath Jyotirlinga Trust</option>
                    <option value="dwarka">Shree Dwarkadhish Mandir Board</option>
                    <option value="ambaji">Shree Arasuri Ambaji Mata Trust</option>
                    <option value="pavagadh">Shree Mahakali Mandir Pavagadh</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#102A56] via-[#1B3B74] to-[#D5A63A] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Verifying Cryptographic Tokens...</span>
              ) : (
                <>
                  <span>Access State Command Matrix</span>
                  <ArrowRight className="w-4 h-4 text-[#D5A63A]" />
                </>
              )}
            </button>
          </form>

          {/* Security Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-[10.5px] text-slate-500 text-center space-y-1">
            <p className="flex items-center justify-center gap-1 font-mono">
              <Server className="w-3 h-3 text-[#D5A63A]" />
              <span>Gujarat State Data Centre (GSDC) Secure Node</span>
            </p>
            <p>Unlawful intrusion attempts are logged under the IT Act 2000.</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 z-10">
        <span>&copy; {new Date().getFullYear()} Gujarat Pavitra Yatradham Vikas Board. All Rights Reserved.</span>
      </div>

    </div>
  );
};
