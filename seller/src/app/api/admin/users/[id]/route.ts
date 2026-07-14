import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forbiddenResponse, requireAdminSession } from '@/lib/admin-auth';
import {
  cleanString,
  optionalString,
  stringArray,
  validateEmail,
} from '@/lib/user-management';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { seller: true, adminProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role === 'ADMIN' && !session.user.isSuperAdmin) {
    return forbiddenResponse('Only super admins can edit admin accounts');
  }

  const email = cleanString(body.email);
  const name = cleanString(body.name);

  if (!email || !name) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  if (!validateEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const emailOwner = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id },
    },
    select: { id: true },
  });

  if (emailOwner) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  if (user.role === 'SELLER') {
    const sellerType = cleanString(body.sellerType);
    const mobileNo = cleanString(body.mobileNo);
    const businessName = cleanString(body.businessName);
    const businessAddress = cleanString(body.businessAddress);
    const country = cleanString(body.country);

    if (!sellerType || !mobileNo || !businessName || !businessAddress || !country) {
      return NextResponse.json({ error: 'Missing required seller fields' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        seller: {
          update: {
            sellerType,
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
            ...(body.sellerStatus ? { status: cleanString(body.sellerStatus) } : {}),
          },
        },
      },
      include: { seller: true, adminProfile: true },
    });

    const { password, ...safeSeller } = updatedUser;
    return NextResponse.json({ user: safeSeller });
  }

  const updatedAdmin = await prisma.user.update({
    where: { id },
    data: {
      email,
      name,
      adminProfile: {
        upsert: {
          update: {
            title: optionalString(body.title),
            phoneNumber: optionalString(body.phoneNumber),
            isActive: body.isActive === undefined ? true : Boolean(body.isActive),
            isSuperAdmin: Boolean(body.isSuperAdmin),
          },
          create: {
            title: optionalString(body.title),
            phoneNumber: optionalString(body.phoneNumber),
            isActive: body.isActive === undefined ? true : Boolean(body.isActive),
            isSuperAdmin: Boolean(body.isSuperAdmin),
          },
        },
      },
    },
    include: { seller: true, adminProfile: true },
  });

  const { password, ...safeAdmin } = updatedAdmin;
  return NextResponse.json({ user: safeAdmin });
}
