'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVenue, updateVenue, VenueInput } from '@/lib/actions/venue';
import FeedbackAlert from './ui/FeedbackAlert';

interface VenueFormProps {
  initialData?: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number | null;
    facilities: string | null;
    contact_person: string | null;
    contact_phone: string | null;
  };
}

export default function VenueForm({ initialData }: VenueFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    capacity: initialData?.capacity ? String(initialData.capacity) : '',
    facilities: initialData?.facilities || '',
    contact_person: initialData?.contact_person || '',
    contact_phone: initialData?.contact_phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: VenueInput = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        facilities: formData.facilities || null,
        contact_person: formData.contact_person || null,
        contact_phone: formData.contact_phone || null,
      };

      let res;
      if (isEditing && initialData) {
        res = await updateVenue(initialData.id, payload);
      } else {
        res = await createVenue(payload);
      }

      if (!res.success) {
        setError(res.error || 'Terjadi kesalahan saat menyimpan data venue.');
        setLoading(false);
        return;
      }

      router.push('/dashboard/manager/venues');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <FeedbackAlert
          type="error"
          title={isEditing ? 'Gagal Memperbarui Venue' : 'Gagal Menambah Venue'}
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Gedung / Lokasi / Venue <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Contoh: Grand Ballroom Nusantara / Skyline Rooftop Hall"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kota / Wilayah <span className="text-rose-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            placeholder="Contoh: Jakarta Pusat / Bandung"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kapasitas Maksimal (Orang)
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            placeholder="Contoh: 1500"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Alamat Lengkap <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            placeholder="Contoh: Jl. Jend. Sudirman Kav. 21, Senayan, RT 01 / RW 02"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label htmlFor="contact_person" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Contact Person / Pengelola Venue
          </label>
          <input
            id="contact_person"
            name="contact_person"
            type="text"
            placeholder="Contoh: Bambang Irawan (Building Manager)"
            value={formData.contact_person}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contact_phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Telepon / WhatsApp Pengelola
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="text"
            placeholder="Contoh: 021-5558899 / 081234567890"
            value={formData.contact_phone}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Facilities */}
        <div className="md:col-span-2">
          <label htmlFor="facilities" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Fasilitas & Kelengkapan Venue
          </label>
          <textarea
            id="facilities"
            name="facilities"
            rows={4}
            placeholder="Contoh: Panggung hidrolik, AC Central, Sound 10.000W bawaan, Ruang VIP, Area Parkir 300 Mobil, Loading dock terpisah..."
            value={formData.facilities}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
        <Link
          href="/dashboard/manager/venues"
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center transition-all"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Menyimpan Data...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{isEditing ? 'Simpan Perubahan Venue' : 'Simpan Master Venue'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
