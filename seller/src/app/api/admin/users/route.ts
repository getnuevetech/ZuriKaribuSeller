import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { forbiddenResponse, requireAdminSession } from '@/lib/admin-auth';
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
      sellerType,
      mobileNo,
      countryCode,
      businessName,
      businessLicense: optionalString(body.businessLicense),
      businessAddress,
      country,
      availableFabrics: stringArray(body.availableFabrics),
      designFabrics: stringArray(body.designFabrics),
      sendSamples: Boolean(body.sendSamples),
      status: cleanString(body.sellerStatus) || 'PENDING',
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
    users: users.map(({ password, ...user }) => user),
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

  const parsed = kind === 'seller'
    ? buildSellerCreatePayload(body)
    : buildAdminCreatePayload(body);

  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: kind === 'seller'
      ? {
          email: parsed.data.email,
          password: hashedPassword,
          name: parsed.data.name,
          role: 'SELLER',
          seller: {
            create: {
              sellerType: parsed.data.sellerType,
              name: parsed.data.name,
              mobileNo: parsed.data.mobileNo,
              countryCode: parsed.data.countryCode,
              businessName: parsed.data.businessName,
              businessLicense: parsed.data.businessLicense,
              businessAddress: parsed.data.businessAddress,
              country: parsed.data.country,
              availableFabrics: parsed.data.availableFabrics,
              designFabrics: parsed.data.designFabrics,
              sendSamples: parsed.data.sendSamples,
              status: parsed.data.status,
            },
          },
        }
      : {
          email: parsed.data.email,
          password: hashedPassword,
          name: parsed.data.name,
          role: 'ADMIN',
          adminProfile: {
            create: {
              title: parsed.data.title,
              phoneNumber: parsed.data.phoneNumber,
              isSuperAdmin: parsed.data.isSuperAdmin,
              isActive: parsed.data.isActive,
            },
          },
        },
    include: {
      seller: true,
      adminProfile: true,
    },
  });

  const { password, ...safeUser } = user;
  return NextResponse.json({ user: safeUser }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return forbiddenResponse();

  const { userId, sellerStatus } = await req.json();

  if (!userId || !sellerStatus) {
    return NextResponse.json({ error: 'userId and sellerStatus are required' }, { status: 400 });
  }

  await prisma.seller.update({
    where: { userId },
    data: { status: sellerStatus },
  });

  return NextResponse.json({ success: true });
}
