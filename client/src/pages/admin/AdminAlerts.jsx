import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Send,
  UserCheck,
  RefreshCw,
  Filter,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Search,
  Check,
} from 'lucide-react';

const ALERT_CATEGORIES = [
  { id: 'ALL', label: 'All Incidents' },
  { id: 'CONGESTION_SURGE', label: 'Surge Spikes' },
  { id: 'QUEUE_BOTTLENECK', label: 'Queue Chokepoints' },
  { id: 'ANOMALOUS_MOVEMENT', label: 'Unusual Movement' },
  { id: 'EMERGENCY_INCIDENT', label: 'Emergency Safety' },
];

export const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeNoteInputId, setActiveNoteInputId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useNotification();
  const { user } = useAuth();

  const fetchAlerts = async () => {
    setLoading(true);
    const data = await alertService.getAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    const officer = user?.name || "Operations Control Officer";
    await alertService.acknowledgeAlert(alertId, officer);
    showToast(`Alert ${alertId} acknowledged by ${officer}`, 'success');
    fetchAlerts();
  };

  const handleInvestigate = async (alertId) => {
    const officer = user?.name || "Operations Control Officer";
    await alertService.investigateAlert(alertId, officer, "Zone marshals mobilized for corridor investigation.");
    showToast(`Incident ${alertId} under Investigation. Marshals dispatched!`, 'info');
    fetchAlerts();
  };

  const handleResolve = async (alertId) => {
    const officer = user?.name || "Operations Control Officer";
    await alertService.resolveAlert(alertId, officer);
    showToast(`Alert ${alertId} marked as RESOLVED`, 'success');
    fetchAlerts();
  };

  const handleAddNote = async (alertId) => {
    if (!noteText.trim()) return;
    const author = user?.name || "Duty Commander";
    await alertService.addAlertNote(alertId, author, noteText.trim());
    showToast('Mitigation note added to incident log', 'success');
    setNoteText('');
    setActiveNoteInputId(null);
    fetchAlerts();
  };

  const filteredAlerts = alerts.filter((a) => {
    // 1. Status Filter
    const matchesStatus =
      statusFilter === 'ALL' ||
      a.status === statusFilter ||
      (statusFilter === 'ACTIVE' && (a.status === 'ACTIVE' || !a.status));
    
    // 2. Category Filter
    const matchesCategory =
      categoryFilter === 'ALL' ||
      a.type === categoryFilter ||
      (categoryFilter === 'CONGESTION_SURGE' && a.type === 'CROWD_SURGE');

    return matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-8 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#D5A63A]">
              Automated Incident Queue
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
              AI Vision Model Active
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Corridor Safety, Surge & Queue Alerts
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#E97820] text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {ALERT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              categoryFilter === cat.id
                ? 'bg-[#102A56] text-[#D5A63A] border border-[#D5A63A]/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alerts Grid / List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#0B172B] border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No active incidents matching selected filters.</p>
            <span className="text-xs text-slate-400">All 4 target pilgrimage shrines operating at normal corridor parameters.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
            const isResolved = alert.status === 'RESOLVED';
            const isAck = alert.status === 'ACKNOWLEDGED';
            const isInvestigating = alert.status === 'INVESTIGATING';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-6 rounded-3xl border transition-all duration-300 space-y-4 ${
                  isResolved
                    ? 'bg-[#0B172B]/60 border-slate-800/80 opacity-75'
                    : isCritical
                    ? 'bg-red-950/20 border-red-500/40 shadow-xl'
                    : 'bg-[#0B172B] border-slate-800 shadow-xl'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isResolved
                        ? 'bg-slate-800 text-slate-400'
                        : isCritical
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isResolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E97820]">
                          {alert.templeName} • {alert.zone}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isInvestigating
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : isAck
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/30 text-red-300 animate-pulse'
                        }`}>
                          {alert.status || 'ACTIVE'}
                        </span>
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-1">
                        {alert.title || alert.message}
                      </h3>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.timestamp || alert.createdAt || Date.now()).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Description & Action Plan */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    {alert.description || alert.message}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[#D5A63A]">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">AI Operational Mitigation:</strong>
                      <span>{alert.recommendedAction || alert.actionRequired || "Maintain active monitoring"}</span>
                    </div>
                  </div>
                </div>

                {/* Response Log & Notes Timeline */}
                {alert.responseNotes && alert.responseNotes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Officer Log Timeline
                    </span>
                    <div className="space-y-1">
                      {alert.responseNotes.map((n, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-950/60 text-[11px] flex items-start justify-between gap-2 border border-slate-800/50">
                          <div>
                            <strong className="text-[#D5A63A] mr-1.5">{n.author}:</strong>
                            <span className="text-slate-300">{n.note}</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[10px] shrink-0">
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Note Input Modal / Inline Field */}
                {activeNoteInputId === alert.id && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 animate-fadeIn">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add official officer mitigation note or marshal update..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#E97820] min-h-[44px]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddNote(alert.id)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#E97820] text-white rounded-xl text-xs font-bold hover:bg-[#D36A18] transition-colors min-h-[44px]"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => { setActiveNoteInputId(null); setNoteText(''); }}
                        className="px-3.5 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-700 min-h-[44px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Status footer & 4 Authority Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    {alert.acknowledgedBy && (
                      <span>Assigned: <strong className="text-white">{alert.acknowledgedBy}</strong></span>
                    )}
                    {alert.resolvedAt && (
                      <span className="sm:ml-3 block sm:inline text-emerald-400">Resolved at {new Date(alert.resolvedAt).toLocaleTimeString()}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveNoteInputId(alert.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Add Note</span>
                    </button>

                    {!isResolved && (
                      <>
                        {!isAck && !isInvestigating && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1 min-h-[36px]"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        {!isInvestigating && (
                          <button
                            onClick={() => handleInvestigate(alert.id)}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Investigate</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1 min-h-[36px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
