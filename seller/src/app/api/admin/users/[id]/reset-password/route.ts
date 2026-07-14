import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { forbiddenResponse, requireSuperAdminSession } from '@/lib/admin-auth';
import { markPasswordResetAudit } from '@/lib/password-reset';
import { cleanString, validatePassword } from '@/lib/user-management';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSuperAdminSession();
  if (!session) return forbiddenResponse('Only super admins can reset passwords');

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const newPassword = cleanString(body.newPassword);

  if (!validatePassword(newPassword)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  await markPasswordResetAudit({
    actorUserId: session.user.id,
    targetUserId: id,
    action: 'ADMIN_RESET',
  });

  return NextResponse.json({ success: true });
}
