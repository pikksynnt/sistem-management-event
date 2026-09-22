'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export type VenueInput = {
  name: string;
  address: string;
  city: string;
  capacity?: number | null;
  facilities?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
};

export async function createVenue(input: VenueInput) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang memiliki akses untuk menambah venue.' };
  }

  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Nama venue minimal 3 karakter.' };
  }

  if (!input.address || input.address.trim().length < 5) {
    return { success: false, error: 'Alamat venue minimal 5 karakter.' };
  }

  if (!input.city || input.city.trim().length < 2) {
    return { success: false, error: 'Kota venue wajib diisi.' };
  }

  let capacityNum: number | null = null;
  if (input.capacity !== undefined && input.capacity !== null && !isNaN(Number(input.capacity))) {
    capacityNum = Math.max(1, Math.floor(Number(input.capacity)));
  }

  try {
    const venue = await db.venue.create({
      data: {
        name: input.name.trim(),
        address: input.address.trim(),
        city: input.city.trim(),
        capacity: capacityNum,
        facilities: input.facilities?.trim() || null,
        contact_person: input.contact_person?.trim() || null,
        contact_phone: input.contact_phone?.trim() || null,
      },
    });

    revalidatePath('/dashboard/manager/venues');
    revalidatePath('/dashboard/manager');

    return { success: true, venueId: venue.id };
  } catch (err: any) {
    console.error('Error creating venue:', err);
    return { success: false, error: 'Gagal membuat venue: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function updateVenue(id: number, input: VenueInput) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang memiliki akses untuk mengubah data venue.' };
  }

  if (!id || typeof id !== 'number') {
    return { success: false, error: 'ID Venue tidak valid.' };
  }

  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Nama venue minimal 3 karakter.' };
  }

  if (!input.address || input.address.trim().length < 5) {
    return { success: false, error: 'Alamat venue minimal 5 karakter.' };
  }

  if (!input.city || input.city.trim().length < 2) {
    return { success: false, error: 'Kota venue wajib diisi.' };
  }

  let capacityNum: number | null = null;
  if (input.capacity !== undefined && input.capacity !== null && !isNaN(Number(input.capacity))) {
    capacityNum = Math.max(1, Math.floor(Number(input.capacity)));
  }

  try {
    const existing = await db.venue.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Venue tidak ditemukan.' };
    }

    const updated = await db.venue.update({
      where: { id },
      data: {
        name: input.name.trim(),
        address: input.address.trim(),
        city: input.city.trim(),
        capacity: capacityNum,
        facilities: input.facilities?.trim() || null,
        contact_person: input.contact_person?.trim() || null,
        contact_phone: input.contact_phone?.trim() || null,
      },
    });

    revalidatePath('/dashboard/manager/venues');
    revalidatePath(`/dashboard/manager/venues/${id}/edit`);
    revalidatePath('/dashboard/manager');

    return { success: true, venue: updated };
  } catch (err: any) {
    console.error('Error updating venue:', err);
    return { success: false, error: 'Gagal mengubah venue: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function deleteVenue(id: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang memiliki akses untuk menghapus venue.' };
  }

  if (!id || typeof id !== 'number') {
    return { success: false, error: 'ID Venue tidak valid.' };
  }

  try {
    const existing = await db.venue.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Venue tidak ditemukan.' };
    }

    // Safety check: Periksa apakah venue sedang digunakan oleh event mana pun di database
    const eventsUsingVenue = await db.event.count({
      where: { venue_id: id },
    });

    if (eventsUsingVenue > 0) {
      return {
        success: false,
        error: 'Venue tidak dapat dihapus karena masih digunakan oleh event.',
      };
    }

    await db.venue.delete({
      where: { id },
    });

    revalidatePath('/dashboard/manager/venues');
    revalidatePath('/dashboard/manager');

    return { success: true };
  } catch (err: any) {
    console.error('Error deleting venue:', err);
    return { success: false, error: 'Gagal menghapus venue: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function assignEventVenue(eventId: number, venueId: number | null) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat menentukan atau mengubah venue event.' };
  }

  if (!eventId || typeof eventId !== 'number') {
    return { success: false, error: 'ID Event tidak valid.' };
  }

  try {
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return { success: false, error: 'Event tidak ditemukan.' };
    }

    if (venueId !== null) {
      const existingVenue = await db.venue.findUnique({
        where: { id: venueId },
      });

      if (!existingVenue) {
        return { success: false, error: 'Venue yang dipilih tidak ditemukan di sistem.' };
      }
    }

    // Update venue_id TANPA mengubah status event (mempertahankan status existing)
    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        venue_id: venueId,
      },
    });

    revalidatePath(`/dashboard/manager/events/${eventId}`);
    revalidatePath(`/dashboard/client/events/${eventId}`);
    revalidatePath('/dashboard/manager');
    revalidatePath('/dashboard/client');

    return { success: true, event: updated };
  } catch (err: any) {
    console.error('Error assigning venue:', err);
    return { success: false, error: 'Gagal menentukan venue: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}
