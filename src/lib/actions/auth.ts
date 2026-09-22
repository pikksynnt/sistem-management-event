'use server';

import { db } from '@/lib/db';
import { setSessionCookie, clearSessionCookie, getRoleDashboardPath, UserRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export interface ActionResponse {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Validasi format email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Server Action: Login
 */
export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Format email tidak valid.' };
  }

  if (!password) {
    return { success: false, error: 'Password wajib diisi.' };
  }

  // Cari user berdasarkan email
  const user = await db.user.findUnique({
    where: { email },
    include: { vendor_profile: true },
  });

  // Jika user tidak ada atau password tidak cocok, berikan pesan generik demi keamanan
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { success: false, error: 'Email atau password salah.' };
  }

  // Buat session cookie aman
  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    phone: user.phone,
    vendorProfileId: user.vendor_profile?.id ?? null,
  });

  return {
    success: true,
    redirectTo: getRoleDashboardPath(user.role as UserRole),
  };
}

/**
 * Server Action: Registrasi Klien
 */
export async function registerClientAction(formData: FormData): Promise<ActionResponse> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const phone = (formData.get('phone') as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { success: false, error: 'Nama lengkap minimal 2 karakter.' };
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Alamat email tidak valid.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }

  // Cek apakah email sudah terdaftar
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
  }

  // Hash password
  const password_hash = bcrypt.hashSync(password, 10);

  // Buat user dengan role client
  const newUser = await db.user.create({
    data: {
      name,
      email,
      password_hash,
      role: 'client',
      phone,
    },
  });

  // Otomatis login setelah registrasi
  await setSessionCookie({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: 'client',
    phone: newUser.phone,
  });

  return {
    success: true,
    redirectTo: '/dashboard/client',
  };
}

/**
 * Server Action: Registrasi Vendor
 */
export async function registerVendorAction(formData: FormData): Promise<ActionResponse> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const phone = (formData.get('phone') as string)?.trim() || '';

  const company_name = (formData.get('company_name') as string)?.trim();
  const service_category = (formData.get('service_category') as string)?.trim();
  const contact_person = (formData.get('contact_person') as string)?.trim() || name;
  const vendor_phone = (formData.get('vendor_phone') as string)?.trim() || phone;
  const address = (formData.get('address') as string)?.trim() || null;
  const description = (formData.get('description') as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { success: false, error: 'Nama penanggung jawab minimal 2 karakter.' };
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Alamat email tidak valid.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter.' };
  }

  if (!company_name || company_name.length < 2) {
    return { success: false, error: 'Nama perusahaan / usaha vendor minimal 2 karakter.' };
  }

  if (!service_category) {
    return { success: false, error: 'Kategori layanan wajib dipilih.' };
  }

  if (!vendor_phone) {
    return { success: false, error: 'Nomor telepon vendor wajib diisi.' };
  }

  // Cek apakah email sudah terdaftar
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
  }

  // Hash password
  const password_hash = bcrypt.hashSync(password, 10);

  // Buat user vendor dan vendor_profile dalam satu transaksi database
  const { user, profile } = await db.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password_hash,
        role: 'vendor',
        phone,
      },
    });

    const newProfile = await tx.vendorProfile.create({
      data: {
        user_id: newUser.id,
        company_name,
        service_category,
        contact_person,
        phone: vendor_phone,
        address,
        description,
        verification_status: 'pending',
        verified_at: null,
        verified_by: null,
      },
    });

    return { user: newUser, profile: newProfile };
  });

  // Otomatis login setelah registrasi
  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'vendor',
    phone: user.phone,
    vendorProfileId: profile.id,
  });

  return {
    success: true,
    redirectTo: '/dashboard/vendor',
  };
}

/**
 * Server Action: Logout
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
