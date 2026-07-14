import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

const SELLER_ACTIVATION_IDENTIFIER_PREFIX = 'seller-activation:';
const SELLER_ACTIVATION_TTL_HOURS = 24;

function getSellerActivationIdentifier(email: string): string {
  return `${SELLER_ACTIVATION_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

export function buildSellerActivationUrl(origin: string, token: string, email: string): string {
  const url = new URL('/auth/activate-account', origin);
  url.searchParams.set('token', token);
  url.searchParams.set('email', email);
  return url.toString();
}

export async function createSellerActivationToken(email: string): Promise<{ token: string; expiresAt: Date }> {
  const identifier = getSellerActivationIdentifier(email);
  const token = randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + SELLER_ACTIVATION_TTL_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: expiresAt,
    },
  });

  return { token, expiresAt };
}

type ActivateSellerAccountResult =
  | { success: true; alreadyVerified: boolean; sellerName: string }
  | { success: false; error: string };

export async function activateSellerAccount(email: string, token: string): Promise<ActivateSellerAccountResult> {
  const identifier = getSellerActivationIdentifier(email);
  const storedToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });

  if (!storedToken) {
    return { success: false, error: 'Invalid activation link' };
  }

  if (storedToken.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return { success: false, error: 'Activation link has expired' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { seller: true },
  });

  if (!user || user.role !== 'SELLER') {
    return { success: false, error: 'Seller account not found' };
  }

  if (user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return { success: true, alreadyVerified: true, sellerName: user.name ?? user.seller?.name ?? email };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({ where: { identifier } }),
  ]);

  return { success: true, alreadyVerified: false, sellerName: user.name ?? user.seller?.name ?? email };
}
