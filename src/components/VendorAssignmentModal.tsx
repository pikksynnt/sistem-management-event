'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignEventVendor } from '@/lib/actions/vendor';
import { VENDOR_SERVICE_CATEGORIES } from '@/lib/utils';
import FeedbackAlert from './ui/FeedbackAlert';

export interface VerifiedVendorOption {
  id: number;
  company_name: string;
  service_category: string;
  contact_person: string;
  phone: string;
  verification_status: string;
}

interface VendorAssignmentModalProps {
  eventId: number;
  eventTitle: string;
  verifiedVendors: VerifiedVendorOption[];
  isOpen: boolean;
  onClose: () => void;
}

export default function VendorAssignmentModal({
  eventId,
  eventTitle,
  verifiedVendors,
  isOpen,
  onClose,
}: VendorAssignmentModalProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter vendors by category
  const filteredVendors = verifiedVendors.filter((v) => {
    if (v.verification_status !== 'verified') return false;
    if (selectedCategory === 'all') return true;
    return v.service_category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      setError('Pilih salah satu vendor yang akan ditugaskan.');
      return;
    }

    if (!jobTitle.trim() || jobTitle.trim().length < 2) {
      setError('Judul tugas / Job Title minimal 2 karakter.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await assignEventVendor({
        event_id: eventId,
        vendor_id: selectedVendorId,
        job_title: jobTitle.trim(),
        scope_of_work: scopeOfWork.trim() || null,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        setError(res.error || 'Gagal menugaskan vendor.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
      // Reset form
      setJobTitle('');
      setScopeOfWork('');
      setNotes('');
      setSelectedVendorId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tugaskan Vendor ke Event</h3>
              <p className="text-xs text-slate-500">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <FeedbackAlert
              type="error"
              title="Gagal Menugaskan"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Filter Category & Vendor Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-700">
                1. Pilih Vendor Terverifikasi <span className="text-rose-500">*</span>
              </label>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">Semua Kategori</option>
                {VENDOR_SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {filteredVendors.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Tidak ada vendor terverifikasi pada kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                {filteredVendors.map((v) => {
                  const isSelected = selectedVendorId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVendorId(v.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">{v.company_name}</div>
                        <div className="text-[11px] text-indigo-600 font-medium">{v.service_category}</div>
                        <div className="text-[10px] text-slate-500">{v.contact_person} • {v.phone}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="job_title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Judul Tugas / Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="job_title"
              type="text"
              required
              placeholder="Contoh: Penyedia Tata Suara & Pencahayaan Panggung Utama"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Scope of Work */}
          <div>
            <label htmlFor="scope_of_work" className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Rincian Scope of Work (Tanggung Jawab Teknis)
            </label>
            <textarea
              id="scope_of_work"
              rows={3}
              placeholder="Contoh: Menyediakan line array 20.000W, 8 mic wireless, lighting moving head, standby gladi resik H-1 pukul 19.00 WIB..."
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. Catatan Tambahan
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Catatan khusus koordinasi atau akses loading dock..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !selectedVendorId}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Menugaskan...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tugaskan Vendor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
