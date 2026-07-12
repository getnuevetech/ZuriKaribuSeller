import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generatePresignedUploadUrl, generateProductImageKey } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

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

  const { filename, contentType, count } = await req.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
  }

  // Validate content type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF allowed.' }, { status: 400 });
  }

  // If batch upload, generate multiple presigned URLs
  if (count && count > 1) {
    const urls = await Promise.all(
      Array.from({ length: count }).map(async (_, i) => {
        const key = generateProductImageKey(seller.id, `image-${i}.${filename.split('.').pop()}`);
        const uploadUrl = await generatePresignedUploadUrl(key, contentType);
        return { key, uploadUrl, index: i };
      })
    );
    return NextResponse.json({ urls });
  }

  const key = generateProductImageKey(seller.id, filename);
  const uploadUrl = await generatePresignedUploadUrl(key, contentType);

  return NextResponse.json({ key, uploadUrl });
}
