import React from 'react';
import { Users, Clock, Flame, ShieldAlert, CheckCircle } from 'lucide-react';

export const CrowdBadge = ({ percentage = 50, waitMinutes = 20, level = 'moderate', showWait = true, size = 'md' }) => {
  let config = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Low Crowd',
    icon: CheckCircle
  };

  if (percentage >= 75 || level === 'high' || level === 'critical') {
    config = {
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      dot: 'bg-amber-500',
      label: 'High Density',
      icon: Flame
    };
  } else if (percentage >= 45 || level === 'moderate') {
    config = {
      bg: 'bg-blue-50 text-blue-900 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Moderate Flow',
      icon: Users
    };
  }

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 font-bold rounded-full border tracking-wide ${config.bg} ${
          isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        <span>{percentage}% Crowd ({config.label})</span>
      </div>

      {showWait && (
        <div
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-white/90 text-[#102A56] border border-[#E2DCce] ${
            isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className="w-3 h-3 text-[#E97820]" />
          <span>~{waitMinutes} min wait</span>
        </div>
      )}
    </div>
  );
};
