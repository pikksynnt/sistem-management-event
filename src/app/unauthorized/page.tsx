import Link from 'next/link';
import { getSession, getRoleDashboardPath } from '@/lib/auth';

export default async function UnauthorizedPage() {
  const session = await getSession();
  const backUrl = session ? getRoleDashboardPath(session.role) : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold border border-amber-200">
          ⚠️
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Akses Ditolak (403)</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda tidak memiliki izin otorisasi untuk membuka halaman ini. Hak akses dibatasi ketat berdasarkan role akun Anda.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href={backUrl}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            Kembali ke Dashboard Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
