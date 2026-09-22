import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import VenueForm from '@/components/VenueForm';

export default async function NewVenuePage() {
  const session = await requireAuth(['event_manager']);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Global SaaS Navigation */}
      <DashboardNavbar
        userName={session.name}
        userEmail={session.email}
        role="event_manager"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/dashboard/manager" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/manager/venues" className="hover:text-indigo-600 transition-colors">
            Master Venue
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Tambah Venue Baru</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Formulir Master Venue Baru</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Daftarkan lokasi, convention hall, hotel, atau gedung baru ke dalam database master venue rekanan.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <VenueForm />
          </div>
        </div>
      </main>
    </div>
  );
}
