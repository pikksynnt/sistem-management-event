'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeEventVendor } from '@/lib/actions/vendor';
import VendorAssignmentModal, { VerifiedVendorOption } from './VendorAssignmentModal';
import VendorMonitoringSummary from './VendorMonitoringSummary';
import VendorStatusUpdateControl from './VendorStatusUpdateControl';
import StatusBadge from './ui/StatusBadge';
import ConfirmModal from './ui/ConfirmModal';
import FeedbackAlert from './ui/FeedbackAlert';
import { formatDateTimeIndo } from '@/lib/utils';

export interface AssignedVendorItem {
  id: number;
  event_id: number;
  vendor_id: number;
  job_title: string;
  scope_of_work: string | null;
  status: string;
  notes: string | null;
  assigned_at: Date | string;
  vendor: {
    id: number;
    company_name: string;
    service_category: string;
    contact_person: string;
    phone: string;
  };
  vendor_logs?: Array<{
    id: number;
    previous_status: string | null;
    new_status: string;
    notes: string | null;
    created_at: Date | string;
    updater?: {
      name: string;
      role?: string;
    };
  }>;
}

interface VendorAssignmentManagerProps {
  eventId: number;
  eventTitle: string;
  assignments: AssignedVendorItem[];
  verifiedVendors: VerifiedVendorOption[];
}

export default function VendorAssignmentManager({
  eventId,
  eventTitle,
  assignments,
  verifiedVendors,
}: VendorAssignmentManagerProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  const [removingItem, setRemovingItem] = useState<{ id: number; companyName: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleExpandLogs = (id: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleConfirmRemove = async () => {
    if (!removingItem) return;
    setError(null);
    setIsRemoving(true);

    try {
      const res = await removeEventVendor(removingItem.id, eventId);
      if (!res.success) {
        setError(res.error || 'Gagal menghapus penugasan vendor.');
        setIsRemoving(false);
        setRemovingItem(null);
        return;
      }

      setIsRemoving(false);
      setRemovingItem(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setIsRemoving(false);
      setRemovingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Tim & Mitra Vendor Event</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {assignments.length} Vendor Ditugaskan
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih, koordinasikan, dan pantau kesiapan seluruh vendor terverifikasi pada event ini.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tugaskan Vendor</span>
        </button>
      </div>

      {error && (
        <FeedbackAlert
          type="error"
          title="Gagal Menghapus Penugasan"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Monitoring Summary Card if there are assignments */}
      {assignments.length > 0 && (
        <VendorMonitoringSummary assignments={assignments} />
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-900">Belum ada vendor yang ditugaskan pada event ini.</p>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
            Tugaskan vendor sound system, catering, dekorasi, atau dokumentasi untuk event ini.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tugaskan Vendor Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((item) => {
            const isLogsOpen = !!expandedLogs[item.id];
            const logsCount = item.vendor_logs?.length || 0;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Vendor Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{item.vendor.company_name}</h4>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {item.vendor.service_category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PIC: <span className="text-slate-800 font-medium">{item.vendor.contact_person}</span> • Telp / WA: <span className="font-mono text-slate-700">{item.vendor.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} type="assignment" />

                    <button
                      onClick={() => setRemovingItem({ id: item.id, companyName: item.vendor.company_name })}
                      title="Batalkan Penugasan"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Job Title & Scope */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500">Tugas / Peran: </span>
                    <span className="font-semibold text-slate-900">{item.job_title}</span>
                  </div>

                  {item.scope_of_work && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed">
                      <strong className="text-slate-500 block mb-0.5">Scope of Work:</strong>
                      {item.scope_of_work}
                    </div>
                  )}

                  {item.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-200/60 text-slate-600">
                      <strong className="text-slate-700">Catatan Progres Terkini: </strong>
                      {item.notes}
                    </div>
                  )}
                </div>

                {/* Manager Action & Update Control */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <VendorStatusUpdateControl
                    assignmentId={item.id}
                    currentStatus={item.status}
                  />

                  {logsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpandLogs(item.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${isLogsOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>{isLogsOpen ? 'Sembunyikan' : 'Lihat'} Riwayat Audit Log ({logsCount})</span>
                    </button>
                  )}
                </div>

                {/* Full Audit Logs Timeline when expanded */}
                {isLogsOpen && item.vendor_logs && item.vendor_logs.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 animate-fade-in text-xs">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Riwayat Pembaruan Status & Catatan Progres
                    </p>
                    <div className="space-y-2">
                      {item.vendor_logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 uppercase text-[11px]">
                                {log.new_status}
                              </span>
                              {log.previous_status && log.previous_status !== log.new_status && (
                                <span className="text-[10px] text-slate-400">
                                  (sebelumnya: {log.previous_status})
                                </span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-slate-600 mt-1">{log.notes}</p>
                            )}
                          </div>

                          <div className="text-right text-[11px] text-slate-500 shrink-0">
                            <div className="font-medium text-slate-700">{log.updater?.name || 'Sistem'}</div>
                            <div className="text-slate-400 font-mono mt-0.5">
                              {formatDateTimeIndo(log.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Modal */}
      <VendorAssignmentModal
        eventId={eventId}
        eventTitle={eventTitle}
        verifiedVendors={verifiedVendors}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Confirm Remove Modal */}
      <ConfirmModal
        isOpen={!!removingItem}
        title="Batalkan Penugasan Vendor?"
        description={`Apakah Anda yakin ingin membatalkan penugasan vendor "${removingItem?.companyName}" dari event ini?`}
        confirmLabel="Batalkan Penugasan"
        confirmVariant="danger"
        isLoading={isRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemovingItem(null)}
      />
    </div>
  );
}
