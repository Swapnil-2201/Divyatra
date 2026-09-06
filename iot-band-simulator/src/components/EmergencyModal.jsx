import React from 'react';
import { useBand } from '../context/BandContext';
import { ShieldAlert, AlertTriangle, X, Radio, Clock, MapPin, User } from 'lucide-react';

export const EmergencyModal = () => {
  const {
    emergencyActive,
    silenceEmergency,
    emergencyData,
    bandId,
    currentPilgrim,
    location,
  } = useBand();

  if (!emergencyActive) return null;

  const pilgrimName = emergencyData?.pilgrim || currentPilgrim || 'Ramesh Patel (Devotee)';
  const incidentLocation = emergencyData?.location || `${location.templeName} - ${location.gate}`;
  const timestamp = emergencyData?.timestamp
    ? new Date(emergencyData.timestamp).toLocaleTimeString()
    : new Date().toLocaleTimeString();
  const pushedBy = emergencyData?.pushedBy || 'Temple Authority Central Command';
  const alertDetails = emergencyData?.details || 'Official security and emergency assistance notice dispatched to device.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] border-2 border-red-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.5)] space-y-5 text-white animate-scaleUp">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-black text-red-400 tracking-wide">
                ⚠ EMERGENCY ASSISTANCE REQUESTED
              </h3>
              <span className="text-[10px] font-mono text-amber-400 font-semibold block">
                🏛️ Temple Authority Official Push Broadcast
              </span>
            </div>
          </div>

          <button
            onClick={() => silenceEmergency()}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Silence and Close Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authority Origin Badge */}
        <div className="bg-red-950/50 rounded-xl p-3 border border-red-500/30 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Authority Issuer:</span>
            <strong className="text-white font-bold">{pushedBy}</strong>
          </div>
          <p className="text-[11px] text-red-200 leading-relaxed pt-0.5 border-t border-red-900/40">
            {alertDetails}
          </p>
        </div>

        {/* Incident Summary Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-red-500/20 space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Band ID:</span>
            <strong className="text-white font-bold">{bandId}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pilgrim:</span>
            <strong className="text-[#D5A63A]">{pilgrimName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Location:</span>
            <strong className="text-slate-200 text-right truncate max-w-[200px]">{incidentLocation}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Timestamp:</span>
            <strong className="text-emerald-400">{timestamp}</strong>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Authority Dispatch:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TRANSMITTED TO HQ</span>
            </span>
          </div>
        </div>

        {/* Demo Simulation Notice */}
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-200 text-center leading-relaxed">
          <p className="font-semibold">
            Authority Command Center has logged this incident alert.
          </p>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            (Simulated Emergency Demonstration • No actual police or medical emergency triggered)
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => silenceEmergency()}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider transition-colors"
        >
          Acknowledge & Silence Alert
        </button>
      </div>
    </div>
  );
};
