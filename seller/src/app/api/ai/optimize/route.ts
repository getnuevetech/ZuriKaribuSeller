import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  optimizeProductDescription,
  generateProductTags,
  generateSocialMediaCaption,
  analyzeProductImage,
} from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, productId, ...data } = body;

  switch (action) {
    case 'optimize_description': {
      const { productName, description, fabricsUsed, sellerType } = data;
      const optimized = await optimizeProductDescription(
        productName,
        description,
        fabricsUsed || [],
        sellerType || 'FASHION_DESIGNER'
      );

      // Save optimized description if productId provided
      if (productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { aiDescription: optimized, aiOptimized: true },
        });
      }

      return NextResponse.json({ optimized });
    }

    case 'generate_tags': {
      const { productName, description, fabricsUsed } = data;
      const tags = await generateProductTags(productName, description, fabricsUsed || []);
      return NextResponse.json({ tags });
    }

    case 'generate_caption': {
      const { productName, description, platform, sellingPrice } = data;
      const caption = await generateSocialMediaCaption(
        productName,
        description,
        platform,
        parseFloat(sellingPrice)
      );
      return NextResponse.json({ caption });
    }

    case 'analyze_image': {
      const { imageUrl } = data;
      const analysis = await analyzeProductImage(imageUrl);
      return NextResponse.json({ analysis });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
