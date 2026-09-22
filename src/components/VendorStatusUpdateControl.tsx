'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateAssignmentStatus,
  addAssignmentProgressNote,
  EventVendorStatus,
} from '@/lib/actions/vendor';
import FeedbackAlert from './ui/FeedbackAlert';

interface VendorStatusUpdateControlProps {
  assignmentId: number;
  currentStatus: string;
}

interface StatusConfig {
  next: EventVendorStatus;
  label: string;
  confirmTitle: string;
  confirmDesc: string;
  buttonColor: string;
}

const NEXT_STATUS_CONFIG: Record<string, StatusConfig> = {
  assigned: {
    next: 'accepted',
    label: 'Terima Tugas',
    confirmTitle: 'Terima Penugasan Acara?',
    confirmDesc: 'Dengan menerima penugasan, Anda menyanggupi tanggung jawab pekerjaan sesuai rincian scope of work yang ditentukan Event Manager.',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
  },
  accepted: {
    next: 'in_progress',
    label: 'Mulai Pekerjaan',
    confirmTitle: 'Mulai Pelaksanaan / Loading Alat?',
    confirmDesc: 'Tandai bahwa tim vendor Anda telah memulai persiapan, keberangkatan logistik, atau instalasi perlengkapan di venue.',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
  },
  in_progress: {
    next: 'ready',
    label: 'Siap di Lokasi',
    confirmTitle: 'Tandai Pekerjaan Sudah Siap?',
    confirmDesc: 'Tandai bahwa seluruh peralatan, dekorasi, katering, atau tim vendor telah siap 100% di lokasi untuk dimulainya acara.',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm',
  },
  ready: {
    next: 'completed',
    label: 'Tandai Selesai',
    confirmTitle: 'Tandai Pekerjaan Telah Selesai?',
    confirmDesc: 'Tandai bahwa seluruh layanan operasional dan pembongkaran peralatan telah selesai secara tuntas.',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  },
};

const ALL_STEPS: EventVendorStatus[] = ['assigned', 'accepted', 'in_progress', 'ready', 'completed'];

export default function VendorStatusUpdateControl({
  assignmentId,
  currentStatus,
}: VendorStatusUpdateControlProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [standaloneNote, setStandaloneNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const nextConfig = NEXT_STATUS_CONFIG[currentStatus];
  const isCompleted = currentStatus === 'completed';

  const currentStepIndex = ALL_STEPS.indexOf(currentStatus as EventVendorStatus);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextConfig) return;

    setError(null);
    setLoading(true);

    try {
      const res = await updateAssignmentStatus({
        assignmentId,
        new_status: nextConfig.next,
        notes: statusNote.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || 'Gagal memperbarui status.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setStatusModalOpen(false);
      setStatusNote('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  const handleAddProgressNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standaloneNote.trim() || standaloneNote.trim().length < 3) {
      setError('Catatan progres wajib diisi minimal 3 karakter.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await addAssignmentProgressNote({
        assignmentId,
        notes: standaloneNote.trim(),
      });

      if (!res.success) {
        setError(res.error || 'Gagal menambahkan catatan.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setNoteModalOpen(false);
      setStandaloneNote('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
      {/* Tombol Tambah Catatan Progres (Bisa dipanggil kapan saja selama belum completed) */}
      {!isCompleted && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setNoteModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Tambah Catatan Progres</span>
        </button>
      )}

      {/* Tombol Pembaruan Status Sequential */}
      {isCompleted ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200/60 shadow-sm">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Sudah Selesai (Completed)</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStatusModalOpen(true);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${nextConfig?.buttonColor}`}
        >
          <span>{nextConfig?.label}</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* MODAL 1: Pembaruan Status Sequential */}
      {statusModalOpen && nextConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {nextConfig.confirmTitle}
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {nextConfig.confirmDesc}
            </p>

            {/* Visual Workflow Steps */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-2">
              <div className="text-slate-500 font-medium">Alur Status:</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {ALL_STEPS.map((step, idx) => {
                  const isCurrent = step === currentStatus;
                  const isNext = step === nextConfig.next;
                  const isPast = idx < currentStepIndex;

                  return (
                    <span
                      key={step}
                      className={`px-2.5 py-1 rounded-md font-mono text-[10px] uppercase font-bold ${
                        isNext
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 ring-2 ring-indigo-500/20'
                          : isCurrent
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : isPast
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      {step}
                    </span>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {error && (
                <FeedbackAlert
                  type="error"
                  title="Gagal Memperbarui"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}

              <div>
                <label htmlFor="statusNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Progres Saat Pembaruan (Opsional)
                </label>
                <textarea
                  id="statusNote"
                  rows={3}
                  placeholder="Contoh: Kru dan perlengkapan sound system sudah tiba di lokasi venue..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Catatan ini akan tersimpan di riwayat audit trail sistem.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${nextConfig.buttonColor}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Perubahan Status</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah Catatan Progres Tanpa Ubah Status */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Catatan Progres Pekerjaan
              </h3>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Catatan ini akan tersimpan ke riwayat audit log progres tanpa mengubah status pekerjaan saat ini ({currentStatus}).
            </p>

            <form onSubmit={handleAddProgressNote} className="space-y-4">
              {error && (
                <FeedbackAlert
                  type="error"
                  title="Gagal Menambahkan Catatan"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}

              <div>
                <label htmlFor="standaloneNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Progres <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="standaloneNote"
                  rows={4}
                  required
                  minLength={3}
                  placeholder="Contoh: Testing audio dan mic wireless sudah selesai. Kualitas suara jernih dan stabil."
                  value={standaloneNote}
                  onChange={(e) => setStandaloneNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Minimal 3 karakter. Catatan akan diberi timestamp otomatis.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Catatan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
