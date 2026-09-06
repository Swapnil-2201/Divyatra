import React, { useState } from 'react';
import { useBand } from '../context/BandContext';
import {
  Sparkles,
  Users,
  Heart,
  ShieldAlert,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const DemoControls = () => {
  const {
    simulatePassReceived,
    simulateCrowdAlert,
    simulateHealthAlert,
    simulateEmergency,
    silenceEmergency,
    resetBandDevice,
  } = useBand();

  const [lastAction, setLastAction] = useState('');

  const handleAction = async (actionName, fn) => {
    setLastAction(actionName);
    await fn();
    setTimeout(() => setLastAction(''), 3000);
  };

  return (
    <div className="bg-[#0B172B]/90 rounded-2xl border border-[#D5A63A]/30 p-5 shadow-2xl backdrop-blur-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#E97820]" />
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              DEMO CONTROLS
            </h3>
            <span className="text-[10px] text-slate-400">Presentation Simulation Tools</span>
          </div>
        </div>

        {lastAction && (
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
            ✓ Triggered: {lastAction}
          </span>
        )}
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        
        {/* 1. Simulate Pass Received */}
        <button
          onClick={() => handleAction('Pass Received', simulatePassReceived)}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-[#E97820]/15 border border-slate-800 hover:border-[#E97820]/40 text-slate-200 hover:text-white font-semibold transition-all group text-left min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-[#E97820]/20 flex items-center justify-center text-[#E97820] group-hover:scale-110 transition-transform shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-[11px]">Simulate Pass Received</span>
            <span className="text-[9.5px] text-slate-400 font-normal">Emit PASS_ISSUED payload</span>
          </div>
        </button>

        {/* 2. Simulate Crowd Alert */}
        <button
          onClick={() => handleAction('Crowd Alert', simulateCrowdAlert)}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-white font-semibold transition-all group text-left min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-[11px]">Simulate Crowd Alert</span>
            <span className="text-[9.5px] text-slate-400 font-normal">Push density surge notification</span>
          </div>
        </button>

        {/* 3. Simulate Health Alert */}
        <button
          onClick={() => handleAction('Health Alert', simulateHealthAlert)}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-slate-200 hover:text-white font-semibold transition-all group text-left min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-[11px]">Simulate Health Alert</span>
            <span className="text-[9.5px] text-slate-400 font-normal">Elevate heart rate & warning</span>
          </div>
        </button>

        {/* 4. Simulate Authority Emergency Push */}
        <button
          onClick={() => handleAction('Authority Emergency Push', simulateEmergency)}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 hover:border-red-500 text-red-200 font-semibold transition-all group text-left min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-[11px]">Push Authority Emergency</span>
            <span className="text-[9.5px] text-red-300 font-normal">Simulate Temple Authority push</span>
          </div>
        </button>

        {/* 5. Silence / Clear Emergency */}
        <button
          onClick={() => handleAction('Emergency Silenced', silenceEmergency)}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/30 hover:border-emerald-500 text-emerald-200 font-semibold transition-all group text-left min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-[11px]">Silence / Clear Alert</span>
            <span className="text-[9.5px] text-emerald-300/80 font-normal">Dismiss emergency beacon</span>
          </div>
        </button>

        {/* 6. Reset Device */}
        <button
          onClick={() => handleAction('Device Reset', resetBandDevice)}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-200 font-semibold transition-all group text-left min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:rotate-180 transition-transform shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-bold text-white text-[11px]">Reset Device</span>
            <span className="text-[9.5px] text-slate-400 font-normal">Clear pass & return to standby</span>
          </div>
        </button>
      </div>

      {/* Required Disclaimer */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10.5px] text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-[#D5A63A] shrink-0 mt-0.5" />
        <span>
          <strong>Presentation Notice:</strong> These controls are explicitly provided for demonstration purposes. They trigger mock hardware telemetry events and socket states to demonstrate real-time wearable integration.
        </span>
      </div>
    </div>
  );
};
