import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';
import VendorStatusUpdateControl from '@/components/VendorStatusUpdateControl';
import { formatDateIndo } from '@/lib/utils';

export default async function VendorDashboardPage() {
  const session = await requireAuth(['vendor']);

  // Ambil profil vendor milik user yang sedang login
  const profile = await db.vendorProfile.findUnique({
    where: { user_id: session.id },
  });

  // Ambil HANYA penugasan event yang diberikan ke vendor ini
  const myAssignments = profile
    ? await db.eventVendor.findMany({
        where: { vendor_id: profile.id },
        include: {
          event: {
            include: {
              venue: true,
            },
          },
        },
        orderBy: { assigned_at: 'desc' },
      })
    : [];

  const countTotal = myAssignments.length;
  const countAssigned = myAssignments.filter((a) => a.status === 'assigned' || a.status === 'accepted').length;
  const countInProgress = myAssignments.filter((a) => a.status === 'in_progress' || a.status === 'ready').length;
  const countCompleted = myAssignments.filter((a) => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <DashboardNavbar session={session} roleLabel="Vendor" />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/60 mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              {profile?.service_category || 'Mitra Vendor EO'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard Vendor
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Pantau penugasan dan perkembangan pekerjaan Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">Status Verifikasi:</span>
            {profile?.verification_status ? (
              <StatusBadge status={profile.verification_status} type="verification" />
            ) : (
              <span className="text-xs text-slate-400">Belum Terdaftar</span>
            )}
          </div>
        </div>

        {/* Verification Status Alerts */}
        {profile?.verification_status === 'verified' && (
          <FeedbackAlert
            type="success"
            title="Vendor Terverifikasi"
            message="Selamat! Profil usaha Anda telah diverifikasi oleh tim Event Manager. Anda siap menerima dan melaksanakan penugasan event."
          />
        )}

        {profile?.verification_status === 'pending' && (
          <FeedbackAlert
            type="warning"
            title="Akun Vendor Dalam Proses Verifikasi"
            message="Profil usaha Anda sedang ditinjau oleh tim Event Manager. Anda akan dapat menerima penugasan event setelah status verifikasi disetujui."
          />
        )}

        {profile?.verification_status === 'rejected' && (
          <FeedbackAlert
            type="error"
            title="Pendaftaran Vendor Ditolak"
            message="Pendaftaran akun vendor Anda belum dapat disetujui oleh Event Manager. Silakan hubungi tim EO jika terdapat data yang perlu diperbaiki."
          />
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Tugas"
            value={countTotal}
            color="indigo"
            subtitle="Semua event yang ditugaskan"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Diterima"
            value={countAssigned}
            color="blue"
            subtitle="Menunggu pelaksanaan hari-H"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Dalam Pengerjaan"
            value={countInProgress}
            color="amber"
            subtitle="Pengerjaan di lokasi / persiapan"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Selesai"
            value={countCompleted}
            color="emerald"
            subtitle="Tugas berhasil diselesaikan"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          />
        </div>

        {/* Assignments List Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Penugasan Event Saya ({myAssignments.length})</h2>
              <p className="text-xs text-slate-500">
                Data terisolasi secara aman hanya untuk akun vendor Anda.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              RBAC: Vendor Isolated
            </span>
          </div>

          {myAssignments.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="Belum Ada Penugasan Event"
                description="Event Manager akan menugaskan vendor Anda ketika ada kebutuhan event yang sesuai dengan kategori spesialisasi Anda."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAssignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-slate-50/70 transition-colors space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-base text-slate-900">
                          {assignment.event.title}
                        </h3>
                        <StatusBadge status={assignment.status} type="assignment" />
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Tugas: <strong className="text-slate-800 font-semibold">{assignment.job_title}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Pelaksanaan: <strong className="text-slate-800 font-semibold">{formatDateIndo(assignment.event.start_date)}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Venue: <strong className="text-slate-800 font-semibold">{assignment.event.venue?.name || 'TBA'}</strong>
                        </span>
                      </div>

                      {assignment.scope_of_work && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 line-clamp-2 mt-2">
                          <strong className="text-slate-700">Scope of Work: </strong>
                          {assignment.scope_of_work}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 lg:pt-0 shrink-0">
                      <VendorStatusUpdateControl
                        assignmentId={assignment.id}
                        currentStatus={assignment.status}
                      />

                      <Link
                        href={`/dashboard/vendor/assignments/${assignment.id}`}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 text-center transition-all flex items-center justify-center gap-1.5"
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

