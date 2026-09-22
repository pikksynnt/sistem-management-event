import React from 'react';
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_BADGE_CLASSES,
  VENDOR_VERIFICATION_STATUS_LABELS,
  VENDOR_VERIFICATION_BADGE_CLASSES,
  EVENT_VENDOR_STATUS_LABELS,
  EVENT_VENDOR_BADGE_CLASSES,
} from '@/lib/utils';

export type BadgeType =
  | 'event'
  | 'vendor_verification'
  | 'vendor_assignment'
  | 'verification'
  | 'assignment';

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({
  status,
  type = 'event',
  className = '',
  size = 'md',
}: StatusBadgeProps) {
  let label = status;
  let classes = { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  if (type === 'event') {
    label = EVENT_STATUS_LABELS[status] || status;
    classes = EVENT_STATUS_BADGE_CLASSES[status] || classes;
  } else if (type === 'vendor_verification' || type === 'verification') {
    label = VENDOR_VERIFICATION_STATUS_LABELS[status] || status;
    classes = VENDOR_VERIFICATION_BADGE_CLASSES[status] || classes;
  } else if (type === 'vendor_assignment' || type === 'assignment') {
    label = EVENT_VENDOR_STATUS_LABELS[status] || status;
    classes = EVENT_VENDOR_BADGE_CLASSES[status] || classes;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${classes.bg} ${classes.text} ${classes.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current opacity-60" />
      {label}
    </span>
  );
}
