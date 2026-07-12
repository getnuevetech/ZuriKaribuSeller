import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

// Default settings to seed
const DEFAULT_SETTINGS = [
  {
    key: 'platform_markup_percent',
    value: '15',
    label: 'Platform Markup %',
    description: 'Percentage markup added to selling price to calculate platform price',
    type: 'NUMBER' as const,
    category: 'pricing',
  },
  {
    key: 'site_name',
    value: 'ZuriKaribu Sellers',
    label: 'Site Name',
    description: 'The name of the platform',
    type: 'TEXT' as const,
    category: 'general',
  },
  {
    key: 'site_tagline',
    value: 'Discover African Fashion',
    label: 'Site Tagline',
    description: 'Tagline shown on the landing page',
    type: 'TEXT' as const,
    category: 'general',
  },
  {
    key: 'contact_email',
    value: 'hello@zurikaribu.com',
    label: 'Contact Email',
    description: 'Main contact email address',
    type: 'TEXT' as const,
    category: 'general',
  },
  {
    key: 'max_product_images',
    value: '5',
    label: 'Max Product Images',
    description: 'Maximum number of images per product',
    type: 'NUMBER' as const,
    category: 'products',
  },
  {
    key: 'min_product_images',
    value: '3',
    label: 'Min Product Images',
    description: 'Minimum number of images required per product',
    type: 'NUMBER' as const,
    category: 'products',
  },
  {
    key: 'auto_push_to_platforms',
    value: 'false',
    label: 'Auto Push to Platforms',
    description: 'Automatically push new products to all enabled platforms',
    type: 'BOOLEAN' as const,
    category: 'platforms',
  },
  {
    key: 'ai_auto_optimize',
    value: 'false',
    label: 'AI Auto Optimize',
    description: 'Automatically optimize product descriptions with AI on creation',
    type: 'BOOLEAN' as const,
    category: 'ai',
  },
  {
    key: 'currency',
    value: 'USD',
    label: 'Currency',
    description: 'Default currency for product pricing',
    type: 'TEXT' as const,
    category: 'pricing',
  },
  {
    key: 'seller_approval_required',
    value: 'true',
    label: 'Seller Approval Required',
    description: 'Require admin approval before sellers can list products',
    type: 'BOOLEAN' as const,
    category: 'sellers',
  },
  {
    key: 'user_agreement_content',
    value: `Welcome to ZuriKaribu Sellers Platform.

By registering as a seller on ZuriKaribu Sellers, you agree to the following terms:

1. ELIGIBILITY
You must be at least 18 years old and capable of forming a legally binding contract to register as a seller.

2. SELLER RESPONSIBILITIES
You are responsible for ensuring all products listed comply with applicable laws and regulations. You must provide accurate product descriptions, pricing, and images.

3. PLATFORM FEES
ZuriKaribu Sellers charges a platform markup percentage on all sales. The current rate is set by the platform administrators and is subject to change with notice.

4. PRODUCT STANDARDS
All products must be authentic and as described. ZuriKaribu Sellers reserves the right to remove any listings that violate platform policies.

5. PAYMENTS
Payments are processed through the platform. Sellers will receive payouts according to the payment schedule outlined in the seller dashboard.

6. ACCOUNT SUSPENSION
ZuriKaribu Sellers reserves the right to suspend or terminate seller accounts for violations of these terms or any applicable laws.

7. PRIVACY
Your personal and business information is handled in accordance with our Privacy Policy.

8. CHANGES TO TERMS
ZuriKaribu Sellers may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.

For questions, contact us at hello@zurikaribu.com.`,
    label: 'User Agreement Content',
    description: 'The full text of the user/seller agreement shown on the registration page and the /user-agreement page',
    type: 'TEXT' as const,
    category: 'legal',
  },
];

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Seed defaults if not exist
  await Promise.all(
    DEFAULT_SETTINGS.map((s) =>
      prisma.appSetting.upsert({
        where: { key: s.key },
        update: {},
        create: s,
      })
    )
  );

  const settings = await prisma.appSetting.findMany({
    orderBy: [{ category: 'asc' }, { label: 'asc' }],
  });

  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { settings } = await req.json();

  if (!Array.isArray(settings)) {
    return NextResponse.json({ error: 'settings must be an array' }, { status: 400 });
  }

  const updated = await Promise.all(
    settings.map(async (s: { key: string; value: string; label?: string; description?: string; type?: string; category?: string }) => {
      return prisma.appSetting.upsert({
        where: { key: s.key },
        update: {
          value: s.value,
          label: s.label,
          description: s.description,
          category: s.category,
        },
        create: {
          key: s.key,
          value: s.value,
          label: s.label || s.key,
          description: s.description,
          type: (s.type as 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SELECT') || 'TEXT',
          category: s.category || 'general',
        },
      });
    })
  );

  return NextResponse.json({ settings: updated });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { key, value, label, description, type, category } = body;

  if (!key || !value || !label) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const setting = await prisma.appSetting.upsert({
    where: { key },
    update: { value, label, description, category },
    create: { key, value, label, description, type: type || 'TEXT', category: category || 'general' },
  });

  return NextResponse.json({ setting });
}
