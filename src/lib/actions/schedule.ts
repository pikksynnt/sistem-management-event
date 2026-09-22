'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export type ScheduleInput = {
  event_id: number;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  pic_name?: string | null;
  order_index?: number | null;
};

export async function createEventSchedule(input: ScheduleInput) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat menambahkan item rundown.' };
  }

  if (!input.event_id || typeof input.event_id !== 'number') {
    return { success: false, error: 'ID Event tidak valid.' };
  }

  if (!input.title || input.title.trim().length < 2) {
    return { success: false, error: 'Judul kegiatan minimal 2 karakter.' };
  }

  if (!input.start_time || !input.end_time) {
    return { success: false, error: 'Waktu mulai dan selesai wajib diisi.' };
  }

  const startTime = new Date(input.start_time);
  const endTime = new Date(input.end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return { success: false, error: 'Format waktu tidak valid.' };
  }

  if (endTime < startTime) {
    return { success: false, error: 'Waktu selesai tidak boleh lebih awal dari waktu mulai.' };
  }

  try {
    const event = await db.event.findUnique({
      where: { id: input.event_id },
    });

    if (!event) {
      return { success: false, error: 'Event tidak ditemukan.' };
    }

    // Hitung order_index otomatis jika tidak diberikan
    let orderIndex = input.order_index;
    if (orderIndex === undefined || orderIndex === null || isNaN(Number(orderIndex))) {
      const lastSchedule = await db.eventSchedule.findFirst({
        where: { event_id: input.event_id },
        orderBy: { order_index: 'desc' },
      });
      orderIndex = (lastSchedule?.order_index ?? 0) + 1;
    }

    const schedule = await db.eventSchedule.create({
      data: {
        event_id: input.event_id,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        start_time: startTime,
        end_time: endTime,
        pic_name: input.pic_name?.trim() || null,
        order_index: Number(orderIndex),
      },
    });

    revalidatePath(`/dashboard/manager/events/${input.event_id}`);
    revalidatePath(`/dashboard/client/events/${input.event_id}`);

    return { success: true, scheduleId: schedule.id };
  } catch (err: any) {
    console.error('Error creating schedule:', err);
    return { success: false, error: 'Gagal membuat item rundown: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function updateEventSchedule(id: number, input: Omit<ScheduleInput, 'event_id'>) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat mengubah item rundown.' };
  }

  if (!id || typeof id !== 'number') {
    return { success: false, error: 'ID Rundown tidak valid.' };
  }

  if (!input.title || input.title.trim().length < 2) {
    return { success: false, error: 'Judul kegiatan minimal 2 karakter.' };
  }

  if (!input.start_time || !input.end_time) {
    return { success: false, error: 'Waktu mulai dan selesai wajib diisi.' };
  }

  const startTime = new Date(input.start_time);
  const endTime = new Date(input.end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return { success: false, error: 'Format waktu tidak valid.' };
  }

  if (endTime < startTime) {
    return { success: false, error: 'Waktu selesai tidak boleh lebih awal dari waktu mulai.' };
  }

  try {
    const existing = await db.eventSchedule.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Item rundown tidak ditemukan.' };
    }

    const updated = await db.eventSchedule.update({
      where: { id },
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        start_time: startTime,
        end_time: endTime,
        pic_name: input.pic_name?.trim() || null,
        order_index: input.order_index !== undefined && input.order_index !== null ? Number(input.order_index) : existing.order_index,
      },
    });

    revalidatePath(`/dashboard/manager/events/${existing.event_id}`);
    revalidatePath(`/dashboard/client/events/${existing.event_id}`);

    return { success: true, schedule: updated };
  } catch (err: any) {
    console.error('Error updating schedule:', err);
    return { success: false, error: 'Gagal mengubah item rundown: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function deleteEventSchedule(id: number, eventId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat menghapus item rundown.' };
  }

  if (!id || typeof id !== 'number' || !eventId || typeof eventId !== 'number') {
    return { success: false, error: 'ID Rundown atau ID Event tidak valid.' };
  }

  try {
    // Verifikasi kepemilikan dan relasi event schedule
    const existing = await db.eventSchedule.findFirst({
      where: {
        id,
        event_id: eventId,
      },
    });

    if (!existing) {
      return { success: false, error: 'Item rundown tidak ditemukan pada event terkait.' };
    }

    await db.eventSchedule.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/manager/events/${eventId}`);
    revalidatePath(`/dashboard/client/events/${eventId}`);

    return { success: true };
  } catch (err: any) {
    console.error('Error deleting schedule:', err);
    return { success: false, error: 'Gagal menghapus item rundown: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function reorderEventSchedules(eventId: number, scheduleIds: number[]) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat mengatur urutan rundown.' };
  }

  if (!eventId || !Array.isArray(scheduleIds)) {
    return { success: false, error: 'Parameter reorder tidak valid.' };
  }

  try {
    // Update order_index masing-masing item sesuai urutan index
    await db.$transaction(
      scheduleIds.map((id, index) =>
        db.eventSchedule.updateMany({
          where: { id, event_id: eventId },
          data: { order_index: index + 1 },
        })
      )
    );

    revalidatePath(`/dashboard/manager/events/${eventId}`);
    revalidatePath(`/dashboard/client/events/${eventId}`);

    return { success: true };
  } catch (err: any) {
    console.error('Error reordering schedules:', err);
    return { success: false, error: 'Gagal mengubah urutan rundown: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}
