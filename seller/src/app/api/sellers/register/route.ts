import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { buildSellerActivationUrl, createSellerActivationToken } from '@/lib/email-verification';
import { sendSellerNotification } from '@/lib/seller-notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      sellerType,
      name,
      mobileNo,
      countryCode,
      businessName,
      businessLicense,
      businessAddress,
      country,
      availableFabrics,
      designFabrics,
      sendSamples,
    } = body;

    // Validate required fields
    if (!email || !password || !sellerType || !name || !mobileNo || !businessName || !businessAddress || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + seller in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SELLER',
        seller: {
          create: {
            sellerType,
            name,
            mobileNo,
            countryCode: countryCode || '',
            businessName,
            businessLicense: businessLicense || null,
            businessAddress,
            country,
            availableFabrics: availableFabrics || [],
            designFabrics: designFabrics || [],
            sendSamples: sendSamples || false,
          },
        },
      },
      include: { seller: true },
    });

    const origin = new URL(req.url).origin;
    const { token, expiresAt } = await createSellerActivationToken(user.email);
    const activationUrl = buildSellerActivationUrl(origin, token, user.email);

    try {
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
      console.error('Failed to send seller activation notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created. Please verify your email to activate your account.',
      ...(process.env.NODE_ENV !== 'production' ? { activationUrl, activationExpiresAt: expiresAt } : {}),
    });
  } catch (err) {
    console.error('Registration error:', err);

    if (err instanceof Error) {
      if (
        err.message.includes('Unique constraint') ||
        err.message.includes('unique constraint') ||
        (err as { code?: string }).code === 'P2002'
      ) {
        return NextResponse.json({ error: 'This email address is already registered. Please sign in instead.' }, { status: 409 });
      }
      if (
        err.message.includes('DATABASE_URL') ||
        err.message.includes('database') ||
        (err as { code?: string }).code === 'P1001' ||
        (err as { code?: string }).code === 'P1003'
      ) {
        return NextResponse.json({ error: 'Database is temporarily unavailable. Please try again in a moment.' }, { status: 503 });
      }
    }

    return NextResponse.json({ error: 'Registration failed. Please check your details and try again.' }, { status: 500 });
  }
}
