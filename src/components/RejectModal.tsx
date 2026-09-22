'use client';

import { useState } from 'react';
import { rejectEvent } from '@/lib/actions/event';
import FeedbackAlert from './ui/FeedbackAlert';

interface RejectModalProps {
  eventId: number;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RejectModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Alasan penolakan wajib diisi (minimal 5 karakter).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await rejectEvent(eventId, reason.trim());
      if (!res.success) {
        setError(res.error || 'Gagal menolak event.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tolak Pengajuan Event</h3>
              <p className="text-xs text-slate-500">Berikan alasan mengapa pengajuan ini ditolak</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <p className="font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Event</p>
            <p className="font-bold text-slate-900 line-clamp-1">{eventTitle}</p>
          </div>

          {error && (
            <FeedbackAlert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <div>
            <label htmlFor="reject_reason" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="reject_reason"
              rows={4}
              required
              placeholder="Contoh: Jadwal bertabrakan dengan event besar lain, kapasitas slot tanggal tersebut sudah penuh..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Alasan ini akan dapat dibaca langsung oleh Klien pada rincian status event mereka.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 5}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <span>Konfirmasi Tolak Event</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
