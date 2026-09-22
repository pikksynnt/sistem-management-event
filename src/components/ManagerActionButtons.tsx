'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveEvent } from '@/lib/actions/event';
import RejectModal from './RejectModal';
import ConfirmModal from './ui/ConfirmModal';

interface ManagerActionButtonsProps {
  eventId: number;
  eventTitle: string;
  status: string;
}

export default function ManagerActionButtons({
  eventId,
  eventTitle,
  status,
}: ManagerActionButtonsProps) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== 'submitted') {
    return null;
  }

  const handleApprove = async () => {
    setError(null);
    setApproving(true);

    try {
      const res = await approveEvent(eventId);
      if (!res.success) {
        setError(res.error || 'Gagal menyetujui event.');
        setApproving(false);
        setIsConfirmApproveOpen(false);
        return;
      }

      setIsConfirmApproveOpen(false);
      setApproving(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setApproving(false);
      setIsConfirmApproveOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl sm:mr-auto">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsRejectOpen(true)}
          disabled={approving}
          className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Tolak Pengajuan</span>
        </button>

        <button
          type="button"
          onClick={() => setIsConfirmApproveOpen(true)}
          disabled={approving}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Setujui Event</span>
        </button>
      </div>

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmApproveOpen}
        title="Setujui Pengajuan Event?"
        message={`Apakah Anda yakin ingin menyetujui pengajuan event "${eventTitle}"? Status akan berubah menjadi "Disetujui" dan dapat dilanjutkan ke penyusunan venue & penugasan vendor.`}
        confirmLabel="Ya, Setujui Event"
        cancelLabel="Batal"
        isLoading={approving}
        onConfirm={handleApprove}
        onCancel={() => setIsConfirmApproveOpen(false)}
      />

      {/* Reject Modal */}
      <RejectModal
        eventId={eventId}
        eventTitle={eventTitle}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
