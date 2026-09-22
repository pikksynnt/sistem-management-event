import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  title,
  description,
  icon,
  actionHref,
  actionLabel,
  onActionClick,
  action,
}: EmptyStateProps) {
  const finalActionHref = actionHref || action?.href;
  const finalActionLabel = actionLabel || action?.label;
  const finalOnActionClick = onActionClick || action?.onClick;

  return (
    <div className="p-12 sm:p-16 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
        {icon || (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>

      {(finalActionHref || finalOnActionClick) && finalActionLabel && (
        <div className="pt-2">
          {finalActionHref ? (
            <Link
              href={finalActionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>{finalActionLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={finalOnActionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>{finalActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
