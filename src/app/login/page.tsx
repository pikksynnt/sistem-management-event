'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan.');
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  };

  const fillCredential = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl shadow-md shadow-indigo-600/20">
            SEM
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sistem Event Management
          </h1>
          <p className="text-xs text-slate-500">
            Masuk ke portal koordinasi event dan mitra operasional
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <FeedbackAlert
            type="error"
            title="Gagal Masuk"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? 'Memproses Masuk...' : 'Masuk ke Akun'}
          </button>
        </form>

        {/* Quick Testing Seed Accounts */}
        <div className="pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            Akun Demo Cepat (Password: password123)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillCredential('manager@eo.com')}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center cursor-pointer truncate"
              title="manager@eo.com"
            >
              Event Manager
            </button>
            <button
              type="button"
              onClick={() => fillCredential('sound@vendor.com')}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center cursor-pointer truncate"
              title="sound@vendor.com"
            >
              Mitra Vendor
            </button>
            <button
              type="button"
              onClick={() => fillCredential('klien.hendra@gmail.com')}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center cursor-pointer truncate"
              title="klien.hendra@gmail.com"
            >
              Klien (Hendra)
            </button>
          </div>
        </div>

        {/* Register Navigation */}
        <div className="text-center text-xs text-slate-500">
          Belum memiliki akun?{' '}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
