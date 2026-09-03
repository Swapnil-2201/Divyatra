import React, { useState, useEffect, useCallback } from 'react';
import { useCrowd } from '../../context/CrowdContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { SimulatedCCTVStream } from '../../components/crowd/SimulatedCCTVStream';
import { ZoneCongestionMap } from '../../components/crowd/ZoneCongestionMap';
import {
  Radio,
  Eye,
  ShieldCheck,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getMyTempleAssignment, getQueueStatus, updateQueueStatus, writeAuditLog } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const AdminCrowdMonitor = () => {
  const { temples, crowdData } = useCrowd();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [selectedTempleId, setSelectedTempleId] = useState('dwarka');

  // Supabase-backed queue management state
  const [templeAssignment, setTempleAssignment] = useState(null);
  const [queueRows, setQueueRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);  // { id, gate, current_count, estimated_wait_minutes, status }
  const [savingQueue, setSavingQueue] = useState(false);

  const isAuthority = user?.role === 'authority' || user?.role === 'admin' ||
                      user?.supabaseRole === 'temple_authority' || user?.supabaseRole === 'trust_admin';

  const loadQueueData = useCallback(async (templeId) => {
    const rows = await getQueueStatus(templeId);
    if (rows) setQueueRows(rows);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthority) return;
    getMyTempleAssignment().then((assignment) => {
      if (!assignment) return;
      setTempleAssignment(assignment);
      loadQueueData(assignment.temple_id);
    });
  }, [user, isAuthority, loadQueueData]);

  const handleQueueSave = async () => {
    if (!editingRow) return;
    setSavingQueue(true);
    const { data, error } = await updateQueueStatus(editingRow.id, {
      current_count:          parseInt(editingRow.current_count, 10),
      estimated_wait_minutes: parseInt(editingRow.estimated_wait_minutes, 10),
      status:                 editingRow.status,
      updated_by:             user?.id,
    });
    if (error) {
      showToast(`Queue update failed: ${error.message}`, 'error');
    } else {
      showToast(`Queue updated for ${editingRow.gate}`, 'success');
      // Write audit log via server (uses service_role key)
      await writeAuditLog({
        temple_id:   templeAssignment?.temple_id,
        action:      'QUEUE_UPDATED',
        entity_type: 'queue_status',
        entity_id:   editingRow.id,
        old_value:   { status: editingRow.status },
        new_value:   { current_count: editingRow.current_count, status: editingRow.status },
      });
      setEditingRow(null);
      loadQueueData(templeAssignment.temple_id);
    }
    setSavingQueue(false);
  };

  const selectedTemple = temples.find((t) => t.id === selectedTempleId) || temples[0];
  const overview = crowdData?.templeOverview?.find((o) => o.templeId === selectedTempleId);

  return (
    <div className="space-y-8 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Edge Computer Vision Network (Simulated Telemetry)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              64 CCTV Nodes Live
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Live Crowd & CCTV Telemetry Monitor
          </h1>
        </div>

        {/* Temple Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {temples.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTempleId(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTempleId === t.id
                  ? 'bg-[#E97820] text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.shortName || t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main CCTV Stream Preview */}
      {selectedTemple && (
        <SimulatedCCTVStream cams={selectedTemple.cctvCams} templeName={selectedTemple.name} />
      )}

      {/* Zone-by-Zone Breakdown & Diagnostics */}
      {selectedTemple && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif text-lg font-bold text-white">
                Zone-by-Zone Corridor Safety Capacity
              </h3>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {overview?.crowdPercentage || 75}% Occupancy
              </span>
            </div>

            <div className="space-y-4">
              {(overview?.zones || selectedTemple.zones || []).map((zone) => {
                const density = zone.currentDensity || zone.density || 50;
                const threshold = zone.threshold || 75;
                const isExceeded = density >= threshold;
                return (
                  <div key={zone.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-white">{zone.name}</strong>
                      <span className="text-[#E97820] font-bold">
                        {zone.flowRatePerMinute ? `${zone.flowRatePerMinute} pax/min` : `~${zone.waitMinutes || 15}m queue`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-red-500' : density > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${density}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10.5px] text-slate-400">
                      <span>Density: <strong className={isExceeded ? 'text-red-400' : 'text-white'}>{density}%</strong></span>
                      <span>Safety Threshold: {threshold}% ({isExceeded ? 'CORRIDOR ALERT' : 'NOMINAL'})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Spatial Flow Diagnostics */}
          <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif text-lg font-bold text-white">
                Queue Dynamics & Motion Vectoring
              </h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                {overview?.trend?.toUpperCase() || 'STABLE'} DRIFT
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Turnstile Inflow / Outflow</span>
                <p className="text-sm font-bold text-white">
                  {overview?.inflowRate || 58} In / {overview?.outflowRate || 54} Out (pax/min)
                </p>
                <span className="text-[11px] text-emerald-400">
                  {overview?.predictionSummary || 'Within nominal safety envelope'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Physical Queue Extent</span>
                <p className="text-sm font-bold text-white">
                  {overview?.queueLengthMeters || 220} Meters (Barricaded Flow)
                </p>
                <span className="text-[11px] text-amber-400">Continuous walking Darshan enforced</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Recommended Public Window</span>
                <p className="text-sm font-bold text-[#D5A63A]">
                  {overview?.recommendedWindow || '01:30 PM - 03:45 PM'}
                </p>
                <span className="text-[11px] text-slate-400">Published to pilgrim companion app</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Historical & Prediction Chart */}
      <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#D5A63A]">
              Telemetry Historical Trends & Forecast
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-1">
              Hourly Corridor Density Comparison
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400">Spatial Poisson Regression Curve</span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crowdData?.hourlyPredictions || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="somnath" name="Somnath" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="dwarka" name="Dwarka" stroke="#FB923C" strokeWidth={2.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="ambaji" name="Ambaji" stroke="#34D399" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="pavagadh" name="Pavagadh" stroke="#FACC15" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Queue Management Panel — Temple Authorities Only */}
      {isSupabaseConfigured && isAuthority && (
        <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D5A63A]" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">Gate Queue Management</h3>
              </div>
              {templeAssignment?.temples?.name && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Managing: <strong className="text-[#D5A63A]">{templeAssignment.temples.name}</strong>
                </p>
              )}
            </div>
            {!templeAssignment && (
              <p className="text-xs text-amber-400 font-semibold">No temple assignment found in database.</p>
            )}
          </div>

          {queueRows.length === 0 && templeAssignment && (
            <p className="text-xs text-slate-500 italic">Loading queue data...</p>
          )}

          <div className="space-y-3">
            {queueRows.map((row) => (
              <div key={row.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                {editingRow?.id === row.id ? (
                  // Edit form
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white">{row.gate}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Queue Count</label>
                        <input
                          type="number" min="0"
                          value={editingRow.current_count}
                          onChange={(e) => setEditingRow({ ...editingRow, current_count: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#D5A63A] min-h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Wait (mins)</label>
                        <input
                          type="number" min="0"
                          value={editingRow.estimated_wait_minutes}
                          onChange={(e) => setEditingRow({ ...editingRow, estimated_wait_minutes: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#D5A63A] min-h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Status</label>
                        <select
                          value={editingRow.status}
                          onChange={(e) => setEditingRow({ ...editingRow, status: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#D5A63A] min-h-[38px]"
                        >
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleQueueSave}
                        disabled={savingQueue}
                        className="px-4 py-2 bg-[#D5A63A] hover:bg-[#C09030] text-[#070D19] font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {savingQueue ? 'Saving...' : 'Save Update'}
                      </button>
                      <button
                        onClick={() => setEditingRow(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl text-xs border border-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display row
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{row.gate}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-slate-400">{row.current_count} pilgrims</span>
                        <span className="text-[#E97820]">~{row.estimated_wait_minutes} min wait</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${
                          row.status === 'High'   ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : row.status === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : row.status === 'Closed'   ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>{row.status}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingRow({ ...row })}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 min-h-[36px]"
                    >
                      <Edit3 className="w-3 h-3" />
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
