'use client';

import { useState } from 'react';
import VenueSelectorModal from './VenueSelectorModal';

interface VenueData {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number | null;
  facilities: string | null;
  contact_person: string | null;
  contact_phone: string | null;
}

interface VenueOption {
  id: number;
  name: string;
  city: string;
  capacity: number | null;
  address: string;
}

interface VenueSectionManagerProps {
  eventId: number;
  eventTitle: string;
  currentVenue: VenueData | null;
  availableVenues: VenueOption[];
}

export default function VenueSectionManager({
  eventId,
  eventTitle,
  currentVenue,
  availableVenues,
}: VenueSectionManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Lokasi & Venue Pelaksanaan</span>
              {currentVenue ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Venue Terpilih
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Belum Ditentukan
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan gedung atau lokasi tempat berlangsungnya event dari master venue.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{currentVenue ? 'Ubah Venue' : 'Pilih Venue'}</span>
          </button>
        </div>

        {/* Venue Information or Empty State */}
        {currentVenue ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{currentVenue.name}</h4>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{currentVenue.address}, <strong>{currentVenue.city}</strong></span>
                </p>
              </div>
              {currentVenue.capacity && (
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                  Kapasitas: {currentVenue.capacity.toLocaleString('id-ID')} Orang
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Kontak Pengelola Venue
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {currentVenue.contact_person || 'Tidak ada PIC tercatat'}
                </p>
                {currentVenue.contact_phone && (
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {currentVenue.contact_phone}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Fasilitas & Sarana Gedung
                </p>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {currentVenue.facilities || 'Fasilitas standar gedung'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">Venue Belum Ditentukan</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-3.5 max-w-sm mx-auto">
              Pilih lokasi atau ballroom dari database master venue untuk event ini.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Pilih Venue Sekarang</span>
            </button>
          </div>
        )}
      </div>

      <VenueSelectorModal
        eventId={eventId}
        eventTitle={eventTitle}
        currentVenueId={currentVenue?.id || null}
        availableVenues={availableVenues}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
