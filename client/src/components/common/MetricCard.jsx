import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'navy',
  badge
}) => {
  const colorMap = {
    navy: 'bg-[#102A56] text-white',
    saffron: 'bg-[#E97820] text-white',
    gold: 'bg-[#D5A63A] text-white',
    white: 'bg-white text-[#102A56] border border-[#E5DED0]',
    dark: 'bg-[#0B172B] text-white border border-slate-800'
  };

  return (
    <div className={`rounded-2xl p-5 shadow-luxury transition-all duration-300 ${colorMap[color] || colorMap.white}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#D5A63A]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
          {value}
        </h3>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-blue-400" />}
          {trendValue && <span className="font-semibold text-slate-200">{trendValue}</span>}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
