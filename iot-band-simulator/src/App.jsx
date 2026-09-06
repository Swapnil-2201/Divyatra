import React, { useState } from 'react';
import { BandProvider, useBand } from './context/BandContext';
import { SmartBandChassis } from './components/SmartBandChassis';
import { StationDiagnostics } from './components/StationDiagnostics';
import { DemoControls } from './components/DemoControls';
import { EmergencyModal } from './components/EmergencyModal';
import { PassDetailsModal } from './components/PassDetailsModal';
import {
  Radio,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';

const SimulatorContent = () => {
  const {
    bandId,
    connectionStatus,
    battery,
    signalStrength,
    syncLatestState,
  } = useBand();

  const [activeTab, setActiveTab] = useState('both'); // 'wearable' | 'diagnostics' | 'both'

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-100 flex flex-col justify-between selection:bg-[#E97820] selection:text-white">
      
      {/* ── Top Navigation / Hardware Gateway Bar ── */}
      <header className="border-b border-slate-850 bg-[#0A101C]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E97820] to-[#D5A63A] p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-[#0B172B] rounded-[10px] flex items-center justify-center text-[#E97820] font-serif font-black text-lg">
                🛕
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base sm:text-lg font-black tracking-wide text-white">
                  DIVYATRA SMART BAND
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#E97820]/15 text-[#E97820] border border-[#E97820]/30 text-[9.5px] font-mono font-bold uppercase">
                  Simulator
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-mono">
                Decentralized Temple IoT Wearable Node • ID: {bandId}
              </p>
            </div>
          </div>

          {/* Status Indicators & Gateway State */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <button
              onClick={() => syncLatestState()}
              title="Refresh State from Backend"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">Sync State</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B172B] border border-slate-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold uppercase">{connectionStatus}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">{battery}%</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{signalStrength}</span>
            </div>

            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#102A56] hover:bg-[#1A3A72] text-slate-200 hover:text-white border border-[#D5A63A]/20 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>DivYatra App</span>
              <ExternalLink className="w-3 h-3 text-[#D5A63A]" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Dual-Viewport Workspace ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex-1">
        
        {/* Mobile Viewport Switcher */}
        <div className="lg:hidden flex items-center justify-center p-1 bg-slate-900 rounded-2xl border border-slate-800 mb-6 max-w-sm mx-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('wearable')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'wearable' ? 'bg-[#E97820] text-white shadow-md' : 'text-slate-400'
            }`}
          >
            Wearable Centerpiece
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'diagnostics' ? 'bg-[#E97820] text-white shadow-md' : 'text-slate-400'
            }`}
          >
            Station Diagnostics
          </button>
        </div>

        {/* Desktop Split View: Wearable Centerpiece + Station Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center: Wearable Hardware Centerpiece */}
          <div
            className={`lg:col-span-5 flex flex-col items-center justify-center bg-[#090E17]/60 rounded-3xl border border-slate-800/80 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl ${
              activeTab === 'diagnostics' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Ambient Background Glow matching DivYatra Saffron & Gold */}
            <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[#E97820]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-[#D5A63A]/10 blur-3xl pointer-events-none" />

            <div className="w-full flex items-center justify-between pb-4 mb-2 border-b border-slate-800/60 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-white font-bold font-serif">
                <Cpu className="w-4 h-4 text-[#E97820]" />
                <span>Physical Chassis Prototype</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px]">
                FITBIT-INSPIRE SILHOUETTE
              </span>
            </div>

            {/* Smart Band Chassis Component */}
            <SmartBandChassis />
          </div>

          {/* Right: Station Diagnostics & Live Telemetry + Demo Controls */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeTab === 'wearable' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Station Diagnostics Monitor */}
            <StationDiagnostics />

            {/* Presentation Demo Controls Panel */}
            <DemoControls />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-850 bg-[#070D18] py-4 px-4 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            DivYatra Smart Band IoT Simulator • Connected to Node <strong className="text-slate-300">{bandId}</strong>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Simulated IoT Device for Prototype Demonstrations • Independent Vercel Deployment
          </span>
        </div>
      </footer>

      {/* Modals */}
      <EmergencyModal />
      <PassDetailsModal />
    </div>
  );
};

export function App() {
  return (
    <BandProvider>
      <SimulatorContent />
    </BandProvider>
  );
}

export default App;
