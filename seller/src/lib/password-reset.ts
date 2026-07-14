import { randomBytes, createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60 * 2;

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    rawToken,
    expiresAt,
  };
}

export async function markPasswordResetAudit(input: {
  targetUserId: string;
  actorUserId?: string | null;
  action: 'REQUESTED' | 'COMPLETED' | 'ADMIN_RESET';
  metadata?: Record<string, unknown>;
}) {
  await prisma.passwordResetAudit.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      targetUserId: input.targetUserId,
      action: input.action,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  return resetToken.user;
}

export function buildPasswordResetUrl(origin: string, token: string) {
  return `${origin}/auth/reset-password?token=${encodeURIComponent(token)}`;
}
