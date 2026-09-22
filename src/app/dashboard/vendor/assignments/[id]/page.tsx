import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatusBadge from '@/components/ui/StatusBadge';
import VendorStatusUpdateControl from '@/components/VendorStatusUpdateControl';
import RundownTimelineView from '@/components/RundownTimelineView';
import { formatDateTimeIndo, formatDateIndo } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorAssignmentDetailPage({ params }: PageProps) {
  const session = await requireAuth(['vendor']);
  const resolvedParams = await params;
  const assignmentId = parseInt(resolvedParams.id, 10);

  if (isNaN(assignmentId)) {
    notFound();
  }

  // Server-side isolation: must match vendor.user_id === session.id
  const assignment = await db.eventVendor.findFirst({
    where: {
      id: assignmentId,
      vendor: {
        user_id: session.id,
      },
    },
    include: {
      event: {
        include: {
          venue: true,
          schedules: {
            orderBy: { order_index: 'asc' },
          },
        },
      },
      vendor: true,
      vendor_logs: {
        include: {
          updater: {
            select: { name: true, role: true },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!assignment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <DashboardNavbar session={session} roleLabel="Vendor" />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard/vendor" className="hover:text-indigo-600 transition-colors">
              Dashboard Vendor
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Tugas #{assignment.id}</span>
          </div>

          <Link
            href="/dashboard/vendor"
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Action Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {assignment.vendor.service_category}
              </span>
              <StatusBadge status={assignment.status} type="assignment" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{assignment.job_title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Event: <strong className="text-slate-800 font-semibold">{assignment.event.title}</strong> • Ditugaskan pada: {formatDateIndo(assignment.assigned_at)}
            </p>
          </div>

          <VendorStatusUpdateControl
            assignmentId={assignment.id}
            currentStatus={assignment.status}
          />
        </div>

        {/* Technical Specs & Logistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scope of Work */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
              Rincian Scope of Work
            </h2>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {assignment.scope_of_work || 'Tidak ada rincian scope of work khusus dari Event Manager.'}
            </div>

            {assignment.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <strong className="text-slate-800">Catatan Progres Terkini: </strong>
                {assignment.notes}
              </div>
            )}
          </div>

          {/* Event & Venue Info */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
              Jadwal & Lokasi Pelaksanaan
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500">Tipe Acara</p>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {assignment.event.event_type}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Waktu Mulai Acara</p>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {formatDateTimeIndo(assignment.event.start_date)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Waktu Selesai Acara</p>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {formatDateTimeIndo(assignment.event.end_date)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Estimasi Jumlah Undangan</p>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {assignment.event.estimated_guests
                    ? `${assignment.event.estimated_guests.toLocaleString('id-ID')} Orang`
                    : 'Belum ditentukan'}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Lokasi / Venue Gedung</p>
                <p className="text-slate-900 font-medium text-sm mt-0.5">
                  {assignment.event.venue
                    ? `${assignment.event.venue.name} (${assignment.event.venue.address}, ${assignment.event.venue.city})`
                    : 'Lokasi venue belum ditentukan oleh EO'}
                </p>
                {assignment.event.venue?.facilities && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    <strong className="text-slate-700">Fasilitas Venue: </strong>
                    {assignment.event.venue.facilities}
                  </p>
                )}
                {assignment.event.venue?.contact_person && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <strong className="text-slate-700">Kontak Venue: </strong>
                    {assignment.event.venue.contact_person} ({assignment.event.venue.contact_phone || '-'})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rundown Reference (Read-Only) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Susunan Rundown Acara</h2>
              <p className="text-xs text-slate-500">
                Gunakan acuan jadwal ini untuk mempersiapkan waktu loading dan instalasi peralatan.
              </p>
            </div>
          </div>

          <RundownTimelineView schedules={assignment.event.schedules} />
        </div>

        {/* Audit Trail Logs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Riwayat Progres & Audit Log</h2>
            <p className="text-xs text-slate-500">
              Catatan riwayat setiap pembaruan status dan catatan progres pekerjaan vendor.
            </p>
          </div>

          {assignment.vendor_logs.length === 0 ? (
            <div className="text-xs text-slate-400 italic">Belum ada riwayat aktivitas.</div>
          ) : (
            <div className="space-y-3">
              {assignment.vendor_logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        {log.new_status}
                      </span>
                      {log.previous_status && log.previous_status !== log.new_status && (
                        <span className="text-[10px] text-slate-400">
                          (sebelumnya: {log.previous_status})
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-slate-600 mt-1">{log.notes}</p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    <div className="font-semibold text-slate-700">{log.updater?.name || 'Sistem'}</div>
                    <div className="text-slate-400 font-mono mt-0.5">
                      {formatDateTimeIndo(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

