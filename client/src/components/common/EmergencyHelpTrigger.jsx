import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Users,
  ShieldAlert,
  UserCheck,
  X,
  PhoneCall,
  Sparkles,
  Calendar,
  Compass,
  Activity,
  MessageSquare,
  Minus,
} from 'lucide-react';
import sahayakAvatar from '../../assets/sahayak_avatar.jpg';

export const EmergencyHelpTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Listen to custom event to open Sahayak from anywhere (e.g. mobile drawer)
  useEffect(() => {
    const handleOpenSahayak = () => setIsOpen(true);
    window.addEventListener('open-sahayak', handleOpenSahayak);
    return () => window.removeEventListener('open-sahayak', handleOpenSahayak);
  }, []);

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop when expanded */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9990] transition-opacity animate-fadeIn sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* Floating Container (Fixed at Bottom-Right on Mobile and Desktop with Safe Area) */}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end pointer-events-auto select-none">
        
        {/* Expanded Sahayak Virtual Assistant Panel */}
        {isOpen && (
          <div className="mb-3 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-white rounded-3xl border border-[#E5DED0] shadow-[0_20px_60px_rgba(16,42,86,0.35)] p-4 sm:p-5 space-y-4 animate-scaleUp z-[9999]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D5]">
              <div className="flex items-center gap-2.5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#E97820] shadow-sm shrink-0">
                  <img
                    src={sahayakAvatar}
                    alt="Sahayak Guide"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif text-base font-bold text-[#102A56] leading-none">
                      Divya SAHAYAK
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#E97820]">
                      2.0 AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your 24x7 Sacred Pilgrimage Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-[#102A56] hover:bg-slate-100 rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close Sahayak"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assistant Prompt */}
            <div className="bg-[#FAF8F5] border border-[#EBE4D5] rounded-2xl p-3 text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-[#102A56] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E97820]" />
                Namaste! How may I assist your Yatra today?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Instant access to darshan bookings, live crowd telemetry, itinerary planner & SOS emergency help.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-orange-50/70 hover:bg-orange-100/90 border border-orange-200/60 text-[#102A56] font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Calendar className="w-4 h-4 text-[#E97820] shrink-0" />
                <span>Book Darshan</span>
              </Link>

              <Link
                to="/live-crowd"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/90 border border-blue-200/60 text-[#102A56] font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Live Queue</span>
              </Link>

              <Link
                to="/plan-yatra"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/90 border border-amber-200/60 text-[#102A56] font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Plan 4-Dham</span>
              </Link>

              <Link
                to="/emergency-help"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-red-50/70 hover:bg-red-100/90 border border-red-200/60 text-[#B23330] font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <HeartPulse className="w-4 h-4 text-[#B23330] shrink-0" />
                <span>Emergency SOS</span>
              </Link>
            </div>

            {/* Emergency Hotline Strip */}
            <div className="pt-2 border-t border-[#EBE4D5] flex items-center justify-between text-xs">
              <a
                href="tel:112"
                className="font-bold text-[#B23330] hover:underline flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Police / SOS: 112</span>
              </a>
              <Link
                to="/emergency-help"
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#102A56] hover:text-[#E97820] flex items-center gap-0.5"
              >
                <span>All Helplines &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {/* Circular SAHAYAK Avatar Floating Badge */}
        <div className="relative group flex items-center">
          
          {/* Subtle Attention Badge when closed */}
          {!isOpen && (
            <div className="hidden xs:flex items-center gap-1 mr-2 px-2.5 py-1 bg-white/95 backdrop-blur-md border border-[#E97820]/40 rounded-full shadow-lg text-[11px] font-bold text-[#102A56] animate-bounce-subtle pointer-events-none">
              <Sparkles className="w-3 h-3 text-[#E97820]" />
              <span>Ask Sahayak</span>
            </div>
          )}

          {/* Sparkle / Toggle Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#102A56] border-2 border-white text-white flex items-center justify-center shadow-lg z-20 transition-transform group-hover:scale-110"
            title={isOpen ? 'Minimize' : 'Open Sahayak'}
            aria-label={isOpen ? 'Minimize' : 'Open Sahayak'}
          >
            {isOpen ? <Minus className="w-3 h-3" /> : <Sparkles className="w-3 h-3 text-[#D5A63A] animate-spin-slow" />}
          </button>

          {/* Circular Avatar Floating Circle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-[68px] h-[68px] sm:w-[82px] sm:h-[82px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(16,42,86,0.38)] hover:shadow-[0_12px_36px_rgba(233,120,32,0.48)] focus:outline-none shrink-0"
            title="Divya SAHAYAK 2.0 — Pilgrimage Guide"
            aria-label="Divya SAHAYAK 2.0 — Pilgrimage Guide"
          >
            {/* Circular Graphic SVG Ring with Curved Text */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Defs for Text Paths */}
              <defs>
                {/* Top Arc for SAHAYAK (Clockwise from left to right) */}
                <path
                  id="sahayakTopArc"
                  d="M 14,50 A 36,36 0 0,1 86,50"
                  fill="none"
                />
                {/* Bottom Arc for PILGRIM GUIDE (Counter-Clockwise so letters stay upright) */}
                <path
                  id="sahayakBottomArc"
                  d="M 14,50 A 36,36 0 0,0 86,50"
                  fill="none"
                />
              </defs>

              {/* Outer Ring Background (Royal Navy) */}
              <circle
                cx="50"
                cy="50"
                r="47"
                fill="#102A56"
                stroke="#E97820"
                strokeWidth="2.5"
              />

              {/* Inner White Avatar Well */}
              <circle
                cx="50"
                cy="50"
                r="34"
                fill="#FFFFFF"
              />

              {/* Curved Text: SAHAYAK 2.0 (Top) */}
              <text
                fill="#FFFFFF"
                fontSize="7.5"
                fontWeight="bold"
                letterSpacing="0.08em"
                className="font-sans select-none"
              >
                <textPath href="#sahayakTopArc" startOffset="50%" textAnchor="middle">
                  SAHAYAK 2.0
                </textPath>
              </text>

              {/* Curved Text: PILGRIM GUIDE (Bottom - Upright) */}
              <text
                fill="#D5A63A"
                fontSize="6.5"
                fontWeight="bold"
                letterSpacing="0.06em"
                className="font-sans select-none"
              >
                <textPath href="#sahayakBottomArc" startOffset="50%" textAnchor="middle">
                  PILGRIM GUIDE
                </textPath>
              </text>
            </svg>

            {/* Center Avatar Image */}
            <div className="w-[43px] h-[43px] sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden relative z-0 border border-white/80 shadow-inner">
              <img
                src={sahayakAvatar}
                alt="Sahayak"
                className="w-full h-full object-cover scale-105"
              />
            </div>
          </button>
        </div>

      </div>
    </>
  );
};
