'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteVenue } from '@/lib/actions/venue';
import ConfirmModal from './ui/ConfirmModal';
import FeedbackAlert from './ui/FeedbackAlert';

interface DeleteVenueButtonProps {
  venueId: number;
  venueName: string;
}

export default function DeleteVenueButton({ venueId, venueName }: DeleteVenueButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await deleteVenue(venueId);
      if (!res.success) {
        setError(res.error || 'Gagal menghapus venue.');
        setLoading(false);
        setConfirmOpen(false);
        return;
      }

      setLoading(false);
      setConfirmOpen(false);
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'Terjadi kesalahan sistem.';
      setError(msg);
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end">
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <FeedbackAlert
            type="error"
            title="Gagal Menghapus Venue"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      <button
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        disabled={loading}
        title="Hapus Venue"
        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Hapus Master Venue?"
        description={`Apakah Anda yakin ingin menghapus venue "${venueName}"? Venue yang masih digunakan oleh event tidak dapat dihapus.`}
        confirmLabel="Hapus Venue"
        confirmVariant="danger"
        isLoading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
