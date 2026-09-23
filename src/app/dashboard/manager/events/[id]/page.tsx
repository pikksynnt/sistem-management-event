import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatusBadge from '@/components/ui/StatusBadge';
import ManagerActionButtons from '@/components/ManagerActionButtons';
import VenueSectionManager from '@/components/VenueSectionManager';
import RundownManager from '@/components/RundownManager';
import VendorAssignmentManager from '@/components/VendorAssignmentManager';
import { formatDateTimeIndo } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManagerEventDetailPage({ params }: PageProps) {
  // Server-side RBAC Guard: Hanya role 'event_manager' yang boleh mengakses
  const session = await requireAuth(['event_manager']);
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id, 10);

  if (isNaN(eventId)) {
    notFound();
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      venue: true,
      approver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      schedules: {
        orderBy: { order_index: 'asc' },
      },
      vendors: {
        include: {
          vendor: true,
          vendor_logs: {
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { assigned_at: 'desc' },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Fetch all venues for selector modal
  const allVenues = await db.venue.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      capacity: true,
      address: true,
    },
    orderBy: { name: 'asc' },
  });

  // Fetch all VERIFIED vendors for assignment modal
  const verifiedVendors = await db.vendorProfile.findMany({
    where: { verification_status: 'verified' },
    select: {
      id: true,
      company_name: true,
      service_category: true,
      contact_person: true,
      phone: true,
      verification_status: true,
    },
    orderBy: { company_name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Global SaaS Navigation */}
      <DashboardNavbar user={session} />

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Breadcrumb & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/dashboard/manager" className="hover:text-indigo-600 transition-colors">
              Dashboard Manager
            </Link>
            <span>/</span>
            <span>Events</span>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">{event.title}</span>
          </div>

          <Link
            href="/dashboard/manager"
            className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Action Bar (Top priority for submitted events) */}
        {event.status === 'submitted' && (
          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Pengajuan Memerlukan Keputusan
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Tinjau detail teknis event di bawah, lalu tentukan persetujuan atau penolakan.
              </p>
            </div>

            <ManagerActionButtons
              eventId={event.id}
              eventTitle={event.title}
              status={event.status}
            />
          </div>
        )}

        {/* Status Callout Banner */}
        {event.status === 'approved' && (
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-emerald-900 text-sm flex items-start gap-3 shadow-xs">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-emerald-900">Event Telah Disetujui</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Disetujui oleh <span className="font-semibold text-emerald-900">{event.approver?.name || session.name}</span> pada {formatDateTimeIndo(event.approved_at)}. Anda dapat menentukan venue, menyusun rundown, dan menugaskan vendor rekanan di bawah.
              </p>
            </div>
          </div>
        )}

        {event.status === 'rejected' && (
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/70 text-rose-900 text-sm flex items-start gap-3 shadow-xs">
            <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1">
              <p className="font-bold text-rose-900">Event Ditolak</p>
              <p className="text-xs text-rose-700">
                Diputuskan oleh <span className="font-semibold text-rose-900">{event.approver?.name || session.name}</span> pada {formatDateTimeIndo(event.approved_at)}.
              </p>
              {event.rejection_reason && (
                <div className="mt-2 p-3 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-medium">
                  <strong>Alasan Penolakan: </strong>
                  {event.rejection_reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Event Core Info & Sections (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {event.event_type}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                    {event.title}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    ID Event: #{event.id} • Diajukan pada: {formatDateTimeIndo(event.created_at)}
                  </p>
                </div>
                <div>
                  <StatusBadge status={event.status} type="event" />
                </div>
              </div>

              {/* Schedule & Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <p className="text-xs text-slate-500">Waktu Mulai Pelaksanaan</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {formatDateTimeIndo(event.start_date)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <p className="text-xs text-slate-500">Waktu Selesai Pelaksanaan</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {formatDateTimeIndo(event.end_date)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 sm:col-span-2">
                  <p className="text-xs text-slate-500">Estimasi Jumlah Undangan / Tamu</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {event.estimated_guests ? `${event.estimated_guests.toLocaleString('id-ID')} Orang` : 'Belum ditentukan'}
                  </p>
                </div>
              </div>

              {/* Description / Requirement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Deskripsi / Kebutuhan Event
                </h3>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {event.description || 'Tidak ada catatan atau deskripsi khusus dari pemohon.'}
                </p>
              </div>
            </div>

            {/* SECTION 1: VENUE MANAGEMENT */}
            <VenueSectionManager
              eventId={event.id}
              eventTitle={event.title}
              currentVenue={event.venue}
              availableVenues={allVenues}
            />

            {/* SECTION 2: RUNDOWN MANAGEMENT */}
            <RundownManager
              eventId={event.id}
              eventTitle={event.title}
              schedules={event.schedules}
            />

            {/* SECTION 3: VENDOR ASSIGNMENT & STATUS TRACKING */}
            <VendorAssignmentManager
              eventId={event.id}
              eventTitle={event.title}
              assignments={event.vendors}
              verifiedVendors={verifiedVendors}
            />
          </div>

          {/* Right Column: Client Profile & LifeCycle Info (1 col) */}
          <div className="space-y-6">
            {/* Client Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {(event.client?.name?.charAt(0) || 'K').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Profil Klien Pemohon</h3>
                  <p className="text-xs text-slate-500">Pemilik pengajuan event</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-500">Nama Lengkap</p>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">{event.client?.name || 'Klien'}</p>
                </div>

                <div>
                  <p className="text-slate-500">Alamat Email</p>
                  <p className="font-medium text-slate-800 mt-0.5">{event.client?.email || '-'}</p>
                </div>

                <div>
                  <p className="text-slate-500">Nomor Telepon / WhatsApp</p>
                  <p className="font-medium text-slate-800 mt-0.5">{event.client?.phone || 'Belum diisi'}</p>
                </div>

                <div>
                  <p className="text-slate-500">ID User</p>
                  <p className="font-mono text-slate-600 mt-0.5">User #{event.client?.id ?? '-'}</p>
                </div>
              </div>
            </div>

            {/* Event Lifecycle Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Informasi Sistem
              </h3>
              <div className="flex justify-between text-slate-500">
                <span>Dibuat:</span>
                <span className="text-slate-800 font-medium">{formatDateTimeIndo(event.created_at)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Terakhir Diubah:</span>
                <span className="text-slate-800 font-medium">{formatDateTimeIndo(event.updated_at)}</span>
              </div>
              {event.approved_by && (
                <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100">
                  <span>Direview Oleh:</span>
                  <span className="text-slate-800 font-medium">{event.approver?.name || `Manager #${event.approved_by}`}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
