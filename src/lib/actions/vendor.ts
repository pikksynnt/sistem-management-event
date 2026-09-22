'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ALLOWED_VENDOR_TRANSITIONS } from '@/lib/utils';

export type AssignVendorInput = {
  event_id: number;
  vendor_id: number; // VendorProfile.id
  job_title: string;
  scope_of_work?: string | null;
  notes?: string | null;
};

export type EventVendorStatus = 'assigned' | 'accepted' | 'in_progress' | 'ready' | 'completed';

export async function verifyVendor(vendorProfileId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang berhak memverifikasi vendor.' };
  }

  if (!vendorProfileId || typeof vendorProfileId !== 'number') {
    return { success: false, error: 'ID Profil Vendor tidak valid.' };
  }

  try {
    const existing = await db.vendorProfile.findUnique({
      where: { id: vendorProfileId },
    });

    if (!existing) {
      return { success: false, error: 'Profil vendor tidak ditemukan.' };
    }

    const updated = await db.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        verification_status: 'verified',
        verified_by: session.id,
        verified_at: new Date(),
      },
    });

    revalidatePath('/dashboard/manager/vendors');
    revalidatePath(`/dashboard/manager/vendors/${vendorProfileId}`);
    revalidatePath('/dashboard/manager');

    return { success: true, vendorProfile: updated };
  } catch (err: any) {
    console.error('Error verifying vendor:', err);
    return { success: false, error: 'Gagal memverifikasi vendor: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function rejectVendor(vendorProfileId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang berhak menolak pendaftaran vendor.' };
  }

  if (!vendorProfileId || typeof vendorProfileId !== 'number') {
    return { success: false, error: 'ID Profil Vendor tidak valid.' };
  }

  try {
    const existing = await db.vendorProfile.findUnique({
      where: { id: vendorProfileId },
    });

    if (!existing) {
      return { success: false, error: 'Profil vendor tidak ditemukan.' };
    }

    const updated = await db.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        verification_status: 'rejected',
        verified_by: session.id,
        verified_at: new Date(),
      },
    });

    revalidatePath('/dashboard/manager/vendors');
    revalidatePath(`/dashboard/manager/vendors/${vendorProfileId}`);
    revalidatePath('/dashboard/manager');

    return { success: true, vendorProfile: updated };
  } catch (err: any) {
    console.error('Error rejecting vendor:', err);
    return { success: false, error: 'Gagal menolak vendor: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function assignEventVendor(input: AssignVendorInput) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat menugaskan vendor ke event.' };
  }

  if (!input.event_id || typeof input.event_id !== 'number') {
    return { success: false, error: 'ID Event tidak valid.' };
  }

  if (!input.vendor_id || typeof input.vendor_id !== 'number') {
    return { success: false, error: 'Pilih vendor yang akan ditugaskan.' };
  }

  if (!input.job_title || input.job_title.trim().length < 2) {
    return { success: false, error: 'Judul tugas / Job Title minimal 2 karakter.' };
  }

  try {
    // 1. Verifikasi keberadaan event
    const event = await db.event.findUnique({
      where: { id: input.event_id },
    });

    if (!event) {
      return { success: false, error: 'Event tidak ditemukan.' };
    }

    // 2. Verifikasi status profil vendor: WAJIB VERIFIED
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { id: input.vendor_id },
    });

    if (!vendorProfile) {
      return { success: false, error: 'Profil vendor tidak ditemukan.' };
    }

    if (vendorProfile.verification_status !== 'verified') {
      return {
        success: false,
        error: `Vendor "${vendorProfile.company_name}" belum terverifikasi (status: ${vendorProfile.verification_status}). Hanya vendor berstatus "verified" yang dapat ditugaskan ke event.`,
      };
    }

    // 3. Buat penugasan baru dan catat initial audit log
    const assignment = await db.$transaction(async (tx) => {
      const created = await tx.eventVendor.create({
        data: {
          event_id: input.event_id,
          vendor_id: input.vendor_id,
          job_title: input.job_title.trim(),
          scope_of_work: input.scope_of_work?.trim() || null,
          notes: input.notes?.trim() || null,
          status: 'assigned',
          assigned_by: session.id,
        },
      });

      await tx.eventVendorLog.create({
        data: {
          event_vendor_id: created.id,
          previous_status: null,
          new_status: 'assigned',
          notes: 'Penugasan resmi diterbitkan oleh Event Manager.',
          updated_by: session.id,
        },
      });

      return created;
    });

    revalidatePath(`/dashboard/manager/events/${input.event_id}`);
    revalidatePath(`/dashboard/client/events/${input.event_id}`);
    revalidatePath('/dashboard/vendor');

    return { success: true, assignmentId: assignment.id };
  } catch (err: any) {
    console.error('Error assigning vendor:', err);
    return { success: false, error: 'Gagal menugaskan vendor: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function removeEventVendor(assignmentId: number, eventId: number) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (session.role !== 'event_manager') {
    return { success: false, error: 'Hanya Event Manager yang dapat menghapus penugasan vendor.' };
  }

  if (!assignmentId || typeof assignmentId !== 'number' || !eventId || typeof eventId !== 'number') {
    return { success: false, error: 'ID Penugasan atau Event tidak valid.' };
  }

  try {
    const existing = await db.eventVendor.findFirst({
      where: {
        id: assignmentId,
        event_id: eventId,
      },
    });

    if (!existing) {
      return { success: false, error: 'Data penugasan vendor tidak ditemukan pada event terkait.' };
    }

    await db.eventVendor.delete({
      where: { id: assignmentId },
    });

    revalidatePath(`/dashboard/manager/events/${eventId}`);
    revalidatePath(`/dashboard/client/events/${eventId}`);
    revalidatePath('/dashboard/vendor');

    return { success: true };
  } catch (err: any) {
    console.error('Error removing vendor assignment:', err);
    return { success: false, error: 'Gagal menghapus penugasan vendor: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function updateAssignmentStatus(input: {
  assignmentId: number;
  new_status: EventVendorStatus;
  notes?: string;
}) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (!input.assignmentId || typeof input.assignmentId !== 'number') {
    return { success: false, error: 'ID Penugasan tidak valid.' };
  }

  const validStatuses: EventVendorStatus[] = ['assigned', 'accepted', 'in_progress', 'ready', 'completed'];
  if (!validStatuses.includes(input.new_status)) {
    return { success: false, error: 'Status pekerjaan vendor tidak valid.' };
  }

  // Jika notes disertakan namun kurang dari 3 karakter (setelah trim)
  if (input.notes && input.notes.trim().length > 0 && input.notes.trim().length < 3) {
    return { success: false, error: 'Catatan progres minimal 3 karakter.' };
  }

  try {
    const assignment = await db.eventVendor.findUnique({
      where: { id: input.assignmentId },
      include: {
        vendor: true,
      },
    });

    if (!assignment) {
      return { success: false, error: 'Penugasan tidak ditemukan.' };
    }

    // Role & Ownership Security Check
    if (session.role === 'vendor') {
      if (assignment.vendor.user_id !== session.id) {
        return { success: false, error: 'Anda tidak memiliki otorisasi untuk mengubah penugasan vendor lain.' };
      }

      if (assignment.vendor.verification_status !== 'verified') {
        return { success: false, error: 'Hanya vendor berstatus terverifikasi (verified) yang dapat melakukan operasional penugasan.' };
      }
    } else if (session.role !== 'event_manager') {
      return { success: false, error: 'Role Anda tidak memiliki akses untuk mengubah status penugasan.' };
    }

    // Check terminal status
    if (assignment.status === 'completed') {
      return { success: false, error: 'Penugasan sudah selesai (completed) dan tidak dapat diubah lagi.' };
    }

    // Strict sequential transition check
    const currentStatus = assignment.status as EventVendorStatus;
    const allowed = ALLOWED_VENDOR_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(input.new_status)) {
      return {
        success: false,
        error: `Perubahan status tidak valid dari "${currentStatus}" ke "${input.new_status}". Status hanya dapat diubah secara berurutan: assigned → accepted → in_progress → ready → completed.`,
      };
    }

    const previousStatus = assignment.status;
    const trimmedNotes = input.notes?.trim();

    // Update assignment status dan simpan audit log
    const updated = await db.$transaction(async (tx) => {
      const up = await tx.eventVendor.update({
        where: { id: input.assignmentId },
        data: {
          status: input.new_status,
          notes: trimmedNotes || assignment.notes,
        },
      });

      await tx.eventVendorLog.create({
        data: {
          event_vendor_id: input.assignmentId,
          previous_status: previousStatus,
          new_status: input.new_status,
          notes: trimmedNotes || `Pembaruan status dari ${previousStatus} menjadi ${input.new_status}.`,
          updated_by: session.id,
        },
      });

      return up;
    });

    revalidatePath('/dashboard/vendor');
    revalidatePath(`/dashboard/vendor/assignments/${input.assignmentId}`);
    revalidatePath(`/dashboard/manager/events/${assignment.event_id}`);
    revalidatePath(`/dashboard/client/events/${assignment.event_id}`);

    return { success: true, assignment: updated };
  } catch (err: any) {
    console.error('Error updating assignment status:', err);
    return { success: false, error: 'Gagal memperbarui status: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}

export async function addAssignmentProgressNote(input: {
  assignmentId: number;
  notes: string;
}) {
  const session = await getSession();

  if (!session) {
    return { success: false, error: 'Sesi anda telah berakhir. Silakan login kembali.' };
  }

  if (!input.assignmentId || typeof input.assignmentId !== 'number') {
    return { success: false, error: 'ID Penugasan tidak valid.' };
  }

  if (!input.notes || typeof input.notes !== 'string' || input.notes.trim().length < 3) {
    return { success: false, error: 'Catatan progres wajib diisi minimal 3 karakter.' };
  }

  try {
    const assignment = await db.eventVendor.findUnique({
      where: { id: input.assignmentId },
      include: {
        vendor: true,
      },
    });

    if (!assignment) {
      return { success: false, error: 'Penugasan tidak ditemukan.' };
    }

    // Role & Ownership Security Check
    if (session.role === 'vendor') {
      if (assignment.vendor.user_id !== session.id) {
        return { success: false, error: 'Anda tidak memiliki otorisasi untuk menambahkan catatan pada penugasan vendor lain.' };
      }

      if (assignment.vendor.verification_status !== 'verified') {
        return { success: false, error: 'Hanya vendor berstatus terverifikasi (verified) yang dapat melakukan operasional penugasan.' };
      }
    } else if (session.role !== 'event_manager') {
      return { success: false, error: 'Role Anda tidak memiliki akses untuk menambahkan catatan progres.' };
    }

    const trimmedNotes = input.notes.trim();

    // Catat progress note ke EventVendor.notes dan buat EventVendorLog entry
    const result = await db.$transaction(async (tx) => {
      const updatedVendor = await tx.eventVendor.update({
        where: { id: input.assignmentId },
        data: {
          notes: trimmedNotes,
        },
      });

      const log = await tx.eventVendorLog.create({
        data: {
          event_vendor_id: input.assignmentId,
          previous_status: assignment.status,
          new_status: assignment.status,
          notes: trimmedNotes,
          updated_by: session.id,
        },
      });

      return { updatedVendor, log };
    });

    revalidatePath('/dashboard/vendor');
    revalidatePath(`/dashboard/vendor/assignments/${input.assignmentId}`);
    revalidatePath(`/dashboard/manager/events/${assignment.event_id}`);
    revalidatePath(`/dashboard/client/events/${assignment.event_id}`);

    return { success: true, log: result.log };
  } catch (err: any) {
    console.error('Error adding assignment progress note:', err);
    return { success: false, error: 'Gagal menambahkan catatan progres: ' + (err.message || 'Terjadi kesalahan sistem') };
  }
}
