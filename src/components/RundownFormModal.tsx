'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEventSchedule, updateEventSchedule } from '@/lib/actions/schedule';
import FeedbackAlert from './ui/FeedbackAlert';

export interface ScheduleItemData {
  id: number;
  event_id: number;
  title: string;
  description: string | null;
  start_time: string | Date;
  end_time: string | Date;
  pic_name: string | null;
  order_index: number;
}

interface RundownFormModalProps {
  eventId: number;
  eventTitle: string;
  initialData?: ScheduleItemData | null;
  isOpen: boolean;
  onClose: () => void;
  nextOrderIndex?: number;
}

function formatDateForInput(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  // Format to YYYY-MM-DDTHH:mm
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function RundownFormModal({
  eventId,
  eventTitle,
  initialData,
  isOpen,
  onClose,
  nextOrderIndex = 1,
}: RundownFormModalProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    pic_name: '',
    order_index: String(nextOrderIndex),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        start_time: formatDateForInput(initialData.start_time),
        end_time: formatDateForInput(initialData.end_time),
        pic_name: initialData.pic_name || '',
        order_index: String(initialData.order_index),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        pic_name: '',
        order_index: String(nextOrderIndex),
      });
    }
    setError(null);
  }, [initialData, nextOrderIndex, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isEditing && initialData) {
        res = await updateEventSchedule(initialData.id, {
          title: formData.title,
          description: formData.description || null,
          start_time: formData.start_time,
          end_time: formData.end_time,
          pic_name: formData.pic_name || null,
          order_index: formData.order_index ? parseInt(formData.order_index, 10) : undefined,
        });
      } else {
        res = await createEventSchedule({
          event_id: eventId,
          title: formData.title,
          description: formData.description || null,
          start_time: formData.start_time,
          end_time: formData.end_time,
          pic_name: formData.pic_name || null,
          order_index: formData.order_index ? parseInt(formData.order_index, 10) : undefined,
        });
      }

      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat menyimpan item rundown.');
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
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Item Rundown' : 'Tambah Item Rundown'}
              </h3>
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <FeedbackAlert
              type="error"
              title="Gagal Menyimpan"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Judul Kegiatan / Sesi <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Contoh: Registrasi Tamu & Coffee Break / Pembukaan Acara"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="start_time" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Waktu Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="end_time" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Waktu Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            {/* PIC Name */}
            <div>
              <label htmlFor="pic_name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                PIC / Penanggung Jawab
              </label>
              <input
                id="pic_name"
                name="pic_name"
                type="text"
                placeholder="Contoh: MC / Tim Registrasi / Budi"
                value={formData.pic_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            {/* Order Index */}
            <div>
              <label htmlFor="order_index" className="block text-xs font-semibold text-slate-700 mb-1.5">
                No. Urutan
              </label>
              <input
                id="order_index"
                name="order_index"
                type="number"
                min="1"
                value={formData.order_index}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deskripsi / Catatan Sesi
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Detail arahan kegiatan, kebutuhan audio/visual, atau catatan teknis pelaksanaan..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
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
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEditing ? 'Simpan Perubahan' : 'Tambah ke Rundown'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
