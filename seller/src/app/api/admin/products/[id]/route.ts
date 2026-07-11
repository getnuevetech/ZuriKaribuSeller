import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePlatformPrice } from '@/lib/utils';
import { pushProductToAllPlatforms, pushProductToPlatform } from '@/lib/platforms';
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
  const allowedFields = ['name', 'description', 'fabricsUsed', 'costPrice', 'status', 'aiDescription'];
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) updateData[field] = body[field];
  });

  if (body.sellingPrice !== undefined) {
    updateData.sellingPrice = parseFloat(body.sellingPrice);
    const markupSetting = await prisma.appSetting.findUnique({
      where: { key: 'platform_markup_percent' },
    });
    const markupPercent = parseFloat(markupSetting?.value || '15');
    updateData.platformPrice = calculatePlatformPrice(parseFloat(body.sellingPrice), markupPercent);
  }

  if (body.platformPrice !== undefined) {
    updateData.platformPrice = parseFloat(body.platformPrice);
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      images: true,
      platformProducts: { include: { platformGateway: true } },
    },
  });

  // If product is updated and was previously pushed to platforms, re-push
  if (body.syncPlatforms && product.platformProducts.length > 0) {
    const pushedPlatforms = product.platformProducts
      .filter((pp) => pp.status === 'PUSHED')
      .map((pp) => pp.platformGateway.platform as Platform);

    await Promise.all(
      pushedPlatforms.map(async (platform) => {
        const pushData = {
          id: product.id,
          name: product.name,
          description: product.aiDescription || product.description,
          price: product.platformPrice,
          images: product.images.map((img) => img.url),
        };
        const result = await pushProductToPlatform(pushData, platform);
        await prisma.platformProduct.update({
          where: {
            productId_platformGatewayId: {
              productId: product.id,
              platformGatewayId: product.platformProducts.find(
                (pp) => pp.platformGateway.platform === platform
              )!.platformGatewayId,
            },
          },
          data: {
            status: result.success ? 'UPDATED' : 'FAILED',
            errorMessage: result.error || null,
            lastPushedAt: result.success ? new Date() : undefined,
          },
        });
      })
    );
  }

  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { permanent } = await req.json().catch(() => ({}));

  if (permanent) {
    await prisma.product.delete({ where: { id } });
  } else {
    await prisma.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  return NextResponse.json({ success: true });
}
