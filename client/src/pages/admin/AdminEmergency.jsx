import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Siren,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Send,
  Users,
  MapPin,
  VolumeX,
  Volume2,
  Watch
} from 'lucide-react';

export const AdminEmergency = () => {
  const { user } = useAuth();
  const [emergencyData, setEmergencyData] = useState(null);
  const [bandData, setBandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosTemple, setSosTemple] = useState('dwarka');
  const [sosZone, setSosZone] = useState('Gate 1 Moksha Dwaar Entry');
  const [sosDetails, setSosDetails] = useState('');
  const [pushToBands, setPushToBands] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useNotification();

  const fetchEmergency = async () => {
    setLoading(true);
    const data = await api.getEmergencyData();
    setEmergencyData(data);
    const bands = await api.getIoTBands();
    if (bands && bands.bands) setBandData(bands);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmergency();
    const interval = setInterval(async () => {
      const bands = await api.getIoTBands();
      if (bands && bands.bands) setBandData(bands);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const hasActiveBandAlert = bandData?.bands?.some((b) => b.emergency);

  const handlePushAuthorityToBands = async (customDetails = null) => {
    setActionLoading(true);
    const officer = user?.name ? `${user.name} (Disaster Command)` : 'Temple Authority HQ';
    await api.pushAuthorityEmergency({
      bandId: 'DV-BAND-0001',
      source: 'AUTHORITY',
      pushedBy: officer,
      type: 'AUTHORITY_EMERGENCY',
      details: customDetails || sosDetails || '⚠ TEMPLE COMMAND ALERT: Evacuation & safety protocol active. Follow staff instructions.',
      location: `${sosTemple.toUpperCase()} - ${sosZone}`,
    });
    showToast('🚨 Emergency alert officially pushed to connected Smart Bands!', 'error');
    const bands = await api.getIoTBands();
    if (bands && bands.bands) setBandData(bands);
    setActionLoading(false);
  };

  const handleClearBandAlert = async (bandId = 'DV-BAND-0001') => {
    setActionLoading(true);
    await api.clearBandEmergency(bandId);
    showToast(`✓ Smart Band (${bandId}) emergency alert cleared and silenced.`, 'success');
    const bands = await api.getIoTBands();
    if (bands && bands.bands) setBandData(bands);
    setActionLoading(false);
  };

  const handleResolveIncident = async (incidentId) => {
    setActionLoading(true);
    await api.resolveIncident(incidentId);
    // Also clear band emergency in case it was linked
    await api.clearBandEmergency('DV-BAND-0001');
    showToast(`Incident #${incidentId} marked RESOLVED. Band alerts cleared.`, 'success');
    await fetchEmergency();
    setActionLoading(false);
  };

  const handleSimulateSOS = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const officer = user?.name ? `${user.name} (Disaster Command)` : 'Temple Authority HQ';

    await api.triggerSOS({
      templeId: sosTemple,
      zone: sosZone,
      details: sosDetails || "Simulated emergency SOS alert triggered from operational desk",
      type: "SECURITY_ASSIST",
      source: "AUTHORITY",
      officerName: officer,
      pushToBands,
    });

    if (pushToBands) {
      await api.pushAuthorityEmergency({
        bandId: 'DV-BAND-0001',
        source: 'AUTHORITY',
        pushedBy: officer,
        type: 'AUTHORITY_EMERGENCY',
        details: sosDetails || `Disaster Drill SOS: ${sosZone} at ${sosTemple.toUpperCase()} shrine.`,
        location: `${sosTemple.toUpperCase()} - ${sosZone}`,
      });
      showToast(`EMERGENCY SOS & Smart Band Push triggered for ${sosTemple.toUpperCase()}!`, 'error');
    } else {
      showToast(`EMERGENCY SOS Triggered for ${sosTemple.toUpperCase()}! Rapid squad dispatched.`, 'error');
    }

    setSosDetails('');
    await fetchEmergency();
    setActionLoading(false);
  };


  return (
    <div className="space-y-8 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
              Disaster Management & Quick Reaction
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              24x7 Emergency Cell Active
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Emergency Response & Incident Command
          </h1>
        </div>
      </div>

      {/* IoT Smart Band Authority Broadcast Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
        hasActiveBandAlert
          ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/50'
          : 'bg-[#0B172B] border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              hasActiveBandAlert ? 'bg-red-600/30 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-300'
            }`}>
              <Watch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                  Devotee IoT Smart Band Mesh Control
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  hasActiveBandAlert
                    ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {hasActiveBandAlert ? '🚨 ACTIVE BAND EMERGENCY' : '✓ Mesh Operational (Standby)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasActiveBandAlert
                  ? 'Devotee wearable bands are currently displaying the official emergency evacuation modal.'
                  : 'Emergency notification modals on bands are suppressed and will ONLY trigger upon official authority push.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            {hasActiveBandAlert ? (
              <button
                disabled={actionLoading}
                onClick={() => handleClearBandAlert('DV-BAND-0001')}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-colors min-h-[40px]"
              >
                <VolumeX className="w-4 h-4" />
                <span>Silence & Clear Band Alert</span>
              </button>
            ) : (
              <button
                disabled={actionLoading}
                onClick={() => handlePushAuthorityToBands()}
                className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-colors min-h-[40px]"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Push Authority Emergency to Bands</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Incidents & Rapid Response Units */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Active Incidents (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                  Active Emergency Incidents
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs text-red-400 font-bold bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                {emergencyData?.activeIncidentCount || 2} In Progress
              </span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {(emergencyData?.activeIncidents || []).map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        {inc.type}
                      </span>
                      <strong className="text-sm font-bold text-white">{inc.templeName}</strong>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded self-start sm:self-auto ${
                      inc.status === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {inc.details}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#D5A63A]" />
                    <span>Assigned Unit: <strong className="text-white">{inc.assignedTeam}</strong></span>
                  </div>

                  {/* Incident Timeline */}
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Response Timeline:</span>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      {inc.timeline?.map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <span className="font-mono text-slate-400">{step.time}:</span>
                          <span>{step.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Authority Action Bar for Incident */}
                  {inc.status !== 'RESOLVED' && (
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        Incident ID: <span className="font-mono text-slate-300">{inc.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handlePushAuthorityToBands(`🚨 INCIDENT ALERT (${inc.templeName}): ${inc.details}`)}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Radio className="w-3 h-3" />
                          <span>Push to Bands</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve & Silence</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Emergency Simulation */}
          <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldAlert className="w-5 h-5 text-[#E97820]" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                Disaster Drill / SOS Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Broadcast a simulated panic/medical incident to test responder readiness and optionally push emergency notification to Devotee Smart Bands.
            </p>

            <form onSubmit={handleSimulateSOS} className="space-y-3.5 sm:space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Shrine</label>
                  <select
                    value={sosTemple}
                    onChange={(e) => setSosTemple(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white min-h-[44px]"
                  >
                    <option value="somnath">Somnath Jyotirlinga</option>
                    <option value="dwarka">Dwarkadhish Temple</option>
                    <option value="ambaji">Ambaji Shaktipeeth</option>
                    <option value="pavagadh">Pavagadh Mahakali</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Specific Zone</label>
                  <input
                    type="text"
                    value={sosZone}
                    onChange={(e) => setSosZone(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Incident Scenario Details</label>
                <input
                  type="text"
                  value={sosDetails}
                  onChange={(e) => setSosDetails(e.target.value)}
                  placeholder="e.g. Minor queue slowdown near North turnstiles due to broken baggage scanner."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white min-h-[44px]"
                />
              </div>

              {/* Checkbox toggle for IoT smart band push */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <label htmlFor="pushToBandsCheckbox" className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    id="pushToBandsCheckbox"
                    type="checkbox"
                    checked={pushToBands}
                    onChange={(e) => setPushToBands(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 bg-slate-800 border-slate-700 focus:ring-red-500 focus:ring-2 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-white block">
                      Push Emergency Alert Modal to Pilgrim Smart Bands (IoT)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Devotees will receive official high-priority red alert overlay with tactile vibration.
                    </span>
                  </div>
                </label>
                <Watch className="w-5 h-5 text-slate-500 shrink-0" />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Siren className="w-4 h-4" />
                <span>{actionLoading ? 'Broadcasting...' : 'Trigger Drill SOS Alert'}</span>
              </button>
            </form>
          </div>
        </div>


        {/* 24x7 Emergency Contact Directory (Right col) */}
        <div className="space-y-6">
          <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <PhoneCall className="w-5 h-5 text-[#E97820]" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                Emergency Hotlines Directory
              </h3>
            </div>

            <div className="space-y-2.5">
              {(emergencyData?.emergencyContacts || []).map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2"
                >
                  <div>
                    <strong className="text-xs font-bold text-white block">{c.name}</strong>
                    <span className="text-[10.5px] text-emerald-400">Available {c.available}</span>
                  </div>
                  <a
                    href={`tel:${c.number.replace(/\s+/g, '')}`}
                    className="w-full xs:w-auto text-center px-3 py-1 bg-[#102A56] hover:bg-[#1B3B74] text-[#D5A63A] rounded-lg text-xs font-bold font-mono border border-slate-700 min-h-[36px] flex items-center justify-center"
                  >
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reaction Squads Status */}
          <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-base font-bold text-white pb-2 border-b border-slate-800">
              Rapid Response Squads Roster
            </h3>
            <div className="space-y-2 text-xs">
              {(emergencyData?.responseUnits || []).map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div>
                    <strong className="text-white block">{u.name}</strong>
                    <span className="text-[10px] text-slate-400">{u.location} • {u.personnel} personnel</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    u.status === 'ON_MISSION'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
