import React from 'react';
import { useBand } from '../context/BandContext';
import {
  Radio,
  Activity,
  Heart,
  Users,
  MapPin,
  Clock,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  History,
  Terminal,
  Cpu,
} from 'lucide-react';

export const StationDiagnostics = () => {
  const {
    bandId,
    connectionStatus,
    battery,
    signalStrength,
    currentPilgrim,
    currentTemple,
    currentPass,
    passStatus,
    telemetry,
    location,
    crowdStatus,
    events,
    emergencyActive,
    setSelectedPassModal,
  } = useBand();

  return (
    <div className="space-y-6">
      
      {/* Station Header & Device Metadata */}
      <div className="bg-[#0B172B]/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E97820]/20 border border-[#E97820]/40 flex items-center justify-center text-[#E97820]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
                IoT Node Diagnostic Station
              </h2>
              <span className="text-[10.5px] font-mono text-slate-400">
                DivYatra RF-Mesh Protocol v2.4 • Node {bandId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{connectionStatus}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
              Signal: {signalStrength}
            </span>
          </div>
        </div>

        {/* 4 Quick Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">Current Devotee</span>
            <strong className="text-white block font-sans truncate">{currentPilgrim}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">Sanctum Node</span>
            <strong className="text-[#D5A63A] block truncate">{currentTemple}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">Battery Level</span>
            <strong className="text-emerald-400 block font-mono">{battery}% Optimal</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block">Pass State</span>
            <strong className={`block font-mono text-[11px] ${
              passStatus === 'PASS_ACTIVE' ? 'text-emerald-400' :
              passStatus === 'PASS_ISSUED' ? 'text-[#E97820]' : 'text-slate-500'
            }`}>
              {passStatus === 'PASS_ACTIVE' ? 'PASS ACTIVE' :
               passStatus === 'PASS_ISSUED' ? 'PASS ISSUED' : 'NO ACTIVE PASS'}
            </strong>
          </div>
        </div>
      </div>

      {/* Active Pass Payload & QR Inspector */}
      <div className="bg-[#0B172B]/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#E97820]" />
            <h3 className="font-serif text-sm font-bold text-white">Active Digital Pass Payload</h3>
          </div>
          {currentPass && (
            <button
              onClick={() => setSelectedPassModal(currentPass)}
              className="text-xs font-bold text-[#E97820] hover:underline"
            >
              Enlarge Pass & QR
            </button>
          )}
        </div>

        {currentPass ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Booking ID:</span>
                <span className="text-[#D5A63A] font-bold">{currentPass.bookingId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shrine:</span>
                <span className="text-slate-200">{currentPass.templeName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date & Slot:</span>
                <span className="text-white">{currentPass.date} • {currentPass.slot?.split('(')[0]}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pilgrim Count:</span>
                <span className="text-slate-200">{currentPass.pilgrims} Devotees</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Turnstile Status:</span>
                <span className="text-emerald-400 font-bold">{currentPass.status || 'ISSUED'}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                  Encrypted Payload String
                </span>
                <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-850 mt-1 max-h-[64px] overflow-y-auto station-scroll">
                  {currentPass.qrPayload || JSON.stringify(currentPass)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Verified by DivYatra Cryptographic Trust Anchor</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 rounded-xl p-4 text-center text-xs text-slate-400 border border-slate-800/80">
            Waiting for booking confirmation from DivYatra pilgrim app...
          </div>
        )}
      </div>

      {/* Health Vitals & Crowd Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Health Telemetry Box */}
        <div className="bg-[#0B172B]/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-rose-400">
              <Heart className="w-4 h-4 animate-heartbeat fill-rose-400" />
              <h4 className="font-serif text-xs font-bold text-white">Simulated Health Vitals</h4>
            </div>
            <span className="text-[9px] font-mono text-slate-500">SIMULATED (NOT MEDICAL)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Photoplethysmogram (HR)</span>
              <strong className="text-rose-400 font-mono text-sm">{telemetry.heartRate} BPM</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Galvanic Skin Response (Stress)</span>
              <strong className="text-amber-400 font-bold">{telemetry.stressLevel}</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Epidermal Thermal Sensor</span>
              <strong className="text-white font-mono">{telemetry.temperature}°C</strong>
            </div>
          </div>
        </div>

        {/* Crowd Telemetry Box */}
        <div className="bg-[#0B172B]/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-[#D5A63A]">
              <Users className="w-4 h-4" />
              <h4 className="font-serif text-xs font-bold text-white">Sanctum Crowd Sensor Grid</h4>
            </div>
            <span className="text-[9px] font-mono text-emerald-400">LIVE API SYNC</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Gate 1 Crowd Exposure</span>
              <strong className="text-emerald-400 font-bold">{crowdStatus.crowdExposure} ({crowdStatus.exposure})</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Est. Turnstile Queue Wait</span>
              <strong className="text-[#E97820] font-mono text-sm">~{crowdStatus.waitMinutes} mins</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">GPS Positioning Pin</span>
              <strong className="text-slate-200 text-[11px] truncate">{location.templeName} • Gate 1</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Band Chronological Event Timeline */}
      <div className="bg-[#0B172B]/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#D5A63A]" />
            <h3 className="font-serif text-sm font-bold text-white">Band Event Log & Telemetry Timeline</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{events.length} Events Recorded</span>
        </div>

        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 station-scroll font-mono text-xs">
          {events.length > 0 ? (
            events.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">{ev.time}</span>
                <div className="flex-1">
                  <span className={`text-[11px] font-medium ${
                    ev.type === 'EMERGENCY' ? 'text-red-400 font-bold' :
                    ev.type === 'PASS' ? 'text-[#E97820] font-bold' :
                    ev.type === 'QR' ? 'text-emerald-400 font-bold' :
                    ev.type === 'ACK' ? 'text-cyan-400 font-bold' :
                    ev.type === 'CROWD' ? 'text-amber-400' : 'text-slate-300'
                  }`}>
                    {ev.event}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                  {ev.type || 'SYS'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-500 py-4">No events logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
