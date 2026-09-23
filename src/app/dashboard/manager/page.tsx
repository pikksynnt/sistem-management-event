import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { formatDateIndo } from '@/lib/utils';

import { EventStatus, Prisma } from '@prisma/client';

interface PageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function ManagerDashboardPage({ searchParams }: PageProps) {
  const session = await requireAuth(['event_manager']);
  const resolvedParams = searchParams ? await searchParams : {};
  const currentStatusFilter = resolvedParams.status;

  // 1. Query counts for summary statistics (Actual DB data, no hardcoding)
  const [
    totalEvents,
    countSubmitted,
    countApproved,
    countRejected,
    totalVenues,
    totalVendors,
    pendingVendors,
  ] = await Promise.all([
    db.event.count(),
    db.event.count({ where: { status: 'submitted' } }),
    db.event.count({ where: { status: 'approved' } }),
    db.event.count({ where: { status: 'rejected' } }),
    db.venue.count(),
    db.vendorProfile.count(),
    db.vendorProfile.count({ where: { verification_status: 'pending' } }),
  ]);

  // 2. Query events with optional status filter
  const whereClause: Prisma.EventWhereInput = {};
  if (
    currentStatusFilter &&
    Object.values(EventStatus).includes(currentStatusFilter as EventStatus)
  ) {
    whereClause.status = currentStatusFilter as EventStatus;
  }

  const events = await db.event.findMany({
    where: whereClause,
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      venue: { select: { id: true, name: true, city: true } },
      approver: { select: { id: true, name: true } },
    },
    orderBy: [
      { created_at: 'desc' },
    ],
  });

  const isFiltering = !!currentStatusFilter && currentStatusFilter !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardNavbar user={session} />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Dashboard Event Manager"
          subtitle="Kelola, tinjau, dan setujui seluruh pengajuan event dengan terstruktur dan efisien."
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/manager/venues"
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>Master Venue</span>
              </Link>
              <Link
                href="/dashboard/manager/vendors"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Database Vendor</span>
                {pendingVendors > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-700">
                    {pendingVendors}
                  </span>
                )}
              </Link>
            </div>
          }
        />

        {/* 1. Dashboard Summary: 4 Core Event Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Event"
            value={totalEvents}
            description="Semua pengajuan event"
            href="/dashboard/manager"
            isActive={!isFiltering}
            iconBgColor="bg-slate-100 text-slate-700"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          <StatCard
            label="Menunggu Review"
            value={countSubmitted}
            description="Perlu keputusan segera"
            href="/dashboard/manager?status=submitted"
            isActive={currentStatusFilter === 'submitted'}
            iconBgColor="bg-amber-50 text-amber-600"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            label="Event Disetujui"
            value={countApproved}
            description="Pengajuan telah disetujui"
            href="/dashboard/manager?status=approved"
            isActive={currentStatusFilter === 'approved'}
            iconBgColor="bg-emerald-50 text-emerald-600"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            label="Event Ditolak"
            value={countRejected}
            description="Pengajuan yang ditolak"
            href="/dashboard/manager?status=rejected"
            isActive={currentStatusFilter === 'rejected'}
            iconBgColor="bg-rose-50 text-rose-600"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* 2. Events List Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filter Tabs Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Event</h2>
              <p className="text-xs text-slate-500">
                Informasi pengajuan event klien beserta jadwal, jumlah tamu, dan status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href="/dashboard/manager"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  !isFiltering
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({totalEvents})
              </Link>
              <Link
                href="/dashboard/manager?status=submitted"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStatusFilter === 'submitted'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Menunggu Review ({countSubmitted})
              </Link>
              <Link
                href="/dashboard/manager?status=approved"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Disetujui ({countApproved})
              </Link>
              <Link
                href="/dashboard/manager?status=rejected"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStatusFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ditolak ({countRejected})
              </Link>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="p-8">
              {isFiltering ? (
                <EmptyState
                  title="Tidak Ada Event Ditemukan"
                  description="Tidak ada data event dengan filter status yang Anda pilih."
                  actionHref="/dashboard/manager"
                  actionLabel="Reset Filter Status"
                />
              ) : (
                <EmptyState
                  title="Belum Ada Pengajuan Event"
                  description="Saat ini belum ada pengajuan event dari klien yang terdaftar di dalam sistem."
                />
              )}
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/75 text-xs font-semibold text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Nama Event & Kategori</th>
                      <th className="px-6 py-3.5">Klien Pemohon</th>
                      <th className="px-6 py-3.5">Tanggal Acara</th>
                      <th className="px-6 py-3.5">Jumlah Tamu</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{ev.title}</div>
                          <div className="text-xs text-indigo-600 font-medium mt-0.5">{ev.event_type}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{ev.client?.name || 'Klien'}</div>
                          <div className="text-xs text-slate-400">{ev.client?.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          <div className="font-medium">{formatDateIndo(ev.start_date)}</div>
                          <div className="text-slate-400 mt-0.5">{ev.venue?.name || 'Venue TBA'}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-700">
                          {ev.estimated_guests ? (
                            <span className="font-medium">{ev.estimated_guests.toLocaleString('id-ID')} Tamu</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ev.status} type="event" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/manager/events/${ev.id}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              ev.status === 'submitted'
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{ev.status === 'submitted' ? 'Review' : 'Lihat Detail'}</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Card List */}
              <div className="md:hidden divide-y divide-slate-100">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{ev.title}</h3>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">{ev.event_type}</p>
                      </div>
                      <StatusBadge status={ev.status} type="event" size="sm" />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Klien:</span>
                        <span className="font-medium text-slate-800">{ev.client?.name || 'Klien'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Tanggal Acara:</span>
                        <span className="font-medium text-slate-700">{formatDateIndo(ev.start_date)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Jumlah Tamu:</span>
                        <span className="font-medium text-slate-700">
                          {ev.estimated_guests ? `${ev.estimated_guests.toLocaleString('id-ID')} Tamu` : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Venue:</span>
                        <span className="text-slate-600">{ev.venue?.name || 'Venue TBA'}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link
                        href={`/dashboard/manager/events/${ev.id}`}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          ev.status === 'submitted'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{ev.status === 'submitted' ? 'Review Pengajuan' : 'Lihat Detail Event'}</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3. Quick Navigation: Master Venue & Database Vendor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Master Venue Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Master Venue</h3>
                  <p className="text-xs text-slate-400">{totalVenues} Lokasi Terdaftar</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Kelola data ballroom, gedung acara, kapasitas tamu, fasilitas, dan kontak operasional venue.
              </p>
            </div>
            <div className="pt-4 mt-auto">
              <Link
                href="/dashboard/manager/venues"
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Buka Master Venue</span>
              </Link>
            </div>
          </div>

          {/* Database Vendor Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Database Vendor</h3>
                  <p className="text-xs text-slate-400">{totalVendors} Vendor Rekanan</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tinjau pendaftaran vendor baru, verifikasi status legalitas, dan kategorisasi jasa rekanan.
              </p>
            </div>
            <div className="pt-4 mt-auto">
              <Link
                href="/dashboard/manager/vendors"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Buka Database Vendor</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
