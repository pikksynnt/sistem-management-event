import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import DeleteVenueButton from '@/components/DeleteVenueButton';

export default async function VenuesListPage() {
  const session = await requireAuth(['event_manager']);

  const venues = await db.venue.findMany({
    include: {
      events: {
        select: { id: true, title: true, status: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const totalVenues = venues.length;
  const totalCapacity = venues.reduce((sum, v) => sum + (v.capacity || 0), 0);
  const distinctCities = new Set(venues.map((v) => v.city)).size;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Global SaaS Navigation */}
      <DashboardNavbar
        userName={session.name}
        userEmail={session.email}
        role="event_manager"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/dashboard/manager" className="hover:text-indigo-600 transition-colors">
              Dashboard Manager
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Master Venue</span>
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

        {/* Page Header */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data Venue & Lokasi</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kelola daftar gedung, convention hall, hotel, dan area pelaksanaan event rekanan Event Organizer.
            </p>
          </div>

          <Link
            href="/dashboard/manager/venues/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Venue Baru</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Venue Rekanan"
            value={totalVenues}
            description="Gedung & lokasi aktif"
            variant="default"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatCard
            label="Total Daya Tampung"
            value={`${totalCapacity.toLocaleString('id-ID')} Org`}
            description="Akumulasi kapasitas venue"
            variant="primary"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            label="Cakupan Kota"
            value={`${distinctCities} Kota`}
            description="Wilayah operasional EO"
            variant="success"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>

        {/* List of Venues */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Daftar Semua Venue ({venues.length})</h2>
          </div>

          {venues.length === 0 ? (
            <EmptyState
              title="Belum Ada Venue Terdaftar"
              description="Tambahkan venue rekanan pertama Anda untuk mulai menugaskan lokasi ke event."
              actionLabel="+ Tambah Venue"
              actionHref="/dashboard/manager/venues/new"
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-3.5">Nama Gedung & Lokasi</th>
                      <th className="px-6 py-3.5">Kapasitas</th>
                      <th className="px-6 py-3.5">Fasilitas Utama</th>
                      <th className="px-6 py-3.5">Pengelola / Kontak</th>
                      <th className="px-6 py-3.5">Event Terkait</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {venues.map((v) => {
                      const eventCount = v.events.length;
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{v.name}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {v.city}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 max-w-xs line-clamp-1">{v.address}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                            {v.capacity ? `${v.capacity.toLocaleString('id-ID')} Orang` : '-'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">
                            <span className="line-clamp-2">{v.facilities || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="font-medium text-slate-800">{v.contact_person || '-'}</div>
                            {v.contact_phone && (
                              <div className="text-slate-500 mt-0.5 font-mono">{v.contact_phone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {eventCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {eventCount} Event
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum ada</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/dashboard/manager/venues/${v.id}/edit`}
                                title="Edit Venue"
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>

                              <DeleteVenueButton venueId={v.id} venueName={v.name} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Card List View */}
              <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
                {venues.map((v) => {
                  const eventCount = v.events.length;
                  return (
                    <div key={v.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{v.name}</h3>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            {v.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/dashboard/manager/venues/${v.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <DeleteVenueButton venueId={v.id} venueName={v.name} />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{v.address}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                        <div>
                          <span className="text-slate-500">Kapasitas:</span>
                          <p className="font-semibold text-slate-800">{v.capacity ? `${v.capacity.toLocaleString('id-ID')} Org` : '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Event Terkait:</span>
                          <p className="font-semibold text-slate-800">{eventCount} Event</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
