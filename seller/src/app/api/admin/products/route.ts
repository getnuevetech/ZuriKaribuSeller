import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePlatformPrice } from '@/lib/utils';
import { forbiddenResponse, requireAdminSession } from '@/lib/admin-auth';
import { cleanString, stringArray } from '@/lib/user-management';

function parseImageInputs(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const image = item as { url?: unknown; s3Key?: unknown };
      const url = cleanString(image.url);
      if (!url) return null;

      return {
        url,
        s3Key: cleanString(image.s3Key) || `admin-manual-${Date.now()}-${index}`,
        isPrimary: index === 0,
        order: index,
      };
    })
    .filter((item): item is { url: string; s3Key: string; isPrimary: boolean; order: number } => Boolean(item));
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = { NOT: { status: 'DELETED' } };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { seller: { businessName: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (status) where.status = status;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' } },
        seller: { include: { user: { select: { email: true, name: true } } } },
        platformProducts: { include: { platformGateway: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const body = (await req.json()) as Record<string, unknown>;
  const sellerId = cleanString(body.sellerId);
  const name = cleanString(body.name);
  const description = cleanString(body.description);
  const costPrice = Number(body.costPrice);
  const sellingPrice = Number(body.sellingPrice);
  const status = cleanString(body.status) || 'DRAFT';
  const fabricsUsed = stringArray(body.fabricsUsed);
  const images = parseImageInputs(body.images);

  if (!sellerId || !name || !description || !fabricsUsed.length) {
    return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
  }

  if (!Number.isFinite(costPrice) || !Number.isFinite(sellingPrice)) {
    return NextResponse.json({ error: 'Cost price and selling price are required' }, { status: 400 });
  }

  if (images.length < 1) {
    return NextResponse.json({ error: 'Add at least one product image' }, { status: 400 });
  }

  const seller = await prisma.seller.findUnique({ where: { id: sellerId }, select: { id: true } });
  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
  }

  const markupSetting = await prisma.appSetting.findUnique({
    where: { key: 'platform_markup_percent' },
  });
  const markupPercent = parseFloat(markupSetting?.value || '15');
  const platformPrice = calculatePlatformPrice(sellingPrice, markupPercent);

  const product = await prisma.product.create({
    data: {
      sellerId,
      name,
      description,
      fabricsUsed,
      costPrice,
      sellingPrice,
      platformPrice,
      status,
      images: {
        create: images,
      },
    },
    include: {
      images: true,
      seller: { include: { user: { select: { email: true, name: true } } } },
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
