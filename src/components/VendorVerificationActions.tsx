'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyVendor, rejectVendor } from '@/lib/actions/vendor';
import ConfirmModal from './ui/ConfirmModal';
import FeedbackAlert from './ui/FeedbackAlert';

interface VendorVerificationActionsProps {
  vendorProfileId: number;
  companyName: string;
  currentStatus: string;
}

export default function VendorVerificationActions({
  vendorProfileId,
  companyName,
  currentStatus,
}: VendorVerificationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmVerifyOpen, setConfirmVerifyOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await verifyVendor(vendorProfileId);
      if (!res.success) {
        setError(res.error || 'Gagal memverifikasi vendor.');
        setLoading(false);
        setConfirmVerifyOpen(false);
        return;
      }

      setLoading(false);
      setConfirmVerifyOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
      setConfirmVerifyOpen(false);
    }
  };

  const handleReject = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await rejectVendor(vendorProfileId);
      if (!res.success) {
        setError(res.error || 'Gagal menolak vendor.');
        setLoading(false);
        setConfirmRejectOpen(false);
        return;
      }

      setLoading(false);
      setConfirmRejectOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
      setConfirmRejectOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
      {error && (
        <FeedbackAlert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {currentStatus !== 'verified' && (
        <button
          onClick={() => {
            setError(null);
            setConfirmVerifyOpen(true);
          }}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Verifikasi Vendor</span>
        </button>
      )}

      {currentStatus !== 'rejected' && (
        <button
          onClick={() => {
            setError(null);
            setConfirmRejectOpen(true);
          }}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Tolak Vendor</span>
        </button>
      )}

      {/* Confirm Verify Modal */}
      <ConfirmModal
        isOpen={confirmVerifyOpen}
        title="Verifikasi Mitra Vendor?"
        description={`Setujui dan verifikasi vendor "${companyName}"? Vendor yang terverifikasi akan dapat dipilih untuk penugasan ke berbagai event.`}
        confirmLabel="Verifikasi Vendor"
        confirmVariant="primary"
        isLoading={loading}
        onConfirm={handleVerify}
        onCancel={() => setConfirmVerifyOpen(false)}
      />

      {/* Confirm Reject Modal */}
      <ConfirmModal
        isOpen={confirmRejectOpen}
        title="Tolak Pendaftaran Vendor?"
        description={`Tolak status pendaftaran vendor "${companyName}"? Vendor yang ditolak tidak akan dapat dipilih untuk penugasan event.`}
        confirmLabel="Tolak Vendor"
        confirmVariant="danger"
        isLoading={loading}
        onConfirm={handleReject}
        onCancel={() => setConfirmRejectOpen(false)}
      />
    </div>
  );
}
