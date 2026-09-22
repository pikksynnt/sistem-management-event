export const EVENT_STATUS_LABELS: Record<string, string> = {
  submitted: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  in_planning: 'Perencanaan',
  ongoing: 'Sedang Berjalan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const EVENT_STATUS_BADGE_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  submitted: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  in_planning: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  ongoing: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  completed: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  cancelled: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

export const VENDOR_VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Verifikasi',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
};

export const VENDOR_VERIFICATION_BADGE_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  verified: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export const EVENT_VENDOR_STATUS_LABELS: Record<string, string> = {
  assigned: 'Ditugaskan',
  accepted: 'Diterima Vendor',
  in_progress: 'Dalam Persiapan / Loading',
  ready: 'Siap di Lokasi',
  completed: 'Selesai',
};

export const EVENT_VENDOR_BADGE_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  assigned: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  accepted: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  in_progress: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  ready: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

export type EventVendorStatus = 'assigned' | 'accepted' | 'in_progress' | 'ready' | 'completed';

export const ALLOWED_VENDOR_TRANSITIONS: Record<EventVendorStatus, EventVendorStatus[]> = {
  assigned: ['accepted'],
  accepted: ['in_progress'],
  in_progress: ['ready'],
  ready: ['completed'],
  completed: [],
};

export const VENDOR_SERVICE_CATEGORIES = [
  'Sound System & Lighting',
  'Catering & Konsumsi',
  'Dekorasi & Backdrop',
  'Dokumentasi & Live Streaming',
  'Stage, Truss & Rigging',
  'Talent, MC & Entertainment',
  'Multimedia, LED & Projector',
  'Keamanan & Hospitality',
  'Lainnya',
];

export const EVENT_TYPES = [
  'Pernikahan (Wedding)',
  'Corporate Gathering & Outing',
  'Seminar & Workshop',
  'Pameran & Exhibition',
  'Ulang Tahun & Private Party',
  'Konser & Festival Musik',
  'Peluncuran Produk (Product Launch)',
  'Konferensi (Conference)',
  'Lainnya',
];

export function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
