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

  const isLight = color === 'white';

  // Format string values with underscores if passed (e.g. ELEVATED_WATCH -> Elevated Watch)
  const displayValue = typeof value === 'string' && value.includes('_')
    ? value
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : value;

  const valueStr = typeof displayValue === 'string' ? displayValue : String(displayValue ?? '');

  // Responsive font size calculation to guarantee no text overflow in multi-column grids
  const getValueFontSize = () => {
    if (valueStr.length > 14) return 'text-base sm:text-lg';
    if (valueStr.length > 10) return 'text-lg sm:text-xl';
    if (valueStr.length > 6) return 'text-xl sm:text-2xl';
    return 'text-2xl sm:text-3xl';
  };

  // Theme-aware badge styles
  const getBadgeStyle = () => {
    if (isLight) {
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
    }
    if (color === 'saffron') {
      return 'bg-white/20 text-white border border-white/30';
    }
    if (color === 'gold') {
      return 'bg-black/15 text-[#102A56] border border-black/10';
    }
    return 'bg-white/15 text-white border border-white/20';
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 shadow-luxury transition-all duration-300 overflow-hidden relative min-w-0 ${colorMap[color] || colorMap.white}`}>
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate min-w-0 ${
          isLight ? 'text-slate-500' : 'text-slate-300/90'
        }`}>
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isLight
              ? 'bg-amber-50 border border-amber-200/60 text-[#D5A63A]'
              : 'bg-white/10 text-[#D5A63A]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Middle row: Value and Badge */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h3
          className={`${getValueFontSize()} font-extrabold font-serif tracking-tight truncate min-w-0 leading-tight`}
          title={valueStr}
        >
          {displayValue}
        </h3>
        {badge && (
          <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wide ${getBadgeStyle()}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Bottom row: Trend and Subtitle */}
      {(subtitle || trend) && (
        <div className={`mt-2.5 flex items-center gap-1.5 text-xs truncate min-w-0 ${
          isLight ? 'text-slate-500' : 'text-slate-300/80'
        }`}>
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-red-400 shrink-0" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
          {trendValue && (
            <span className={`font-semibold shrink-0 ${isLight ? 'text-slate-700' : 'text-slate-100'}`}>
              {trendValue}
            </span>
          )}
          {subtitle && <span className="truncate min-w-0">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
