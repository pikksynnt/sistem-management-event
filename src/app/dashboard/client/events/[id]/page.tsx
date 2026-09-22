import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatusBadge from '@/components/ui/StatusBadge';
import RundownTimelineView from '@/components/RundownTimelineView';
import VendorAssignmentClientView from '@/components/VendorAssignmentClientView';
import { formatDateIndo, formatDateTimeIndo } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientEventDetailPage({ params }: PageProps) {
  const session = await requireAuth(['client']);
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id, 10);

  if (isNaN(eventId)) {
    notFound();
  }

  // Server-side isolation: query restricts strictly to client_id
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      client_id: session.id,
    },
    include: {
      venue: true,
      approver: {
        select: {
          name: true,
          email: true,
        },
      },
      schedules: {
        orderBy: { order_index: 'asc' },
      },
      vendors: {
        include: {
          vendor: {
            select: {
              company_name: true,
              service_category: true,
            },
          },
        },
        orderBy: { assigned_at: 'desc' },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <DashboardNavbar session={session} roleLabel="Klien" />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard/client" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Detail Event #{event.id}</span>
          </div>

          <Link
            href="/dashboard/client"
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Status Callout Banner */}
        {event.status === 'submitted' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-900">Pengajuan Sedang Ditinjau</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Event Manager sedang meninjau ketersediaan tim dan slot jadwal. Anda akan melihat pembaruan status di halaman ini setelah proses review selesai.
              </p>
            </div>
          </div>
        )}

        {event.status === 'approved' && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-emerald-900">Pengajuan Disetujui</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Disetujui oleh <span className="font-semibold text-emerald-800">{event.approver?.name || 'Event Manager'}</span> pada {formatDateTimeIndo(event.approved_at)}. Event Anda sedang dalam tahap persiapan venue, rundown, dan mitra vendor.
              </p>
            </div>
          </div>
        )}

        {event.status === 'rejected' && (
          <div className="p-5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1">
              <p className="font-bold text-rose-900">Pengajuan Ditolak</p>
              <p className="text-xs text-rose-700">
                Event ini belum dapat disetujui oleh Event Manager ({event.approver?.name || 'Manager'}).
              </p>
              {event.rejection_reason && (
                <div className="mt-2 p-3 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-medium">
                  <strong>Alasan Penolakan: </strong>
                  {event.rejection_reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 1: INFORMASI UTAMA EVENT */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {event.event_type}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                {event.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Diajukan pada: {formatDateTimeIndo(event.created_at)}
              </p>
            </div>
            <div>
              <StatusBadge status={event.status} type="event" />
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-500">Waktu Mulai</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatDateTimeIndo(event.start_date)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-500">Waktu Selesai</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatDateTimeIndo(event.end_date)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <p className="text-xs text-slate-500">Estimasi Jumlah Tamu / Undangan</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {event.estimated_guests ? `${event.estimated_guests.toLocaleString('id-ID')} Orang` : 'Belum ditentukan'}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Deskripsi / Kebutuhan Event
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {event.description || 'Tidak ada deskripsi atau catatan khusus yang disertakan.'}
            </p>
          </div>
        </div>

        {/* SECTION 2: INFORMASI VENUE / LOKASI (READ-ONLY) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Lokasi & Venue Acara</span>
                {event.venue ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Telah Ditentukan EO
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                    Belum Ditentukan
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lokasi pelaksanaan event yang telah ditetapkan oleh tim Event Organizer.
              </p>
            </div>
          </div>

          {event.venue ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{event.venue.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.venue.address}, <strong className="text-slate-800">{event.venue.city}</strong></span>
                  </p>
                </div>
                {event.venue.capacity && (
                  <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
                    Kapasitas Gedung: {event.venue.capacity.toLocaleString('id-ID')} Orang
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Kontak Pengelola Venue
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {event.venue.contact_person || 'Dikoordinasikan oleh EO'}
                  </p>
                  {event.venue.contact_phone && (
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      {event.venue.contact_phone}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Fasilitas Gedung
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {event.venue.facilities || 'Fasilitas standar venue terverifikasi'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">Venue Belum Ditentukan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Tim Event Manager kami sedang berkoordinasi dan memilih lokasi venue terbaik sesuai kebutuhan acara Anda.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 3: RUNDOWN & JADWAL KEGIATAN (READ-ONLY) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Susunan Rundown Acara</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {event.schedules.length} Sesi
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rundown resmi dan rincian alur kegiatan yang disusun oleh Event Organizer.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Read-Only
            </span>
          </div>

          <RundownTimelineView
            schedules={event.schedules}
            emptyMessage="Susunan rundown kegiatan sedang dipersiapkan oleh tim Event Manager."
          />
        </div>

        {/* SECTION 4: VENDOR YANG DITUGASKAN (READ-ONLY) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Vendor yang Ditugaskan</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {event.vendors.length} Vendor
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar mitra vendor resmi yang dipilih oleh Event Organizer untuk menangani acara Anda.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Read-Only
            </span>
          </div>

          <VendorAssignmentClientView assignments={event.vendors} />
        </div>
      </main>
    </div>
  );
}

