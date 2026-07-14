import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  markPasswordResetAudit,
} from '@/lib/password-reset';
import { cleanString, validateEmail } from '@/lib/user-management';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const email = cleanString(body.email);

  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { adminProfile: true },
  });

  if (!user) {
    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been generated.',
    });
  }

  if (user.role === 'ADMIN' && user.adminProfile && !user.adminProfile.isActive) {
    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been generated.',
    });
  }

  const { rawToken, expiresAt } = await createPasswordResetToken(user.id);
  const resetUrl = buildPasswordResetUrl(new URL(req.url).origin, rawToken);

  await markPasswordResetAudit({
    targetUserId: user.id,
    action: 'REQUESTED',
    metadata: { email },
  });

  console.log(`Password reset link for ${email}: ${resetUrl}`);

  return NextResponse.json({
    success: true,
    message: 'If the email exists, a reset link has been generated.',
    ...(process.env.NODE_ENV !== 'production' ? { resetUrl, expiresAt } : {}),
  });
}
