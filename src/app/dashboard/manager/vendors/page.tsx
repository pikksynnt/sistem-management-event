import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import VendorVerificationActions from '@/components/VendorVerificationActions';

interface PageProps {
  searchParams?: Promise<{ status?: string; category?: string }>;
}

export default async function ManagerVendorsPage({ searchParams }: PageProps) {
  const session = await requireAuth(['event_manager']);
  const resolvedParams = searchParams ? await searchParams : {};
  const currentStatus = resolvedParams.status;
  const currentCategory = resolvedParams.category;

  // Counts for overview
  const totalVendors = await db.vendorProfile.count();
  const countPending = await db.vendorProfile.count({ where: { verification_status: 'pending' } });
  const countVerified = await db.vendorProfile.count({ where: { verification_status: 'verified' } });
  const countRejected = await db.vendorProfile.count({ where: { verification_status: 'rejected' } });

  // Query where clause
  const whereClause: any = {};
  if (currentStatus && currentStatus !== 'all') {
    whereClause.verification_status = currentStatus;
  }
  if (currentCategory && currentCategory !== 'all') {
    whereClause.service_category = {
      contains: currentCategory,
    };
  }

  const vendors = await db.vendorProfile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event_assignments: {
        select: {
          id: true,
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: [
      { created_at: 'desc' },
    ],
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Global SaaS Navigation */}
      <DashboardNavbar
        userName={session.name}
        userEmail={session.email}
        role="event_manager"
      />

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/dashboard/manager" className="hover:text-indigo-600 transition-colors">
              Dashboard Manager
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Database Vendor</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/60 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              Supporting Feature for Event Assignment
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Database Mitra Vendor</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kelola verifikasi vendor rekanan dan siapkan mitra terpercaya untuk penugasan pada berbagai event.
            </p>
          </div>

          {countPending > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                {countPending}
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Perlu Verifikasi</p>
                <p className="text-xs text-amber-700">{countPending} vendor baru menunggu review Anda</p>
              </div>
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Terdaftar"
            value={totalVendors}
            description="Semua vendor di sistem"
            variant={!currentStatus || currentStatus === 'all' ? 'primary' : 'default'}
            href="/dashboard/manager/vendors"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <StatCard
            label="Menunggu Verifikasi"
            value={countPending}
            description="Perlu ditinjau Event Manager"
            variant="warning"
            href="/dashboard/manager/vendors?status=pending"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            label="Terverifikasi (Aktif)"
            value={countVerified}
            description="Siap penugasan event"
            variant="success"
            href="/dashboard/manager/vendors?status=verified"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            label="Ditolak"
            value={countRejected}
            description="Pendaftaran ditolak"
            variant="danger"
            href="/dashboard/manager/vendors?status=rejected"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Vendors Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Vendor ({vendors.length})</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hanya vendor berstatus Terverifikasi yang dapat dipilih saat penugasan event.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/manager/vendors"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  !currentStatus || currentStatus === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({totalVendors})
              </Link>
              <Link
                href="/dashboard/manager/vendors?status=pending"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStatus === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({countPending})
              </Link>
              <Link
                href="/dashboard/manager/vendors?status=verified"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStatus === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Verified ({countVerified})
              </Link>
              <Link
                href="/dashboard/manager/vendors?status=rejected"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentStatus === 'rejected'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rejected ({countRejected})
              </Link>
            </div>
          </div>

          {/* Table */}
          {vendors.length === 0 ? (
            <EmptyState
              title="Tidak Ada Data Vendor"
              description="Tidak ada data vendor dengan filter yang dipilih saat ini."
              actionLabel="Reset Filter"
              actionHref="/dashboard/manager/vendors"
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-3.5">Perusahaan / Brand</th>
                      <th className="px-6 py-3.5">Kategori Layanan</th>
                      <th className="px-6 py-3.5">Kontak PIC</th>
                      <th className="px-6 py-3.5">Status Verifikasi</th>
                      <th className="px-6 py-3.5">Event Ditugaskan</th>
                      <th className="px-6 py-3.5 text-right">Aksi & Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendors.map((v) => {
                      const assignmentCount = v.event_assignments.length;

                      return (
                        <tr
                          key={v.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            v.verification_status === 'pending' ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{v.company_name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{v.address || 'Alamat belum diisi'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                              {v.service_category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="font-medium text-slate-800">{v.contact_person}</div>
                            <div className="text-slate-500 font-mono mt-0.5">{v.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={v.verification_status} type="verification" />
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {assignmentCount > 0 ? (
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                                {assignmentCount} Event
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">0 Event</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/manager/vendors/${v.id}`}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shadow-xs"
                              >
                                Detail
                              </Link>

                              <VendorVerificationActions
                                vendorProfileId={v.id}
                                companyName={v.company_name}
                                currentStatus={v.verification_status}
                              />
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
                {vendors.map((v) => {
                  const assignmentCount = v.event_assignments.length;
                  return (
                    <div
                      key={v.id}
                      className={`p-4 rounded-xl border border-slate-200/80 space-y-3 ${
                        v.verification_status === 'pending' ? 'bg-amber-50/30' : 'bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{v.company_name}</h3>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            {v.service_category}
                          </span>
                        </div>
                        <StatusBadge status={v.verification_status} type="verification" />
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>PIC: <span className="font-medium text-slate-800">{v.contact_person}</span> • <span className="font-mono">{v.phone}</span></p>
                        <p className="text-slate-500">Penugasan: <span className="font-semibold text-slate-700">{assignmentCount} Event</span></p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                        <Link
                          href={`/dashboard/manager/vendors/${v.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs"
                        >
                          Lihat Detail
                        </Link>

                        <VendorVerificationActions
                          vendorProfileId={v.id}
                          companyName={v.company_name}
                          currentStatus={v.verification_status}
                        />
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
