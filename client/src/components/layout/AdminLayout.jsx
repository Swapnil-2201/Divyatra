import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCrowd } from '../../context/CrowdContext';
import { useNotification } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  BellRing,
  BarChart3,
  AlertTriangle,
  Radio,
  RefreshCw,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
  Siren,
  Menu,
  X,
  Volume2
} from 'lucide-react';
import { TempleEmblem } from '../common/Logo';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loginAsPilgrim } = useAuth();
  const { crowdData, triggerSimulationPulse, isSimulating, lastUpdated } = useCrowd();
  const { showToast } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { name: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Live Crowd CCTV', path: '/admin/crowd', icon: Radio, badge: 'Live' },
    { name: 'AI Incident Alerts', path: '/admin/alerts', icon: BellRing, count: crowdData?.activeCriticalZones || 3 },
    { name: 'Predictive Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Emergency Command', path: '/admin/emergency', icon: Siren, highlight: true },
  ];

  const handleExitAdmin = () => {
    loginAsPilgrim();
    showToast('Switched to Pilgrim Devotee Mode', 'info');
    navigate('/');
  };

  const handlePulse = async () => {
    await triggerSimulationPulse();
    showToast('Telemetry refreshed from CCTV edge nodes', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-slate-100 flex flex-col font-sans safe-top">
      
      {/* Top Operations Telemetry Header */}
      <header className="bg-[#0F1E36] border-b border-slate-700/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
              aria-label="Toggle command sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <TempleEmblem className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" isDark={true} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-white tracking-wider truncate">
                    DIVYATRA <span className="text-[#D5A63A]">OPS</span>
                  </span>
                  <span className="hidden xs:flex text-[9px] sm:text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 sm:px-2 py-0.5 rounded-full items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    Command
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">Gujarat Shrines Authority</span>
              </div>
            </Link>
          </div>

          {/* Real-time KPI Bar in Header */}
          <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Active Pilgrims:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {crowdData?.totalActivePilgrims ? crowdData.totalActivePilgrims.toLocaleString() : '15,620'}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Avg Wait:</span>
              <span className="font-bold text-amber-400 text-sm">
                {crowdData?.averageWaitTimeMinutes ? `${crowdData.averageWaitTimeMinutes}m` : '34m'}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">System Alert:</span>
              <span className="font-bold text-red-400 text-xs uppercase">
                {crowdData?.systemAlertLevel || 'ELEVATED_WATCH'}
              </span>
            </div>
          </div>

          {/* Actions: Refresh Simulation, Exit to Pilgrim Web */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={handlePulse}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50 min-h-[36px]"
              title="Simulate CCTV AI crowd pulse"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D5A63A] ${isSimulating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Simulate Pulse</span>
            </button>

            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition-colors min-h-[36px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Portal</span>
            </Link>

            <button
              onClick={handleExitAdmin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#E97820]/20 hover:bg-[#E97820]/30 text-[#E97820] border border-[#E97820]/40 text-xs font-bold transition-colors min-h-[36px]"
              title="Switch to devotee experience"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch to Pilgrim</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Center Layout with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-xs"
          />
        )}
        
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0B172B] border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 flex flex-col h-full justify-between">
            <div className="space-y-6">
              
              {/* Duty Officer Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                    DS
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-white truncate">{user?.name || 'Devendra Sharma'}</h5>
                    <p className="text-[11px] text-[#D5A63A] truncate">Operations Director</p>
                    <span className="text-[10px] text-slate-400">Badge: DY-CMD-9021</span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Command Modules
                </div>
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#102A56] text-white border border-[#E97820]/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#E97820]' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Temple Status Matrix Quick Jump */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80">
                <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Shrines Under Watch
                </div>
                <div className="space-y-1 text-xs">
                  <div className="px-3 py-1.5 flex items-center justify-between text-slate-300 rounded-lg hover:bg-slate-800/40">
                    <span className="truncate">Somnath Jyotirlinga</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="px-3 py-1.5 flex items-center justify-between text-slate-300 rounded-lg hover:bg-slate-800/40">
                    <span className="truncate">Dwarkadhish Temple</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  </div>
                  <div className="px-3 py-1.5 flex items-center justify-between text-slate-300 rounded-lg hover:bg-slate-800/40">
                    <span className="truncate">Ambaji Shaktipeeth</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="px-3 py-1.5 flex items-center justify-between text-slate-300 rounded-lg hover:bg-slate-800/40">
                    <span className="truncate">Pavagadh Mahakali</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Footer */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>CCTV Computer Vision:</span>
                <span className="text-emerald-400 font-semibold">Online (64 Cams)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Telemetry Sync:</span>
                <span className="text-slate-300">{new Date(lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Outlet View Container */}
        <main className="flex-1 overflow-y-auto bg-[#07111F] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
