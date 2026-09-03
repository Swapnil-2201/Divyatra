import React, { useState, useEffect } from 'react';
import { useCrowd } from '../../context/CrowdContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MetricCard } from '../../components/common/MetricCard';
import {
  Users,
  Clock,
  AlertTriangle,
  Radio,
  RadioTower,
  Shield,
  Activity,
  Send,
  ArrowRight,
  TrendingUp,
  Volume2,
  CheckCircle2,
  Sliders,
  Flame,
  Sparkles,
  Building2,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTempleAssignment, getQueueStatus, getDarshanSchedule } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const AdminDashboard = () => {
  const { crowdData, temples, triggerSimulationPulse, isSimulating } = useCrowd();
  const { showToast, updateAdvisory } = useNotification();
  const { user, logout } = useAuth();

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('INFO');
  const [broadcasting, setBroadcasting] = useState(false);

  // ── Supabase: load authority's temple assignment & live data ──────────────
  const [templeAssignment, setTempleAssignment] = useState(null);
  const [liveQueue, setLiveQueue] = useState(null);
  const [todayDarshan, setTodayDarshan] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const isStaff = user?.role === 'authority' || user?.role === 'admin' ||
                    user?.supabaseRole === 'temple_authority' || user?.supabaseRole === 'trust_admin';
    if (!isStaff) return;

    getMyTempleAssignment().then((assignment) => {
      if (!assignment) return;
      setTempleAssignment(assignment);
      const tid = assignment.temple_id;
      getQueueStatus(tid).then(setLiveQueue);
      getDarshanSchedule(tid).then(setTodayDarshan);
    });
  }, [user]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) {
      showToast('Please provide broadcast title and advisory message', 'warning');
      return;
    }
    setBroadcasting(true);
    await api.broadcastAdvisory({
      title: broadcastTitle,
      body: broadcastBody,
      severity: broadcastSeverity,
      templeId: 'all'
    });
    updateAdvisory(`${broadcastTitle}: ${broadcastBody}`, broadcastSeverity.toLowerCase());
    showToast('Advisory broadcasted to 15,420 active pilgrim apps!', 'success');
    setBroadcastTitle('');
    setBroadcastBody('');
    setBroadcasting(false);
  };

  // Derive assigned temple name for display
  const assignedTempleName = templeAssignment?.temples?.name
    ?? user?.assignedTemple
    ?? null;
  const authorityRoleLabel =
    user?.supabaseRole === 'trust_admin' || user?.role === 'admin' ? 'Trust Admin'
    : user?.supabaseRole === 'temple_authority' || user?.role === 'authority' ? 'Temple Authority'
    : 'Staff';

  return (
    <div className="space-y-8">

      {/* Authority Identity Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#0B172B]/80 rounded-2xl border border-[#D5A63A]/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D5A63A]/20 border border-[#D5A63A]/40 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#D5A63A]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{user?.name || 'Authority Officer'}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-[#D5A63A] uppercase tracking-wider">{authorityRoleLabel}</span>
              {assignedTempleName && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {assignedTempleName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#D5A63A]">
              State Operations Command Center
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              System Active (All Nodes Nominal)
            </span>
          </div>
          <h1 className="font-serif text-xl sm:text-3xl font-bold text-white mt-1">
            Pilgrimage Flow Command Matrix
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            to="/admin/alerts"
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-2 transition-colors min-h-[40px]"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>3 Active AI Alerts</span>
          </Link>

          <Link
            to="/admin/emergency"
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white text-xs font-bold shadow-md transition-colors min-h-[40px] flex items-center"
          >
            Emergency Response &rarr;
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          title="Active Pilgrims in Shrines"
          value={crowdData?.totalActivePilgrims ? crowdData.totalActivePilgrims.toLocaleString() : "15,620"}
          subtitle="Concurrent premise headcounts"
          icon={Users}
          color="dark"
          trend="up"
          trendValue="+4.1%"
        />

        <MetricCard
          title="Average Waiting Time"
          value={`${crowdData?.averageWaitTimeMinutes || 34} mins`}
          subtitle="Across 4 sanctum queues"
          icon={Clock}
          color="dark"
          trend="down"
          trendValue="-6 mins"
        />

        <MetricCard
          title="Active Critical Zones"
          value={crowdData?.activeCriticalZones || 3}
          subtitle="Gate turnstiles exceeding 75%"
          icon={AlertTriangle}
          color="dark"
          badge="High Watch"
        />

        <MetricCard
          title="Computer Vision Health"
          value="64 Cams"
          subtitle="99.9% Edge Node Uptime"
          icon={Radio}
          color="dark"
          badge="Online"
        />
      </div>

      {/* Temple Telemetry Matrix Table */}
      <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-white">
              Live Shrines Telemetry Matrix
            </h3>
            <p className="text-xs text-slate-400">Continuous edge updates from YOLOv8 AI counting nodes</p>
          </div>
          <Link to="/admin/crowd" className="text-xs font-bold text-[#E97820] hover:underline flex items-center gap-1 min-h-[36px]">
            <span>Open CCTV Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 touch-scroll">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4">Pilgrimage Shrine</th>
                <th className="py-3 px-3 sm:px-4">Crowd Occupancy</th>
                <th className="py-3 px-3 sm:px-4">Est. Queue Wait</th>
                <th className="py-3 px-3 sm:px-4">Active Devotees</th>
                <th className="py-3 px-3 sm:px-4">Status & Action</th>
                <th className="py-3 px-3 sm:px-4 text-right">Quick Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {temples.map((t) => {
                const overview = crowdData?.templeOverview?.find((o) => o.templeId === t.id);
                const pct = overview?.crowdPercentage || t.liveStatus.crowdPercentage;
                const isHigh = pct >= 75;
                const isMed = pct >= 45 && pct < 75;

                return (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-bold">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-[#E97820]">
                      ~{overview?.avgWait || t.liveStatus.estimatedWaitMinutes} mins
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-mono text-slate-300">
                      {(overview?.activeCount || t.liveStatus.activePilgrimsInPremise).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                          isHigh
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : isMed
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {overview?.statusLabel || t.liveStatus.statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <Link
                        to={`/admin/crowd?temple=${t.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-block min-h-[36px]"
                      >
                        Monitor Cams
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authority Public Broadcast Control & Flow Throttle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Public Pilgrim Advisory Broadcaster */}
        <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <RadioTower className="w-5 h-5 text-[#E97820]" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-white">
              Broadcast Live Pilgrim Advisory
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Push instant real-time banner updates to all connected mobile apps and digital display signages.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Advisory Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Dwarka Moksha Dwaar Flow Regulation"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#E97820] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Advisory Message Content</label>
              <textarea
                rows={3}
                required
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="e.g. Devotees are advised to utilize North Gate 3 turnstiles for 15-min faster entry."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#E97820]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
              <select
                value={broadcastSeverity}
                onChange={(e) => setBroadcastSeverity(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 min-h-[44px]"
              >
                <option value="INFO">Severity: Normal Advisory (Info)</option>
                <option value="WARNING">Severity: High Congestion (Warning)</option>
                <option value="CRITICAL">Severity: Emergency Urgent (Critical)</option>
              </select>

              <button
                type="submit"
                disabled={broadcasting}
                className="px-5 py-2.5 bg-[#E97820] hover:bg-[#D36A18] text-white font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Push</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Operational Throttles */}
        <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-[#D5A63A]" />
            <h3 className="font-serif text-lg font-bold text-white">
              Dynamic Gate Quota & Throttle Controls
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Manage automated turnstile departure rates to regulate inner sanctum density.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block">Dwarka Moksha Dwaar (Turnstiles 1-4)</strong>
                <span className="text-amber-400 font-semibold">Running at 85% safety capacity</span>
              </div>
              <button
                onClick={() => showToast('Reserve Turnstiles 5 & 6 Activated', 'success')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
              >
                Open Reserve Gates
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block">Pavagadh Summit Ropeway Landing</strong>
                <span className="text-slate-400">Departure rate: 40 pilgrims/min</span>
              </div>
              <button
                onClick={() => showToast('Ropeway throttle reduced by 20%', 'info')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700"
              >
                Throttle 20%
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block">Somnath Sabha Mandap Walkway</strong>
                <span className="text-emerald-400 font-semibold">Dual-lane flow active (Smooth)</span>
              </div>
              <button
                onClick={() => showToast('Continuous flow advisory active', 'info')}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg font-bold"
              >
                Standard Flow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
