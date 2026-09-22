import { getSession, getRoleDashboardPath } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleDashboardPath(session.role));
  }

  redirect('/login');
}
