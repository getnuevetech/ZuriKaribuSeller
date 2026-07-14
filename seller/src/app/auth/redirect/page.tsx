import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PostLoginRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  redirect('/dashboard');
}
