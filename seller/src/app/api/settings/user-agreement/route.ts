import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_CONTENT = `Welcome to ZuriKaribu Seller Platform.

By registering as a seller on ZuriKaribu, you agree to our terms and conditions. Please contact hello@zurikaribu.com for more information.`;

export async function GET() {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: 'user_agreement_content' },
    });

    return NextResponse.json({ content: setting?.value || DEFAULT_CONTENT });
  } catch {
    return NextResponse.json({ content: DEFAULT_CONTENT });
  }
}
