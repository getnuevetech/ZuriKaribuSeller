import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Platform } from '@prisma/client';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.enabled !== undefined) updateData.enabled = body.enabled;

  if (body.credentials) {
    // Get existing credentials and merge (don't overwrite hidden values)
    const existing = await prisma.platformGateway.findUnique({ where: { id } });
    if (existing) {
      const existingCreds = existing.credentials as Record<string, unknown>;
      const newCreds: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(body.credentials)) {
        if (value !== '***HIDDEN***') {
          newCreds[key] = value;
        } else {
          newCreds[key] = existingCreds[key];
        }
      }
      updateData.credentials = newCreds;
    }
  }

  const platform = await prisma.platformGateway.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    platform: {
      ...platform,
      credentials: Object.fromEntries(
        Object.keys(platform.credentials as object).map((k) => [k, '***HIDDEN***'])
      ),
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.platformGateway.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
