import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'session_token';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'sistem-event-management-super-secret-key-2026-secure-token'
);

interface TokenPayload {
  id: number;
  email: string;
  role: 'event_manager' | 'vendor' | 'client';
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: Number(payload.id),
      email: String(payload.email),
      role: payload.role as 'event_manager' | 'vendor' | 'client',
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // 1. Jika rute adalah halaman publik otentikasi (/login atau /register)
  if (pathname === '/login' || pathname === '/register') {
    // Jika user sudah login, redirect langsung ke dashboard sesuai role-nya
    if (session) {
      const targetDashboard = `/dashboard/${
        session.role === 'event_manager' ? 'manager' : session.role
      }`;
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
    return NextResponse.next();
  }

  // 2. Jika user mencoba mengakses /dashboard root
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const targetDashboard = `/dashboard/${
      session.role === 'event_manager' ? 'manager' : session.role
    }`;
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 3. Jika rute berada di bawah /dashboard/...
  if (pathname.startsWith('/dashboard/')) {
    // Jika belum login, redirect ke /login
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route guard
    if (pathname.startsWith('/dashboard/manager') && session.role !== 'event_manager') {
      const ownDashboard = `/dashboard/${session.role}`;
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }

    if (pathname.startsWith('/dashboard/vendor') && session.role !== 'vendor') {
      const ownDashboard = `/dashboard/${
        session.role === 'event_manager' ? 'manager' : session.role
      }`;
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }

    if (pathname.startsWith('/dashboard/client') && session.role !== 'client') {
      const ownDashboard = `/dashboard/${
        session.role === 'event_manager' ? 'manager' : session.role
      }`;
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
  ],
};
