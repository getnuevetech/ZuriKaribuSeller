import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  return session;
}

export async function requireSuperAdminSession() {
  const session = await requireAdminSession();

  if (!session?.user.isSuperAdmin) {
    return null;
  }

  return session;
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}
