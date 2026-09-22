import React from 'react';
import Link from 'next/link';

interface StatCardProps {
  label?: string;
  title?: string;
  value: number | string;
  description?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  color?: string;
  variant?: string;
  href?: string;
  trend?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function StatCard({
  label,
  title,
  value,
  description,
  subtitle,
  icon,
  iconBgColor,
  color,
  variant,
  href,
  trend,
  onClick,
  isActive = false,
}: StatCardProps) {
  const displayLabel = label || title || '';
  const displayDesc = description || subtitle || '';

  let resolvedIconBg = iconBgColor || 'bg-indigo-50 text-indigo-600';
  if (color) {
    if (color === 'emerald' || color === 'green') resolvedIconBg = 'bg-emerald-50 text-emerald-600';
    else if (color === 'amber' || color === 'yellow') resolvedIconBg = 'bg-amber-50 text-amber-600';
    else if (color === 'rose' || color === 'red') resolvedIconBg = 'bg-rose-50 text-rose-600';
    else if (color === 'indigo') resolvedIconBg = 'bg-indigo-50 text-indigo-600';
    else if (color === 'blue') resolvedIconBg = 'bg-blue-50 text-blue-600';
    else if (color === 'purple' || color === 'violet') resolvedIconBg = 'bg-violet-50 text-violet-600';
    else resolvedIconBg = color;
  } else if (variant) {
    if (variant === 'emerald' || variant === 'green') resolvedIconBg = 'bg-emerald-50 text-emerald-600';
    else if (variant === 'amber' || variant === 'yellow') resolvedIconBg = 'bg-amber-50 text-amber-600';
    else if (variant === 'rose' || variant === 'red') resolvedIconBg = 'bg-rose-50 text-rose-600';
    else if (variant === 'purple' || variant === 'violet') resolvedIconBg = 'bg-violet-50 text-violet-600';
    else resolvedIconBg = 'bg-indigo-50 text-indigo-600';
  }

  const isClickable = !!onClick || !!href;

  const cardContent = (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border transition-all ${
        isActive
          ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
      } ${isClickable ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {displayLabel}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {displayDesc && (
            <p className="text-xs text-slate-400 mt-0.5">{displayDesc}</p>
          )}
          {trend && (
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <span>{trend}</span>
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${resolvedIconBg}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform active:scale-[0.98]">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

