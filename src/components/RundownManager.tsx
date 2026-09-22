'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEventSchedule } from '@/lib/actions/schedule';
import RundownFormModal, { ScheduleItemData } from './RundownFormModal';
import ConfirmModal from './ui/ConfirmModal';
import FeedbackAlert from './ui/FeedbackAlert';

interface RundownManagerProps {
  eventId: number;
  eventTitle: string;
  schedules: ScheduleItemData[];
}

function formatTimeOnly(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function RundownManager({
  eventId,
  eventTitle,
  schedules,
}: RundownManagerProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItemData | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort schedules by order_index asc
  const sorted = [...schedules].sort((a, b) => {
    if (a.order_index !== b.order_index) return a.order_index - b.order_index;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const nextOrderIndex = sorted.length > 0 ? Math.max(...sorted.map((s) => s.order_index)) + 1 : 1;

  const handleOpenAdd = () => {
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItemData) => {
    setSelectedSchedule(item);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setError(null);
    setIsDeleting(true);

    try {
      const res = await deleteEventSchedule(deletingItem.id, eventId);
      if (!res.success) {
        setError(res.error || 'Gagal menghapus rundown.');
        setIsDeleting(false);
        setDeletingItem(null);
        return;
      }

      setIsDeleting(false);
      setDeletingItem(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Susunan Rundown / Jadwal Kegiatan</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {sorted.length} Sesi
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola jadwal, durasi waktu, penanggung jawab, dan rincian kegiatan acara.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Rundown</span>
        </button>
      </div>

      {error && (
        <FeedbackAlert
          type="error"
          title="Gagal Menghapus Rundown"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Table / Empty State */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-900">Belum Ada Sesi Rundown</p>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
            Mulai susun alur kegiatan acara mulai dari registrasi, pembukaan, hingga penutupan.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Sesi Pertama</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3.5 w-14 text-center">No</th>
                  <th className="px-4 py-3.5 w-36">Waktu</th>
                  <th className="px-6 py-3.5">Kegiatan & Rincian Sesi</th>
                  <th className="px-4 py-3.5 w-40">PIC</th>
                  <th className="px-4 py-3.5 w-24 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((item, index) => {
                  const numStr = String(item.order_index || index + 1).padStart(2, '0');
                  const timeRange = `${formatTimeOnly(item.start_time)} - ${formatTimeOnly(item.end_time)}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-400">
                        {numStr}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                          {timeRange}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {item.pic_name ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {item.pic_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Sesi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingItem({ id: item.id, title: item.title })}
                            title="Hapus Sesi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <RundownFormModal
        eventId={eventId}
        eventTitle={eventTitle}
        initialData={selectedSchedule}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        nextOrderIndex={nextOrderIndex}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Sesi Rundown?"
        description={`Apakah Anda yakin ingin menghapus sesi "${deletingItem?.title}" dari susunan rundown event ini?`}
        confirmLabel="Hapus Sesi"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}
