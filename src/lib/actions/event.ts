'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export type CreateEventInput = {
  title: string;
  event_type: string;
  description?: string;
  start_date: string;
  end_date: string;
  estimated_guests?: number;
};

export async function createEvent(input: CreateEventInput) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'client') {
    return { success: false, error: 'Hanya Client yang dapat mengajukan event.' };
  }

  // Validasi title
  if (!input.title || input.title.trim().length < 3) {
    return { success: false, error: 'Nama/Judul event minimal 3 karakter.' };
  }

  // Validasi event_type
  if (!input.event_type || input.event_type.trim().length === 0) {
    return { success: false, error: 'Pilih jenis event.' };
  }

  // Validasi start_date dan end_date
  if (!input.start_date || !input.end_date) {
    return { success: false, error: 'Tanggal mulai dan selesai harus diisi.' };
  }

  const startDate = new Date(input.start_date);
  const endDate = new Date(input.end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { success: false, error: 'Format tanggal tidak valid.' };
  }

  if (endDate < startDate) {
    return { success: false, error: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' };
  }

  // Validasi estimated_guests jika ada
  let guests: number | null = null;
  if (input.estimated_guests !== undefined && input.estimated_guests !== null && !isNaN(Number(input.estimated_guests))) {
    guests = Math.max(1, Math.floor(Number(input.estimated_guests)));
  }

  try {
    const event = await db.event.create({
      data: {
        client_id: session.id,
        title: input.title.trim(),
        event_type: input.event_type.trim(),
        description: input.description?.trim() || null,
        start_date: startDate,
        end_date: endDate,
        estimated_guests: guests,
        status: 'submitted',
      },
    });

    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/manager');

    return { success: true, eventId: event.id };
  } catch (err: any) {
    console.error('Error creating event:', err);
    return { success: false, error: 'Gagal membuat pengajuan event: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function approveEvent(eventId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang memiliki otoritas untuk menyetujui event.' };
  }

  if (!eventId || typeof eventId !== 'number') {
    return { success: false, error: 'ID Event tidak valid.' };
  }

  try {
    const existing = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return { success: false, error: 'Event tidak ditemukan.' };
    }

    if (existing.status !== 'submitted') {
      return { success: false, error: `Event sudah berstatus "${existing.status}", tidak dapat diproses lagi.` };
    }

    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        status: 'approved',
        approved_by: session.id,
        approved_at: new Date(),
        rejection_reason: null,
      },
    });

    revalidatePath('/dashboard/manager');
    revalidatePath('/dashboard/client');
    revalidatePath(`/dashboard/manager/events/${eventId}`);
    revalidatePath(`/dashboard/client/events/${eventId}`);

    return { success: true, event: updated };
  } catch (err: any) {
    console.error('Error approving event:', err);
    return { success: false, error: 'Gagal menyetujui event: ' + (err.message || 'Terjadi kesalahan server') };
  }
}

export async function rejectEvent(eventId: number, reason: string) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang memiliki otoritas untuk menolak event.' };
  }

  if (!eventId || typeof eventId !== 'number') {
    return { success: false, error: 'ID Event tidak valid.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'Alasan penolakan wajib diisi (minimal 5 karakter).' };
  }

  try {
    const existing = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return { success: false, error: 'Event tidak ditemukan.' };
    }

    if (existing.status !== 'submitted') {
      return { success: false, error: `Event sudah berstatus "${existing.status}", tidak dapat diproses lagi.` };
    }

    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        status: 'rejected',
        rejection_reason: reason.trim(),
        approved_by: session.id,
        approved_at: new Date(),
      },
    });

    revalidatePath('/dashboard/manager');
    revalidatePath('/dashboard/client');
    revalidatePath(`/dashboard/manager/events/${eventId}`);
    revalidatePath(`/dashboard/client/events/${eventId}`);

    return { success: true, event: updated };
  } catch (err: any) {
    console.error('Error rejecting event:', err);
    return { success: false, error: 'Gagal menolak event: ' + (err.message || 'Terjadi kesalahan server') };
  }
}
