import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePlatformPrice } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
  }

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: {
      images: { orderBy: { order: 'asc' } },
      platformProducts: {
        include: { platformGateway: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
  }

  const body = await req.json();
  const { name, description, fabricsUsed, costPrice, sellingPrice, images } = body;

  if (!name || !description || !fabricsUsed || !costPrice || !sellingPrice) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!images || images.length < 3) {
    return NextResponse.json({ error: 'At least 3 product images are required' }, { status: 400 });
  }

  if (images.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 product images allowed' }, { status: 400 });
  }

  // Get platform markup
  const markupSetting = await prisma.appSetting.findUnique({
    where: { key: 'platform_markup_percent' },
  });
  const markupPercent = parseFloat(markupSetting?.value || '15');
  const platformPrice = calculatePlatformPrice(parseFloat(sellingPrice), markupPercent);

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      name,
      description,
      fabricsUsed,
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      platformPrice,
      images: {
        create: images.map((img: { url: string; s3Key: string; isPrimary?: boolean }, i: number) => ({
          url: img.url,
          s3Key: img.s3Key,
          isPrimary: i === 0,
          order: i,
        })),
      },
    },
    include: {
      images: true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
