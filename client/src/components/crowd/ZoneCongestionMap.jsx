import React from 'react';
import { Shield, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const ZoneCongestionMap = ({ zones = [], templeName = "Somnath" }) => {
  return (
    <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-6 shadow-luxury space-y-4 sm:space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#EBE4D5]">
        <div>
          <h4 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
            Zone-by-Zone Congestion Heatmap
          </h4>
          <p className="text-xs text-slate-500">Live corridor telemetry & wait times for {templeName}</p>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          Continuous Flow Active
        </span>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const isHigh = zone.density >= 75;
          const isMed = zone.density >= 45 && zone.density < 75;

          let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
          let barBg = "bg-emerald-500";
          if (isHigh) {
            badgeBg = "bg-red-50 text-red-800 border-red-200";
            barBg = "bg-red-500";
          } else if (isMed) {
            badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
            barBg = "bg-amber-500";
          }

          return (
            <div
              key={zone.id}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] hover:border-[#E97820] transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-[#102A56] leading-snug">
                  {zone.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badgeBg}`}>
                  {zone.status || (isHigh ? "Congested" : isMed ? "Moderate" : "Smooth")}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>Density: <strong className="text-[#102A56]">{zone.density}%</strong></span>
                  <span className="flex items-center gap-1 text-[#E97820] font-bold">
                    <Clock className="w-3 h-3" /> ~{zone.waitMinutes}m
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                    style={{ width: `${zone.density}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
