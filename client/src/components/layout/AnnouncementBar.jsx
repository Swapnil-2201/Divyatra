import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Sparkles, ShieldCheck, ArrowRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementBar = () => {
  const { activeAdvisory } = useNotification();

  if (!activeAdvisory || !activeAdvisory.active) return null;

  return (
    <div className="bg-[#E97820] text-white text-xs sm:text-sm font-medium tracking-wide py-1.5 px-2.5 sm:px-4 shadow-sm border-b border-[#D36A18] relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[9.5px] xs:text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Alert
          </span>
          <span className="truncate text-[11px] xs:text-xs">{activeAdvisory.message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <Link
            to="/emergency-help"
            className="inline-flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white text-[10px] xs:text-[11px] font-bold px-2 xs:px-2.5 py-0.5 rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            Need Help? SOS
          </Link>
          <Link
            to="/live-crowd"
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:text-white/80 transition-colors font-semibold text-xs"
          >
            Live Telemetry <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-white/30 text-[11px] text-white/90">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Govt. Verified Safe Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};
