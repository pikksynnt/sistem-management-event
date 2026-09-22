import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type UserRole = 'event_manager' | 'vendor' | 'client';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  vendorProfileId?: number | null;
}

const COOKIE_NAME = 'session_token';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'sistem-event-management-super-secret-key-2026-secure-token'
);

/**
 * Buat JWT Session Token menggunakan jose
 */
export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone ?? null,
    vendorProfileId: user.vendorProfileId ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verifikasi JWT Token
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as UserRole,
      phone: payload.phone ? String(payload.phone) : null,
      vendorProfileId: payload.vendorProfileId ? Number(payload.vendorProfileId) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Set HTTP-Only Session Cookie
 */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  });
}

/**
 * Ambil data session user dari cookie saat ini
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * Hapus session cookie (Logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Helper untuk mendapatkan rute dashboard sesuai role
 */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'event_manager':
      return '/dashboard/manager';
    case 'vendor':
      return '/dashboard/vendor';
    case 'client':
      return '/dashboard/client';
    default:
      return '/login';
  }
}

/**
 * Guard server-side untuk memastikan user terautentikasi dan memiliki role yang diizinkan
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(getRoleDashboardPath(session.role));
  }

  return session;
}
