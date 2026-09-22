import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import DashboardNavbar from '@/components/ui/DashboardNavbar';
import EventForm from '@/components/EventForm';

export default async function NewClientEventPage() {
  const session = await requireAuth(['client']);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <DashboardNavbar session={session} roleLabel="Klien" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/dashboard/client" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Ajukan Event Baru</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ajukan Event Baru</h1>
            <p className="text-xs text-slate-500 mt-1">
              Isi informasi dasar event yang Anda rencanakan. Event Manager kami akan meninjau dan mengonfirmasi ketersediaan jadwal serta kebutuhan teknis.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <EventForm />
          </div>
        </div>
      </main>
    </div>
  );
}

