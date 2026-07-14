import { NextRequest, NextResponse } from 'next/server';
import { activateSellerAccount } from '@/lib/email-verification';
import { sendSellerNotification } from '@/lib/seller-notifications';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!token || !email) {
    return NextResponse.json({ error: 'Missing activation details' }, { status: 400 });
  }

  const result = await activateSellerAccount(email, token);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (!result.alreadyVerified) {
    try {
      const origin = new URL(req.url).origin;
      await sendSellerNotification({
        key: 'seller_account_verified',
        to: email,
        variables: {
          seller_name: result.sellerName,
          login_url: `${origin}/auth/login`,
        },
      });
    } catch (notificationError) {
      console.error('Failed to send seller verified notification:', notificationError);
    }
  }

  return NextResponse.json({
    success: true,
    message: result.alreadyVerified
      ? 'This account is already activated.'
      : 'Your account has been activated successfully.',
  });
}
