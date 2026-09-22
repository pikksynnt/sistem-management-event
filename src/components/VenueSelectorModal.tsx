'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignEventVenue } from '@/lib/actions/venue';
import FeedbackAlert from './ui/FeedbackAlert';

interface VenueItem {
  id: number;
  name: string;
  city: string;
  capacity: number | null;
  address: string;
}

interface VenueSelectorModalProps {
  eventId: number;
  eventTitle: string;
  currentVenueId: number | null;
  availableVenues: VenueItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function VenueSelectorModal({
  eventId,
  eventTitle,
  currentVenueId,
  availableVenues,
  isOpen,
  onClose,
}: VenueSelectorModalProps) {
  const router = useRouter();
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(currentVenueId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await assignEventVenue(eventId, selectedVenueId);
      if (!res.success) {
        setError(res.error || 'Gagal mengubah venue.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pilih / Ubah Venue Event</h3>
              <p className="text-xs text-slate-500">Tentukan lokasi pelaksanaan resmi untuk event ini</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
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

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Daftar Pilihan Master Venue ({availableVenues.length})
            </label>

            {/* Option: Belum Ditentukan / Unassign */}
            <div
              onClick={() => setSelectedVenueId(null)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedVenueId === null
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10 text-indigo-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-sm">Belum Ditentukan (Kosongkan Venue)</div>
                <div className="text-xs text-slate-500 mt-0.5">Event belum memiliki lokasi gedung/venue tetap</div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedVenueId === null ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                {selectedVenueId === null && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>

            {/* Available Venues */}
            {availableVenues.map((v) => {
              const isSelected = selectedVenueId === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVenueId(v.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10 text-indigo-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{v.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {v.city}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{v.address}</p>
                    {v.capacity && (
                      <p className="text-[11px] text-slate-500">
                        Kapasitas: <strong className="text-slate-700">{v.capacity.toLocaleString('id-ID')} Orang</strong>
                      </p>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {loading ? (
              <span>Menyimpan...</span>
            ) : (
              <span>Terapkan Venue</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
