import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePlatformPrice } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      platformProducts: { include: { platformGateway: true } },
      seller: { include: { user: true } },
    },
  });

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Check ownership (sellers can only view their own, admins can view all)
  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (session.user.role !== 'ADMIN' && product.sellerId !== seller?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Verify ownership
  if (session.user.role !== 'ADMIN') {
    const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
    if (product.sellerId !== seller?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.fabricsUsed !== undefined) updateData.fabricsUsed = body.fabricsUsed;
  if (body.costPrice !== undefined) updateData.costPrice = parseFloat(body.costPrice);
  if (body.status !== undefined) updateData.status = body.status;

  if (body.sellingPrice !== undefined) {
    updateData.sellingPrice = parseFloat(body.sellingPrice);
    const markupSetting = await prisma.appSetting.findUnique({
      where: { key: 'platform_markup_percent' },
    });
    const markupPercent = parseFloat(markupSetting?.value || '15');
    updateData.platformPrice = calculatePlatformPrice(parseFloat(body.sellingPrice), markupPercent);
  }

  // Admin can override platform price
  if (session.user.role === 'ADMIN' && body.platformPrice !== undefined) {
    updateData.platformPrice = parseFloat(body.platformPrice);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { images: true, platformProducts: true },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  if (session.user.role !== 'ADMIN') {
    const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
    if (product.sellerId !== seller?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  await prisma.product.update({
    where: { id },
    data: { status: 'DELETED' },
  });

  return NextResponse.json({ success: true });
}
