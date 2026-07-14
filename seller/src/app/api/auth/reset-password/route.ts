import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  consumePasswordResetToken,
  markPasswordResetAudit,
} from '@/lib/password-reset';
import { cleanString, validatePassword } from '@/lib/user-management';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const token = cleanString(body.token);
  const password = cleanString(body.password);

  if (!token) {
    return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
  }

  if (!validatePassword(password)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const user = await consumePasswordResetToken(token);
  if (!user) {
    return NextResponse.json({ error: 'This password reset link is invalid or has expired' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await markPasswordResetAudit({
    targetUserId: user.id,
    action: 'COMPLETED',
  });

  return NextResponse.json({ success: true });
}
