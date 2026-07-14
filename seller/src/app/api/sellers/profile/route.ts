import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SellerStatus, SellerType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  cleanString,
  optionalString,
  stringArray,
  validateEmail,
} from '@/lib/user-management';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });

  return NextResponse.json({ user: seller.user, seller });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  const email = cleanString(body.email);
  const name = cleanString(body.name);
  const sellerType = cleanString(body.sellerType);
  const mobileNo = cleanString(body.mobileNo);
  const businessName = cleanString(body.businessName);
  const businessAddress = cleanString(body.businessAddress);
  const country = cleanString(body.country);

  if (!email || !name || !sellerType || !mobileNo || !businessName || !businessAddress || !country) {
    return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 });
  }

  if (!validateEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });

  const emailOwner = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: session.user.id },
    },
    select: { id: true },
  });

  if (emailOwner) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email,
      name,
      seller: {
        update: {
          sellerType: sellerType as SellerType,
          name,
          mobileNo,
          countryCode: cleanString(body.countryCode),
          businessName,
          businessLicense: optionalString(body.businessLicense),
          businessAddress,
          country,
          availableFabrics: stringArray(body.availableFabrics),
          designFabrics: stringArray(body.designFabrics),
          sendSamples: Boolean(body.sendSamples),
          ...(body.sellerStatus ? { status: cleanString(body.sellerStatus) as SellerStatus } : {}),
          ...(body.paypalEmail !== undefined && { paypalEmail: optionalString(body.paypalEmail) }),
          ...(body.wireTransferInfo !== undefined && {
            wireTransferInfo: body.wireTransferInfo === null ? Prisma.JsonNull : body.wireTransferInfo,
          }),
          ...(body.localDepositInfo !== undefined && {
            localDepositInfo: body.localDepositInfo === null ? Prisma.JsonNull : body.localDepositInfo,
          }),
        },
      },
    },
    include: {
      seller: true,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    },
    seller: updated.seller,
  });
}
