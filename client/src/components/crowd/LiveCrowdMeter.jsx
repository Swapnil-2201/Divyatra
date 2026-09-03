import React from 'react';
import { Users, Clock, Flame, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

export const LiveCrowdMeter = ({
  percentage = 58,
  waitMinutes = 28,
  activeCount = 3840,
  templeName = "Shree Somnath Jyotirlinga",
  statusLabel = "Optimal Flow",
  statusColor = "emerald"
}) => {
  let colorClass = "from-emerald-500 to-[#10B981]";
  let textColor = "text-[#0D8259]";
  let bgBadge = "bg-[#ECFDF5] border-[#A7F3D0]";

  if (percentage >= 75) {
    colorClass = "from-amber-500 to-red-500";
    textColor = "text-[#DC2626]";
    bgBadge = "bg-[#FEF2F2] border-[#FECACA]";
  } else if (percentage >= 50) {
    colorClass = "from-[#102A56] via-[#1B3B74] to-[#E97820]";
    textColor = "text-[#E97820]";
    bgBadge = "bg-[#FFFBEB] border-[#FDE68A]";
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#E97820]">
            AI Real-Time Telemetry
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56]">
            {templeName}
          </h3>
        </div>

        <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 self-start sm:self-auto ${bgBadge} ${textColor}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Main Gauge & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
        
        {/* Visual Density Gauge */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#F8F5EF] border border-[#EBE4D5]">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#E97820]"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black font-serif text-[#102A56]">
                {percentage}%
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Occupancy
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#102A56] mt-2">Premise Capacity Meter</span>
        </div>

        {/* Primary Metrics */}
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5]">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Clock className="w-4 h-4 text-[#E97820]" />
              <span>Estimated Queue Wait</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#102A56] font-serif">~{waitMinutes}</span>
              <span className="text-xs text-gray-600 font-semibold">minutes to Sanctum</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5]">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Users className="w-4 h-4 text-[#102A56]" />
              <span>Active Devotees in Premise</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#102A56] font-serif">
                {activeCount.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Live Inflow
              </span>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#102A56] text-white space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D5A63A] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#E97820]" />
            <span>DivYatra AI Advisory</span>
          </div>

          <p className="text-xs text-gray-200 leading-relaxed">
            {percentage >= 75
              ? "High footfall observed in central queue corridors. Devotees are advised to utilize North Gate 3 or opt for afternoon slot (02:30 PM) for 40% faster Darshan."
              : "Flow is exceptionally smooth. Perfect time for tranquil Parikrama and Bilva Puja without delay."}
          </p>

          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#D5A63A]">
            <span>Algorithm: YOLOv8 Spatial</span>
            <span>Accuracy: 96.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
