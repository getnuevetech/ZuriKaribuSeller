import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Platform } from '@prisma/client';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const platforms = await prisma.platformGateway.findMany({
    orderBy: { platform: 'asc' },
    include: {
      _count: { select: { platformProducts: true } },
    },
  });

  // Remove sensitive credentials from response
  const sanitized = platforms.map((p) => ({
    ...p,
    credentials: Object.fromEntries(
      Object.keys(p.credentials as object).map((k) => [k, '***HIDDEN***'])
    ),
  }));

  return NextResponse.json({ platforms: sanitized });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { platform, credentials, enabled } = await req.json();

  if (!platform || !Object.values(Platform).includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  const gateway = await prisma.platformGateway.upsert({
    where: { platform },
    update: { credentials, enabled: enabled ?? true },
    create: { platform, credentials, enabled: enabled ?? true },
  });

  return NextResponse.json({
    platform: {
      ...gateway,
      credentials: Object.fromEntries(
        Object.keys(credentials).map((k) => [k, '***HIDDEN***'])
      ),
    },
  });
}
