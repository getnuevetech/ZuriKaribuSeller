import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pushProductToPlatform, pushProductToAllPlatforms } from '@/lib/platforms';
import { Platform } from '@prisma/client';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { productIds, platform, pushAll } = await req.json();

  if (!productIds || productIds.length === 0) {
    return NextResponse.json({ error: 'No products specified' }, { status: 400 });
  }

  const results: Record<string, unknown> = {};

  for (const productId of productIds) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    if (!product) {
      results[productId] = { error: 'Product not found' };
      continue;
    }

    const pushData = {
      id: product.id,
      name: product.name,
      description: product.aiDescription || product.description,
      price: product.platformPrice,
      images: product.images.map((img) => img.url),
    };

    if (pushAll || !platform) {
      // Push to all enabled platforms
      const platformResults = await pushProductToAllPlatforms(pushData);
      results[productId] = platformResults;

      // Update platform_products records
      for (const [plat, result] of Object.entries(platformResults)) {
        const gateway = await prisma.platformGateway.findUnique({
          where: { platform: plat as Platform },
        });
        if (gateway) {
          await prisma.platformProduct.upsert({
            where: {
              productId_platformGatewayId: {
                productId: product.id,
                platformGatewayId: gateway.id,
              },
            },
            update: {
              status: result.success ? 'PUSHED' : 'FAILED',
              externalId: result.externalId || null,
              errorMessage: result.error || null,
              lastPushedAt: result.success ? new Date() : undefined,
            },
            create: {
              productId: product.id,
              platformGatewayId: gateway.id,
              status: result.success ? 'PUSHED' : 'FAILED',
              externalId: result.externalId || null,
              errorMessage: result.error || null,
              lastPushedAt: result.success ? new Date() : undefined,
            },
          });
        }
      }
    } else {
      // Push to specific platform
      const result = await pushProductToPlatform(pushData, platform as Platform);
      results[productId] = { [platform]: result };

      const gateway = await prisma.platformGateway.findUnique({
        where: { platform: platform as Platform },
      });
      if (gateway) {
        await prisma.platformProduct.upsert({
          where: {
            productId_platformGatewayId: {
              productId: product.id,
              platformGatewayId: gateway.id,
            },
          },
          update: {
            status: result.success ? 'PUSHED' : 'FAILED',
            externalId: result.externalId || null,
            errorMessage: result.error || null,
            lastPushedAt: result.success ? new Date() : undefined,
          },
          create: {
            productId: product.id,
            platformGatewayId: gateway.id,
            status: result.success ? 'PUSHED' : 'FAILED',
            externalId: result.externalId || null,
            errorMessage: result.error || null,
            lastPushedAt: result.success ? new Date() : undefined,
          },
        });
      }
    }
  }

  return NextResponse.json({ results });
}
