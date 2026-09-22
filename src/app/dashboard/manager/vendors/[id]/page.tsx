import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import StatusBadge from '@/components/ui/StatusBadge';
import VendorVerificationActions from '@/components/VendorVerificationActions';
import { formatDateTimeIndo, formatDateIndo } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManagerVendorDetailPage({ params }: PageProps) {
  const session = await requireAuth(['event_manager']);
  const resolvedParams = await params;
  const vendorProfileId = parseInt(resolvedParams.id, 10);

  if (isNaN(vendorProfileId)) {
    notFound();
  }

  const profile = await db.vendorProfile.findUnique({
    where: { id: vendorProfileId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      verifier: {
        select: {
          id: true,
          name: true,
        },
      },
      event_assignments: {
        include: {
          event: {
            include: {
              venue: true,
            },
          },
        },
        orderBy: { assigned_at: 'desc' },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <DashboardNavbar session={session} roleLabel="Event Manager" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard/manager" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/dashboard/manager/vendors" className="hover:text-indigo-600 transition-colors">
              Database Vendor
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{profile.company_name}</span>
          </div>

          <Link
            href="/dashboard/manager/vendors"
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Database Vendor</span>
          </Link>
        </div>

        {/* Verification Action Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {profile.service_category}
              </span>
              <StatusBadge status={profile.verification_status} type="verification" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{profile.company_name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Terdaftar sejak: {formatDateTimeIndo(profile.created_at)}
            </p>
          </div>

          <VendorVerificationActions
            vendorProfileId={profile.id}
            companyName={profile.company_name}
            currentStatus={profile.verification_status}
          />
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Business Info */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
              Informasi Kontak & PIC
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500">Nama Penanggung Jawab (PIC)</p>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">{profile.contact_person}</p>
              </div>

              <div>
                <p className="text-slate-500">Nomor Telepon / WhatsApp</p>
                <p className="font-mono font-medium text-slate-800 text-sm mt-0.5">{profile.phone}</p>
              </div>

              <div>
                <p className="text-slate-500">Email Akun Vendor</p>
                <p className="font-medium text-slate-800 mt-0.5">{profile.user.email}</p>
              </div>

              <div>
                <p className="text-slate-500">Alamat Workshop / Kantor</p>
                <p className="text-slate-800 mt-0.5">{profile.address || 'Belum diisi'}</p>
              </div>
            </div>
          </div>

          {/* Description & Verification History */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
              Deskripsi Layanan & Status
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500">Deskripsi Spesialisasi</p>
                <p className="text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                  {profile.description || 'Tidak ada deskripsi profil tambahan.'}
                </p>
              </div>

              {profile.verified_at && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-slate-500">Ditinjau Terakhir Oleh</p>
                  <p className="text-slate-800 font-medium mt-0.5">
                    {profile.verifier?.name || `Manager #${profile.verified_by}`} pada {formatDateTimeIndo(profile.verified_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Assignment History Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Riwayat Penugasan Event ({profile.event_assignments.length})
              </h2>
              <p className="text-xs text-slate-500">
                Daftar event di mana vendor ini telah ditugaskan oleh tim Event Organizer.
              </p>
            </div>
          </div>

          {profile.event_assignments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Vendor ini belum pernah ditugaskan pada event apa pun.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {profile.event_assignments.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Link
                      href={`/dashboard/manager/events/${item.event.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {item.event.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Peran: <strong className="text-slate-800 font-semibold">{item.job_title}</strong> • Tanggal: {formatDateIndo(item.event.start_date)}
                    </p>
                  </div>

                  <StatusBadge status={item.status} type="assignment" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

