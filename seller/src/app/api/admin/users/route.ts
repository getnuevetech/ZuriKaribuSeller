import { NextRequest, NextResponse } from 'next/server';
import { SellerStatus, SellerType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { forbiddenResponse, requireAdminSession } from '@/lib/admin-auth';
import { buildSellerActivationUrl, createSellerActivationToken } from '@/lib/email-verification';
import { sendSellerNotification } from '@/lib/seller-notifications';
import {
  cleanString,
  optionalString,
  stringArray,
  validateEmail,
  validatePassword,
} from '@/lib/user-management';

function buildSellerCreatePayload(body: Record<string, unknown>) {
  const email = cleanString(body.email);
  const password = cleanString(body.password);
  const name = cleanString(body.name);
  const sellerType = cleanString(body.sellerType);
  const mobileNo = cleanString(body.mobileNo);
  const countryCode = cleanString(body.countryCode);
  const businessName = cleanString(body.businessName);
  const businessAddress = cleanString(body.businessAddress);
  const country = cleanString(body.country);

  if (!email || !password || !name || !sellerType || !mobileNo || !businessName || !businessAddress || !country) {
    return { error: 'Missing required seller fields' };
  }

  if (!validateEmail(email)) return { error: 'Invalid email address' };
  if (!validatePassword(password)) return { error: 'Password must be at least 8 characters' };

  return {
    data: {
      email,
      password,
      name,
      sellerType: sellerType as SellerType,
      mobileNo,
      countryCode,
      businessName,
      businessLicense: optionalString(body.businessLicense),
      businessAddress,
      country,
      availableFabrics: stringArray(body.availableFabrics),
      designFabrics: stringArray(body.designFabrics),
      sendSamples: Boolean(body.sendSamples),
      status: (cleanString(body.sellerStatus) || 'PENDING') as SellerStatus,
    },
  };
}

function buildAdminCreatePayload(body: Record<string, unknown>) {
  const email = cleanString(body.email);
  const password = cleanString(body.password);
  const name = cleanString(body.name);

  if (!email || !password || !name) {
    return { error: 'Missing required admin fields' };
  }

  if (!validateEmail(email)) return { error: 'Invalid email address' };
  if (!validatePassword(password)) return { error: 'Password must be at least 8 characters' };

  return {
    data: {
      email,
      password,
      name,
      title: optionalString(body.title),
      phoneNumber: optionalString(body.phoneNumber),
      isSuperAdmin: Boolean(body.isSuperAdmin),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    },
  };
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { seller: { businessName: { contains: search, mode: 'insensitive' } } },
      { adminProfile: { title: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        seller: true,
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((user) => ({ ...user, password: undefined })),
    total,
    page,
    pages: Math.ceil(total / limit),
    viewerIsSuperAdmin: session.user.isSuperAdmin,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const body = (await req.json()) as Record<string, unknown>;
  const kind = cleanString(body.kind);

  if (kind !== 'seller' && kind !== 'admin') {
    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  }

  if (kind === 'admin' && !session.user.isSuperAdmin) {
    return forbiddenResponse('Only super admins can create admin users');
  }

  if (kind === 'seller') {
    const parsedSeller = buildSellerCreatePayload(body);
    if ('error' in parsedSeller) {
      return NextResponse.json({ error: parsedSeller.error }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: parsedSeller.data.email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(parsedSeller.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsedSeller.data.email,
        password: hashedPassword,
        name: parsedSeller.data.name,
        role: 'SELLER',
        seller: {
          create: {
            sellerType: parsedSeller.data.sellerType,
            name: parsedSeller.data.name,
            mobileNo: parsedSeller.data.mobileNo,
            countryCode: parsedSeller.data.countryCode,
            businessName: parsedSeller.data.businessName,
            businessLicense: parsedSeller.data.businessLicense,
            businessAddress: parsedSeller.data.businessAddress,
            country: parsedSeller.data.country,
            availableFabrics: parsedSeller.data.availableFabrics,
            designFabrics: parsedSeller.data.designFabrics,
            sendSamples: parsedSeller.data.sendSamples,
            status: parsedSeller.data.status,
          },
        },
      },
      include: {
        seller: true,
        adminProfile: true,
      },
    });

    try {
      const origin = new URL(req.url).origin;
      const { token, expiresAt } = await createSellerActivationToken(user.email);
      const activationUrl = buildSellerActivationUrl(origin, token, user.email);
      await sendSellerNotification({
        key: 'seller_account_activation',
        to: user.email,
        variables: {
          seller_name: user.name ?? user.seller?.name ?? user.email,
          activation_url: activationUrl,
          activation_expires_at: expiresAt.toISOString(),
        },
      });
    } catch (notificationError) {
      console.error('Failed to send admin-created seller activation notification:', notificationError);
    }

    return NextResponse.json({ user: { ...user, password: undefined } }, { status: 201 });
  }

  const parsedAdmin = buildAdminCreatePayload(body);
  if ('error' in parsedAdmin) {
    return NextResponse.json({ error: parsedAdmin.error }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsedAdmin.data.email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(parsedAdmin.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsedAdmin.data.email,
      password: hashedPassword,
      name: parsedAdmin.data.name,
      role: 'ADMIN',
      adminProfile: {
        create: {
          title: parsedAdmin.data.title,
          phoneNumber: parsedAdmin.data.phoneNumber,
          isSuperAdmin: parsedAdmin.data.isSuperAdmin,
          isActive: parsedAdmin.data.isActive,
        },
      },
    },
    include: {
      seller: true,
      adminProfile: true,
    },
  });

  return NextResponse.json({ user: { ...user, password: undefined } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const { userId, sellerStatus } = await req.json();

  if (!userId || !sellerStatus) {
    return NextResponse.json({ error: 'userId and sellerStatus are required' }, { status: 400 });
  }

  const seller = await prisma.seller.findUnique({
    where: { userId },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!seller) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
  }

  await prisma.seller.update({
    where: { userId },
    data: { status: sellerStatus },
  });

  if (seller.status !== sellerStatus) {
    try {
      await sendSellerNotification({
        key: 'seller_status_updated',
        to: seller.user.email,
        variables: {
          seller_name: seller.user.name ?? seller.name,
          previous_status: seller.status,
          current_status: sellerStatus,
          support_email: process.env.SUPPORT_EMAIL ?? 'support@zurikaribu.com',
        },
      });
    } catch (notificationError) {
      console.error('Failed to send seller status update notification:', notificationError);
    }
  }

  return NextResponse.json({ success: true });
}
