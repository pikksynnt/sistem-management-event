import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { formatDateIndo } from '@/lib/utils';

export default async function ClientDashboardPage() {
  // Server-side RBAC Guard: Hanya role 'client' yang boleh mengakses
  const session = await requireAuth(['client']);

  // Ambil HANYA event yang diajukan oleh klien ini sendiri
  const myEvents = await db.event.findMany({
    where: { client_id: session.id },
    include: {
      venue: true,
      approver: {
        select: { name: true, email: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const countTotal = myEvents.length;
  const countSubmitted = myEvents.filter((e) => e.status === 'submitted').length;
  const countApproved = myEvents.filter((e) => ['approved', 'in_planning', 'ongoing', 'completed'].includes(e.status)).length;
  const countRejected = myEvents.filter((e) => e.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <DashboardNavbar session={session} roleLabel="Klien" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Halo, {session.name} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Senang melihat Anda di sini. Mari wujudkan event impian Anda!
            </p>
          </div>
          <Link
            href="/dashboard/client/events/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajukan Event Baru</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Pengajuan"
            value={countTotal}
            color="indigo"
            subtitle="Semua riwayat event Anda"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Menunggu Review"
            value={countSubmitted}
            color="amber"
            subtitle="Sedang ditinjau Event Manager"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Disetujui"
            value={countApproved}
            color="emerald"
            subtitle="Siap / dalam persiapan"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Ditolak"
            value={countRejected}
            color="rose"
            subtitle="Memerlukan revisi data"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Client's Events List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Event Saya</h2>
              <p className="text-xs text-slate-500">
                Data terisolasi secara server-side hanya untuk akun Anda.
              </p>
            </div>
            <Link
              href="/dashboard/client/events/new"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              <span>+ Ajukan Event Baru</span>
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="Belum Ada Event"
                description="Belum ada event yang diajukan. Mulai rencanakan event Anda bersama tim Event Organizer kami."
                action={{
                  label: 'Ajukan Event Pertama',
                  href: '/dashboard/client/events/new',
                }}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myEvents.map((ev) => (
                <div key={ev.id} className="p-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-base text-slate-900">
                          {ev.title}
                        </h3>
                        <StatusBadge status={ev.status} type="event" />
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Jenis:</span>
                          <span className="text-slate-800 font-semibold">{ev.event_type}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Pelaksanaan:</span>
                          <span className="text-slate-800 font-semibold">{formatDateIndo(ev.start_date)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Estimasi Tamu:</span>
                          <span className="text-slate-800 font-semibold">{ev.estimated_guests ? `${ev.estimated_guests} Orang` : 'Belum ditentukan'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Venue:</span>
                          <span className="text-slate-800 font-semibold">{ev.venue?.name || 'Belum ditentukan'}</span>
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mt-2">
                          <strong className="text-slate-700">Deskripsi / Kebutuhan: </strong>
                          {ev.description}
                        </p>
                      )}

                      {ev.status === 'rejected' && ev.rejection_reason && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mt-2 flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-rose-900">Alasan Penolakan dari Event Manager:</p>
                            <p className="text-rose-700 mt-0.5">{ev.rejection_reason}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2 lg:pt-0 shrink-0">
                      <Link
                        href={`/dashboard/client/events/${ev.id}`}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 text-center transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Lihat Detail</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
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

