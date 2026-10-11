import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  isPositiveChange?: boolean;
  alert?: boolean;
  linkTo?: string;
  statusBadge?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  isPositiveChange = true,
  alert = false,
  linkTo,
  statusBadge,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => linkTo && navigate(linkTo)}
      className={`p-4 rounded-xl border bg-slate-900/90 transition-all duration-200 relative overflow-hidden group ${
        linkTo ? 'cursor-pointer hover:border-construction-500/60 hover:shadow-lg hover:shadow-construction-950/20 hover:-translate-y-0.5' : ''
      } ${
        alert
          ? 'border-amber-600/40 bg-gradient-to-br from-amber-950/20 to-slate-900/90'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Background soft ambient accent */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-construction-500/5 group-hover:bg-construction-500/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        <div
          className={`p-2 rounded-lg border ${
            alert
              ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
              : 'bg-slate-800 text-construction-400 border-slate-700/80 group-hover:border-construction-500/40'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-black tracking-tight text-white font-mono">{value}</div>
        {statusBadge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {statusBadge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">{subtitle}</span>
        {change && (
          <span
            className={`flex items-center font-semibold ${
              isPositiveChange ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositiveChange ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
