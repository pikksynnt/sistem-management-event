import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
  backHref,
  backLabel = 'Kembali',
}: PageHeaderProps) {
  return (
    <div className="space-y-3 pb-2">
      {/* Breadcrumbs or Back Link */}
      {(breadcrumbs || backHref) && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1.5 flex-wrap">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-300">/</span>}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="hover:text-slate-900 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'font-medium text-slate-900' : ''}>
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : <div />}

          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{backLabel}</span>
            </Link>
          )}
        </div>
      )}

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500 max-w-2xl">{subtitle}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
