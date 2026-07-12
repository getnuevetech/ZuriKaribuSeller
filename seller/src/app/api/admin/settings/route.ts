import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DEFAULT_APP_SETTINGS } from '@/lib/app-settings';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Seed defaults if not exist
  await Promise.all(
    DEFAULT_APP_SETTINGS.map((s) =>
      prisma.appSetting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      })
    )
  );

  const settings = await prisma.appSetting.findMany({
    orderBy: [{ category: 'asc' }, { label: 'asc' }],
  });

  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { settings } = await req.json();

  if (!Array.isArray(settings)) {
    return NextResponse.json({ error: 'settings must be an array' }, { status: 400 });
  }

  const updated = await Promise.all(
    settings.map(async (s: { key: string; value: string; label?: string; description?: string; type?: string; category?: string }) => {
      return prisma.appSetting.upsert({
        where: { key: s.key },
        update: {
          value: s.value,
          label: s.label,
          description: s.description,
          category: s.category,
        },
        create: {
          key: s.key,
          value: s.value,
          label: s.label || s.key,
          description: s.description,
          type: (s.type as 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SELECT') || 'TEXT',
          category: s.category || 'general',
        },
      });
    })
  );

  return NextResponse.json({ settings: updated });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { key, value, label, description, type, category } = body;

  if (!key || !value || !label) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const setting = await prisma.appSetting.upsert({
    where: { key },
    update: { value, label, description, category },
    create: { key, value, label, description, type: type || 'TEXT', category: category || 'general' },
  });

  return NextResponse.json({ setting });
}
