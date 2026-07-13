import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      paypalEmail: true,
      wireTransferInfo: true,
      localDepositInfo: true,
    },
  });

  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });

  return NextResponse.json({ seller });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { paypalEmail, wireTransferInfo, localDepositInfo } = body;

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });

  const updated = await prisma.seller.update({
    where: { userId: session.user.id },
    data: {
      ...(paypalEmail !== undefined && { paypalEmail: paypalEmail || null }),
      ...(wireTransferInfo !== undefined && { wireTransferInfo }),
      ...(localDepositInfo !== undefined && { localDepositInfo }),
    },
    select: {
      paypalEmail: true,
      wireTransferInfo: true,
      localDepositInfo: true,
    },
  });

  return NextResponse.json({ success: true, seller: updated });
}
