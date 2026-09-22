'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEvent } from '@/lib/actions/event';
import { EVENT_TYPES } from '@/lib/utils';
import FeedbackAlert from './ui/FeedbackAlert';

export default function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    event_type: EVENT_TYPES[0],
    custom_type: '',
    start_date: '',
    end_date: '',
    estimated_guests: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const selectedType = formData.event_type === 'Lainnya' && formData.custom_type.trim() 
        ? formData.custom_type.trim() 
        : formData.event_type;

      const res = await createEvent({
        title: formData.title,
        event_type: selectedType,
        start_date: formData.start_date,
        end_date: formData.end_date,
        estimated_guests: formData.estimated_guests ? parseInt(formData.estimated_guests, 10) : undefined,
        description: formData.description,
      });

      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat mengajukan event.');
        setLoading(false);
        return;
      }

      router.push('/dashboard/client');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan tidak terduga.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <FeedbackAlert
          type="error"
          title="Pengajuan Gagal"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama / Judul Event <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Contoh: Grand Launching Brand X / Wedding Putri & Dimas"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Event Type */}
        <div className={formData.event_type === 'Lainnya' ? 'md:col-span-1' : 'md:col-span-2'}>
          <label htmlFor="event_type" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kategori / Jenis Event <span className="text-rose-500">*</span>
          </label>
          <select
            id="event_type"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-white text-slate-900">
                {t}
              </option>
            ))}
          </select>
        </div>

        {formData.event_type === 'Lainnya' && (
          <div className="md:col-span-1">
            <label htmlFor="custom_type" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sebutkan Jenis Event <span className="text-rose-500">*</span>
            </label>
            <input
              id="custom_type"
              name="custom_type"
              type="text"
              required
              placeholder="Contoh: Reuni Akbar"
              value={formData.custom_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
        )}

        {/* Start Date */}
        <div>
          <label htmlFor="start_date" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal & Waktu Mulai <span className="text-rose-500">*</span>
          </label>
          <input
            id="start_date"
            name="start_date"
            type="datetime-local"
            required
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="end_date" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal & Waktu Selesai <span className="text-rose-500">*</span>
          </label>
          <input
            id="end_date"
            name="end_date"
            type="datetime-local"
            required
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Estimated Guests */}
        <div className="md:col-span-2">
          <label htmlFor="estimated_guests" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Estimasi Jumlah Tamu / Undangan (Orang)
          </label>
          <input
            id="estimated_guests"
            name="estimated_guests"
            type="number"
            min="1"
            placeholder="Contoh: 300"
            value={formData.estimated_guests}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Description / Notes */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Deskripsi / Kebutuhan Event
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Tuliskan gambaran acara, konsep yang diinginkan, preferensi venue/dekorasi, atau catatan khusus lainnya..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Informasi ini akan membantu Event Manager memahami kebutuhan dan mempersiapkan perencanaan event Anda.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
        <Link
          href="/dashboard/client"
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center transition-all"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Mengirim Pengajuan...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Kirim Pengajuan Event</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
