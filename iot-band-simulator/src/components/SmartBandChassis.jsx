import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useBand } from '../context/BandContext';
import {
  Heart,
  Activity,
  MapPin,
  Users,
  Clock,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Sparkles,
  Maximize2,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';

export const SmartBandChassis = () => {
  const {
    bandId,
    connectionStatus,
    battery,
    signalStrength,
    currentTime,
    currentPilgrim,
    currentTemple,
    currentPass,
    passStatus,
    isNewPassAlert,
    setIsNewPassAlert,
    telemetry,
    location,
    crowdStatus,
    notifications,
    emergencyActive,
    activeScreen,
    setActiveScreen,
    setSelectedPassModal,
    hapticBuzz,
    triggerHaptic,
    acknowledgeCurrentPass,
    triggerEmergencySOS,
  } = useBand();

  const [screenIndex, setScreenIndex] = useState(0);
  const screens = ['clock', 'pass', 'vitals', 'crowd', 'notifications', 'sos'];

  // Current screen mode
  const currentMode = activeScreen || screens[screenIndex];

  const handleNextScreen = (e) => {
    e?.stopPropagation();
    triggerHaptic();
    const nextIdx = (screens.indexOf(currentMode) + 1) % screens.length;
    setActiveScreen(screens[nextIdx]);
  };

  const handlePrevScreen = (e) => {
    e?.stopPropagation();
    triggerHaptic();
    const prevIdx = (screens.indexOf(currentMode) - 1 + screens.length) % screens.length;
    setActiveScreen(screens[prevIdx]);
  };

  // Format time for Fitbit stacked watchface
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = currentTime.getDate();

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-6">
      
      {/* ── Realistic Hardware Silicone Strap (Perspective Loop from Reference Image) ── */}
      <div className="relative w-[340px] flex items-center justify-center">
        
        {/* Top Strap Loop Arching Backward */}
        <div className="absolute -top-[140px] z-0 w-[180px] h-[190px] pointer-events-none">
          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="topStrapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E232A" />
                <stop offset="40%" stopColor="#12161C" />
                <stop offset="100%" stopColor="#0B0E12" />
              </linearGradient>
              <linearGradient id="strapHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Top curved band arch */}
            <path
              d="M 68 180 C 60 90, 80 20, 140 18 C 190 16, 185 80, 150 175"
              fill="none"
              stroke="url(#topStrapGrad)"
              strokeWidth="48"
              strokeLinecap="round"
            />
            <path
              d="M 68 180 C 60 90, 80 20, 140 18 C 190 16, 185 80, 150 175"
              fill="none"
              stroke="url(#strapHighlight)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Bottom Strap Looping with Buckle & Pin Holes */}
        <div className="absolute -bottom-[160px] z-0 w-[240px] h-[260px] pointer-events-none">
          <svg viewBox="0 0 240 260" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="botStrapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#12161C" />
                <stop offset="60%" stopColor="#181D24" />
                <stop offset="100%" stopColor="#0D1015" />
              </linearGradient>
            </defs>
            {/* Bottom curved band loop */}
            <path
              d="M 105 10 C 100 90, 80 180, 30 200 C -15 215, 30 245, 90 230 C 160 210, 175 140, 138 20"
              fill="none"
              stroke="url(#botStrapGrad)"
              strokeWidth="48"
              strokeLinecap="round"
            />
            {/* Strap Adjustment Pin Holes */}
            <rect x="72" y="195" width="5" height="12" rx="2.5" fill="#06090D" />
            <rect x="85" y="180" width="5" height="12" rx="2.5" fill="#06090D" />
            <rect x="98" y="160" width="5" height="12" rx="2.5" fill="#06090D" />
            <rect x="108" y="138" width="5" height="12" rx="2.5" fill="#06090D" />
            <rect x="116" y="115" width="5" height="12" rx="2.5" fill="#06090D" />
            {/* Strap Retainer Ring / Keeper */}
            <rect
              x="52"
              y="172"
              width="24"
              height="44"
              rx="6"
              fill="#181E26"
              stroke="#252E3A"
              strokeWidth="1.5"
              transform="rotate(32 64 194)"
            />
            {/* Matte Buckle */}
            <rect
              x="42"
              y="152"
              width="14"
              height="36"
              rx="4"
              fill="#222832"
              stroke="#343E4E"
              strokeWidth="1.5"
              transform="rotate(32 49 170)"
            />
          </svg>
        </div>

        {/* ── Sleek Vertical Pill Capsule (Exact Fitbit Inspire 3 Proportions) ── */}
        <div
          className={`relative z-10 w-[208px] h-[456px] rounded-[60px] bg-[#111419] p-[7px] shadow-2xl transition-transform duration-300 ${
            hapticBuzz ? 'animate-vibrate' : ''
          } ${emergencyActive ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-[#060B14]' : ''}`}
          style={{
            boxShadow: emergencyActive
              ? '0 0 50px rgba(239, 68, 68, 0.7), inset 0 0 20px rgba(239, 68, 68, 0.4)'
              : '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1.5px rgba(255, 255, 255, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
          }}
        >
          {/* Side Capacitive Touch Sensor Groove (Left Edge indent matching reference image) */}
          <button
            onClick={() => handleNextScreen()}
            title="Side Touch Sensor (Tap to switch screens)"
            className="group absolute -left-[5px] top-[140px] w-[8px] h-[64px] rounded-full bg-[#1C222B] hover:bg-[#E97820] border-l border-white/20 transition-all cursor-pointer z-30 focus:outline-none flex items-center justify-center"
          >
            <div className="w-[2px] h-[24px] bg-slate-500 group-hover:bg-white rounded-full transition-colors" />
          </button>

          {/* Secondary Right Edge Symmetry Grip */}
          <div className="absolute -right-[3px] top-[150px] w-[4px] h-[48px] rounded-full bg-[#181D24] opacity-50" />

          {/* Matte Titanium Inner Bezel */}
          <div className="relative w-full h-full rounded-[53px] bg-[#0A0D12] p-[10px] overflow-hidden border border-white/5 flex flex-col items-center justify-between">
            
            {/* 2.5D Curved Tempered Glass Gloss Highlight (Pill rim reflection) */}
            <div className="glass-reflection absolute inset-0 rounded-[53px] z-20 pointer-events-none" />
            
            {/* Subtle OLED Scanline Effect */}
            <div className="oled-scanlines absolute inset-0 rounded-[53px] z-20 opacity-30 pointer-events-none" />

            {/* ── Internal AMOLED Screen Viewport ── */}
            <div className="amoled-display relative w-full h-full rounded-[44px] overflow-hidden flex flex-col justify-between p-3 text-white z-10">
              
              {/* Top Status Bar (Battery, Connected Dot, Signal) */}
              <div className="flex items-center justify-between px-2 pt-1.5 text-[9.5px] font-medium text-slate-400 border-b border-white/5 pb-1">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connectionStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-[8.5px] tracking-tight font-mono text-slate-300 uppercase">
                    {bandId.replace('DV-', '')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[8.5px]">
                  <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="font-mono text-[8px] text-slate-300">{battery}%</span>
                  <Battery className="w-3 h-3 text-emerald-400" />
                </div>
              </div>

              {/* ── Screen Content Router ── */}
              <div className="flex-1 flex flex-col justify-center items-center my-1 w-full overflow-hidden">
                
                {/* 1. CLOCK SCREEN (Exact Stacked Typography from Reference Image) */}
                {currentMode === 'clock' && (
                  <div
                    onClick={() => handleNextScreen()}
                    className="flex flex-col items-center justify-center text-center cursor-pointer w-full h-full py-1 animate-fadeIn"
                  >
                    {/* Stacked Time: Hour above, Minute below */}
                    <div className="font-serif font-black tracking-tight leading-[0.88] text-[58px] text-[#A6E22E] drop-shadow-[0_0_12px_rgba(166,226,46,0.3)]">
                      <div>{hours}</div>
                      <div>{minutes}</div>
                    </div>

                    {/* Day & Date */}
                    <div className="text-[11px] font-semibold text-slate-300 mt-2 font-sans tracking-wide">
                      {dayName} {dayNum}
                    </div>

                    {/* Heart Rate Telemetry Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141F14] border border-[#A6E22E]/30 text-[#A6E22E] text-[10px] font-bold mt-1.5">
                      <Heart className="w-2.5 h-2.5 fill-[#A6E22E] animate-heartbeat" />
                      <span>{telemetry.heartRate}</span>
                    </div>

                    {/* Pass Synced status badge if pass exists */}
                    {passStatus !== 'NO_PASS' && (
                      <div className="mt-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E97820]/20 border border-[#E97820]/40 text-[#E97820] text-[8px] font-bold uppercase tracking-wider animate-pulse">
                        <Sparkles className="w-2 h-2" />
                        <span>{passStatus === 'PASS_ACTIVE' ? 'Pass Active' : 'New Pass'}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PASS & QR CODE SCREEN */}
                {currentMode === 'pass' && (
                  <div className="flex flex-col items-center justify-between w-full h-full py-1 text-center animate-fadeIn band-scroll overflow-y-auto">
                    {currentPass ? (
                      <div className="flex flex-col items-center w-full space-y-1.5">
                        
                        {/* New Pass Animated Banner */}
                        {isNewPassAlert && (
                          <div className="w-full bg-[#E97820] text-slate-950 font-black text-[9px] py-0.5 rounded-md uppercase tracking-wider animate-bounce">
                            NEW DIVYATRA PASS
                          </div>
                        )}

                        <div className="text-[9px] font-bold text-[#D5A63A] uppercase tracking-wider truncate max-w-[150px]">
                          {currentPass.templeName.split(' ')[1] || currentPass.templeName}
                        </div>

                        {/* High-Contrast Scannable QR Code */}
                        <div className="relative p-1.5 bg-white rounded-xl shadow-lg border border-[#D5A63A]/40 group cursor-pointer"
                             onClick={() => setSelectedPassModal(currentPass)}>
                          <QRCodeSVG
                            value={currentPass.qrPayload || currentPass.bookingId}
                            size={84}
                            level="M"
                            includeMargin={false}
                          />
                          <button
                            title="Inspect QR"
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl text-white text-[9px] font-bold transition-opacity"
                          >
                            <Maximize2 className="w-4 h-4 text-[#E97820]" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1 text-[7px] font-mono text-emerald-400">
                          <span className="bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/30">
                            QR GENERATED ✓
                          </span>
                          <span className="bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/30">
                            QR SYNCED ✓
                          </span>
                        </div>

                        {/* Slot and Booking Code */}
                        <div className="text-[8.5px] text-slate-300 font-sans leading-tight">
                          <span className="block font-bold text-white">{currentPass.slot?.split('(')[0] || '10:00 AM'}</span>
                          <span className="font-mono text-[8px] text-slate-400">{currentPass.bookingId}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 w-full pt-1">
                          <button
                            onClick={() => setSelectedPassModal(currentPass)}
                            className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[8px] font-bold border border-slate-700 transition-colors"
                          >
                            VIEW PASS
                          </button>

                          {passStatus !== 'PASS_ACTIVE' ? (
                            <button
                              onClick={acknowledgeCurrentPass}
                              className="flex-1 py-1 rounded-lg bg-[#E97820] hover:bg-[#D36A18] text-white text-[8px] font-black tracking-wide shadow transition-colors"
                            >
                              ACKNOWLEDGE
                            </button>
                          ) : (
                            <div className="flex-1 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[7.5px] font-bold flex items-center justify-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>PASS ACTIVE</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
                        <Sparkles className="w-6 h-6 text-[#D5A63A] opacity-60" />
                        <span className="text-[9px] font-bold text-slate-300">NO ACTIVE PASS</span>
                        <p className="text-[7.5px] text-slate-500 px-2 leading-tight">
                          Book a Darshan pass in DivYatra to sync real-time QR to band.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. HEALTH TELEMETRY SCREEN */}
                {currentMode === 'vitals' && (
                  <div className="flex flex-col items-center justify-center w-full h-full space-y-2 py-1 text-center animate-fadeIn">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-[#E97820]">
                      VITALS TELEMETRY
                    </div>

                    <div className="w-full bg-slate-900/80 rounded-xl p-2 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[8px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 animate-heartbeat" />
                          Heart Rate
                        </span>
                        <strong className="text-white font-mono text-[11px]">{telemetry.heartRate} <span className="text-[8px] font-normal text-slate-400">BPM</span></strong>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[8px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5 text-amber-400" />
                          Stress
                        </span>
                        <strong className="text-amber-400 text-[9px] font-bold">{telemetry.stressLevel}</strong>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[8px] text-slate-400 flex items-center gap-1">
                          <span className="text-[9px]">🌡</span>
                          Temp
                        </span>
                        <strong className="text-white font-mono text-[10px]">{telemetry.temperature}°C</strong>
                      </div>
                    </div>

                    <div className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[7px] font-mono text-slate-400 border border-slate-700">
                      ● SIMULATED SENSORS
                    </div>
                  </div>
                )}

                {/* 4. LOCATION & CROWD TELEMETRY SCREEN */}
                {currentMode === 'crowd' && (
                  <div className="flex flex-col items-center justify-center w-full h-full space-y-1.5 py-1 text-center animate-fadeIn">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-[#D5A63A]">
                      SANCTUM CROWD
                    </div>

                    <div className="w-full bg-slate-900/80 rounded-xl p-2 border border-slate-800 space-y-1 text-left">
                      <div className="flex items-center gap-1 text-[8px] text-slate-300 font-bold truncate">
                        <MapPin className="w-2.5 h-2.5 text-[#E97820] shrink-0" />
                        <span>{location.templeName}</span>
                      </div>
                      <div className="text-[7.5px] text-slate-400 pl-3.5">
                        {location.gate}
                      </div>

                      <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[7.5px] text-slate-400">Wait Time</span>
                        <span className="text-[9px] font-bold text-[#E97820]">~{crowdStatus.waitMinutes} mins</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[7.5px] text-slate-400">Congestion</span>
                        <span className={`text-[8px] font-bold px-1 rounded ${
                          crowdStatus.status === 'Crowded' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {crowdStatus.crowdExposure}
                        </span>
                      </div>
                    </div>

                    <div className="text-[7px] font-mono text-slate-500">
                      GPS SIMULATION • LIVE API
                    </div>
                  </div>
                )}

                {/* 5. NOTIFICATIONS SCREEN */}
                {currentMode === 'notifications' && (
                  <div className="flex flex-col w-full h-full space-y-1 py-1 text-left animate-fadeIn band-scroll overflow-y-auto">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-[#E97820] text-center pb-0.5">
                      ALERTS ({notifications.length})
                    </div>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="bg-slate-900/90 rounded-lg p-1.5 border border-slate-800 space-y-0.5">
                          <strong className="text-[8px] text-[#D5A63A] block truncate">{n.title}</strong>
                          <p className="text-[7.5px] text-slate-300 leading-tight line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-[8px] text-slate-500 py-6">
                        No alerts pending
                      </div>
                    )}
                  </div>
                )}

                {/* 6. EMERGENCY SOS SCREEN */}
                {currentMode === 'sos' && (
                  <div className="flex flex-col items-center justify-center w-full h-full space-y-2 py-1 text-center animate-fadeIn">
                    <div className={`p-2 rounded-full ${emergencyActive ? 'bg-red-500 text-white animate-bounce' : 'bg-red-500/20 text-red-400'}`}>
                      <ShieldAlert className="w-6 h-6" />
                    </div>

                    <div className="text-[8.5px] font-bold text-red-400 uppercase tracking-wider">
                      {emergencyActive ? '⚠ SOS ACTIVE' : 'EMERGENCY DISPATCH'}
                    </div>

                    <p className="text-[7.5px] text-slate-400 px-1 leading-tight">
                      {emergencyActive
                        ? 'Rapid response squad notified to Gate 1.'
                        : 'Tap below to dispatch simulated SOS to control room.'}
                    </p>

                    {!emergencyActive ? (
                      <button
                        onClick={() => triggerEmergencySOS('PILGRIM_SOS', 'Devotee pressed smart band SOS button')}
                        className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[8.5px] font-black tracking-wider shadow-lg transition-colors"
                      >
                        PRESS SOS (DEMO)
                      </button>
                    ) : (
                      <div className="px-2 py-1 rounded bg-red-950/80 border border-red-500/40 text-[7.5px] text-red-300 font-mono">
                        SOS SIGNAL TRANSMITTING
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Bottom Navigation Pager Dots ── */}
              <div className="flex items-center justify-between px-1 pt-1 border-t border-white/5">
                <button
                  onClick={handlePrevScreen}
                  title="Previous Screen"
                  className="text-slate-500 hover:text-white p-0.5 focus:outline-none"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1">
                  {screens.map((s, idx) => (
                    <button
                      key={s}
                      onClick={() => {
                        triggerHaptic();
                        setActiveScreen(s);
                      }}
                      className={`h-1 rounded-full transition-all ${
                        currentMode === s
                          ? 'w-3.5 bg-[#E97820]'
                          : 'w-1 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextScreen}
                  title="Next Screen"
                  className="text-slate-500 hover:text-white p-0.5 focus:outline-none"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Caption & Clear Non-Physical Label */}
      <div className="text-center mt-7 space-y-1 max-w-[260px]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B172B] border border-[#D5A63A]/30 text-[#D5A63A] text-[10px] font-bold uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>SIMULATED IoT DEVICE</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Wearable prototype simulating DivYatra pilgrim mesh wristband. Tap side groove or screen dots to cycle screens.
        </p>
      </div>
    </div>
  );
};
