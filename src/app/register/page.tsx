'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerClientAction, registerVendorAction } from '@/lib/actions/auth';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

export default function RegisterPage() {
  const router = useRouter();
  const [roleType, setRoleType] = useState<'client' | 'vendor'>('client');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // State untuk Client
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // State untuk Vendor
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Sound System & Lighting');
  const [contactPerson, setContactPerson] = useState('');
  const [vendorContactPhone, setVendorContactPhone] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorDescription, setVendorDescription] = useState('');

  const handleClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('name', clientName);
    formData.append('email', clientEmail);
    formData.append('password', clientPassword);
    formData.append('phone', clientPhone);

    startTransition(async () => {
      const res = await registerClientAction(formData);
      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat pendaftaran.');
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  };

  const handleVendorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('name', vendorName);
    formData.append('email', vendorEmail);
    formData.append('password', vendorPassword);
    formData.append('phone', vendorPhone);
    formData.append('company_name', companyName);
    formData.append('service_category', serviceCategory);
    formData.append('contact_person', contactPerson || vendorName);
    formData.append('vendor_phone', vendorContactPhone || vendorPhone);
    formData.append('address', vendorAddress);
    formData.append('description', vendorDescription);

    startTransition(async () => {
      const res = await registerVendorAction(formData);
      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat pendaftaran vendor.');
      } else if (res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl shadow-md shadow-indigo-600/20">
            SEM
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pendaftaran Akun Baru
          </h1>
          <p className="text-xs text-slate-500">
            Pilih jenis akun yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setRoleType('client');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              roleType === 'client'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar sebagai Klien
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleType('vendor');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              roleType === 'vendor'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar sebagai Mitra Vendor
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <FeedbackAlert
            type="error"
            title="Pendaftaran Gagal"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Form Client */}
        {roleType === 'client' && (
          <form onSubmit={handleClientSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Nama Lengkap / Instansi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="cth: Hendra Pratama (PT Maju Jaya)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cth: klien@perusahaan.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi (Min. 6 Karakter) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="cth: 08123456789"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isPending ? 'Mendaftarkan...' : 'Daftar sebagai Klien'}
              </button>
            </div>
          </form>
        )}

        {/* Form Vendor */}
        {roleType === 'vendor' && (
          <form onSubmit={handleVendorSubmit} className="space-y-4">
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 leading-relaxed">
              ℹ️ Pendaftaran vendor akan langsung membuat profil vendor dengan status <strong>Pending Verification</strong> yang akan ditinjau oleh Event Manager.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Penanggung Jawab (PIC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="cth: Joko Purnomo"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Perusahaan / Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="cth: Mega Sound Pro"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Alamat Email (Login) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  placeholder="vendor@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi (Min. 6 Karakter) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={vendorPassword}
                  onChange={(e) => setVendorPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kategori Layanan Utama <span className="text-rose-500">*</span>
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                >
                  <option value="Sound System & Lighting">Sound System & Lighting</option>
                  <option value="Catering & Konsumsi">Catering & Konsumsi</option>
                  <option value="Dekorasi & Backdrop">Dekorasi & Backdrop</option>
                  <option value="Dokumentasi & Live Streaming">Dokumentasi & Live Streaming</option>
                  <option value="Stage, Truss & Rigging">Stage, Truss & Rigging</option>
                  <option value="Talent, MC & Entertainment">Talent, MC & Entertainment</option>
                  <option value="Multimedia, LED & Projector">Multimedia, LED & Projector</option>
                  <option value="Keamanan & Hospitality">Keamanan & Hospitality</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor Telepon Vendor / Kantor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={vendorContactPhone}
                  onChange={(e) => setVendorContactPhone(e.target.value)}
                  placeholder="cth: 081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat Kantor / Workshop
              </label>
              <input
                type="text"
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                placeholder="cth: Jl. Industri Kreatif No. 12, Jakarta"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Deskripsi Singkat Keahlian / Peralatan
              </label>
              <textarea
                rows={2}
                value={vendorDescription}
                onChange={(e) => setVendorDescription(e.target.value)}
                placeholder="cth: Kapasitas sound system hingga 40k watt, moving head, kru teknis berpengalaman..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isPending ? 'Mendaftarkan Vendor...' : 'Daftar sebagai Vendor'}
              </button>
            </div>
          </form>
        )}

        {/* Login Navigation */}
        <div className="text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
