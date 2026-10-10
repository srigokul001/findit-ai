import React from 'react';
import { Sparkles } from 'lucide-react';

export const MatchScoreBadge = ({ score = 0, size = 'md', showLabel = true }) => {
  let badgeStyle = {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'High Match',
    accent: 'text-emerald-600',
  };

  if (score < 50) {
    badgeStyle = {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Low Match',
      accent: 'text-slate-600',
    };
  } else if (score < 75) {
    badgeStyle = {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Moderate Match',
      accent: 'text-amber-600',
    };
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-xs ${badgeStyle.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot} animate-pulse`} />
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score}%</span>
      {showLabel && <span className="opacity-80 font-normal">({badgeStyle.label})</span>}
    </span>
  );
};

export default MatchScoreBadge;
