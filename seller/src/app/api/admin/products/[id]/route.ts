import { NextRequest, NextResponse } from 'next/server';
import { Platform } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { calculatePlatformPrice } from '@/lib/utils';
import { pushProductToPlatform } from '@/lib/platforms';
import { forbiddenResponse, requireAdminSession } from '@/lib/admin-auth';
import { cleanString, stringArray } from '@/lib/user-management';

function parseImageInputs(value: unknown) {
  if (!Array.isArray(value)) return null;

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const updateData: Record<string, unknown> = {};
  const allowedFields = ['name', 'description', 'status', 'aiDescription'];
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) updateData[field] = body[field];
  });

  if (body.sellerId !== undefined) {
    updateData.sellerId = cleanString(body.sellerId);
  }

  if (body.fabricsUsed !== undefined) {
    updateData.fabricsUsed = stringArray(body.fabricsUsed);
  }

  if (body.costPrice !== undefined) {
    updateData.costPrice = Number(body.costPrice);
  }

  if (body.sellingPrice !== undefined) {
    const sellingPrice = Number(body.sellingPrice);
    updateData.sellingPrice = sellingPrice;
    const markupSetting = await prisma.appSetting.findUnique({
      where: { key: 'platform_markup_percent' },
    });
    const markupPercent = parseFloat(markupSetting?.value || '15');
    updateData.platformPrice = calculatePlatformPrice(sellingPrice, markupPercent);
  }

  if (body.platformPrice !== undefined) {
    updateData.platformPrice = Number(body.platformPrice);
  }

  const images = parseImageInputs(body.images);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images,
            },
          }
        : {}),
    },
    include: {
      images: true,
      platformProducts: { include: { platformGateway: true } },
      seller: { include: { user: { select: { email: true, name: true } } } },
    },
  });

  if (body.syncPlatforms && product.platformProducts.length > 0) {
    const pushedPlatforms = product.platformProducts
      .filter((pp) => pp.status === 'PUSHED' || pp.status === 'UPDATED')
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
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

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
