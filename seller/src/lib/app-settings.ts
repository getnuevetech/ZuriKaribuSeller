export type AppSettingSeed = {
  key: string;
  value: string;
  label: string;
  description?: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SELECT';
  category: string;
};

type LandingStat = {
  label: string;
  value: string;
};

type LandingCard = {
  icon: string;
  title: string;
  desc: string;
  tint: string;
};

type LandingMotif = {
  icon: string;
  name: string;
  copy: string;
  tint: string;
};

type LandingStep = {
  title: string;
  desc: string;
};

type LandingPlatform = {
  icon: string;
  name: string;
};

type LandingHighlight = {
  label: string;
  copy: string;
};

const DEFAULT_LANDING_STATS: LandingStat[] = [
  { label: 'Sellers Waiting', value: '500+' },
  { label: 'African Countries', value: '20+' },
  { label: 'Platforms', value: '4' },
];

const DEFAULT_LANDING_MOTIFS: LandingMotif[] = [
  { icon: '◆', name: 'Kente energy', copy: 'Color-rich presentation inspired by woven heritage and modern retail polish.', tint: 'bg-amber-100 text-amber-700' },
  { icon: '◈', name: 'Ankara rhythm', copy: 'Pattern-led storytelling that makes every collection feel lively and expressive.', tint: 'bg-rose-100 text-rose-700' },
  { icon: '△', name: 'Tailor-ready tools', copy: 'Keep catalogues, fabrics, and fit details clear from first click to first order.', tint: 'bg-emerald-100 text-emerald-700' },
  { icon: '⬢', name: 'Global discovery', copy: 'Showcase African fashion with a storefront that feels premium across every channel.', tint: 'bg-sky-100 text-sky-700' },
];

const DEFAULT_LANDING_FEATURES: LandingCard[] = [
  { icon: '🌍', title: 'Multi-Platform Publishing', desc: 'Publish products to Instagram, TikTok, Facebook, and eBay with a single click while keeping your pricing and imagery aligned.', tint: 'bg-amber-100 text-amber-700' },
  { icon: '🤖', title: 'AI-Optimized Listings', desc: 'Refine product descriptions, fabric details, and social captions with AI tuned for African fashion storytelling.', tint: 'bg-rose-100 text-rose-700' },
  { icon: '📸', title: 'Smart Image Management', desc: 'Upload up to 5 product images to secure cloud storage and present every print, weave, and silhouette beautifully.', tint: 'bg-emerald-100 text-emerald-700' },
  { icon: '🏪', title: 'Seller Dashboard', desc: 'Track products, monitor publishing status, and manage your storefront from one polished workspace.', tint: 'bg-sky-100 text-sky-700' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'Set your selling price confidently while the platform calculates channel-ready pricing with clear margins.', tint: 'bg-orange-100 text-orange-700' },
  { icon: '🔒', title: 'Secure & Reliable', desc: 'Run on enterprise-ready infrastructure with secure authentication and dependable cloud storage.', tint: 'bg-stone-200 text-stone-700' },
];

const DEFAULT_LANDING_STEPS: LandingStep[] = [
  { title: 'Create Your Seller Profile', desc: 'Register as a fashion designer or fabric seller, then introduce your craft, materials, and business story.' },
  { title: 'Upload Your Collection', desc: 'Add product photos, descriptions, fabrics, and pricing. The platform helps polish each listing for launch.' },
  { title: 'Sell Across Channels', desc: 'Push your catalogue to Instagram, TikTok, Facebook, and eBay so customers can discover your work everywhere.' },
];

const DEFAULT_LANDING_PLATFORMS: LandingPlatform[] = [
  { icon: '📸', name: 'Instagram' },
  { icon: '🎵', name: 'TikTok' },
  { icon: '👍', name: 'Facebook' },
  { icon: '🛒', name: 'eBay' },
];

const DEFAULT_LANDING_HIGHLIGHTS: LandingHighlight[] = [
  { label: 'Bold brand storytelling', copy: 'Present the meaning behind prints, fabrics, and craftsmanship with richer product copy.' },
  { label: 'Fast cross-channel launch', copy: 'Reach more buyers without rewriting each listing from scratch for every marketplace.' },
  { label: 'Seller-first operations', copy: 'Keep approvals, products, and platform settings organized from one place.' },
];

const DEFAULT_USER_AGREEMENT_CONTENT = `Welcome to ZuriKaribu Sellers Platform.

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

For questions, contact us at hello@zurikaribu.com.`;

export const DEFAULT_APP_SETTINGS: AppSettingSeed[] = [
  {
    key: 'platform_markup_percent',
    value: '15',
    label: 'Platform Markup %',
    description: 'Percentage markup added to selling price to calculate platform price',
    type: 'NUMBER',
    category: 'pricing',
  },
  {
    key: 'site_name',
    value: 'ZuriKaribu Sellers',
    label: 'Site Name',
    description: 'The name of the platform',
    type: 'TEXT',
    category: 'general',
  },
  {
    key: 'site_tagline',
    value: 'African fashion commerce, reimagined',
    label: 'Site Tagline',
    description: 'Tagline shown on the landing page',
    type: 'TEXT',
    category: 'general',
  },
  {
    key: 'contact_email',
    value: 'hello@zurikaribu.com',
    label: 'Contact Email',
    description: 'Main contact email address',
    type: 'TEXT',
    category: 'general',
  },
  {
    key: 'max_product_images',
    value: '5',
    label: 'Max Product Images',
    description: 'Maximum number of images per product',
    type: 'NUMBER',
    category: 'products',
  },
  {
    key: 'min_product_images',
    value: '3',
    label: 'Min Product Images',
    description: 'Minimum number of images required per product',
    type: 'NUMBER',
    category: 'products',
  },
  {
    key: 'auto_push_to_platforms',
    value: 'false',
    label: 'Auto Push to Platforms',
    description: 'Automatically push new products to all enabled platforms',
    type: 'BOOLEAN',
    category: 'platforms',
  },
  {
    key: 'ai_auto_optimize',
    value: 'false',
    label: 'AI Auto Optimize',
    description: 'Automatically optimize product descriptions with AI on creation',
    type: 'BOOLEAN',
    category: 'ai',
  },
  {
    key: 'currency',
    value: 'USD',
    label: 'Currency',
    description: 'Default currency for product pricing',
    type: 'TEXT',
    category: 'pricing',
  },
  {
    key: 'seller_approval_required',
    value: 'true',
    label: 'Seller Approval Required',
    description: 'Require admin approval before sellers can list products',
    type: 'BOOLEAN',
    category: 'sellers',
  },
  {
    key: 'user_agreement_content',
    value: DEFAULT_USER_AGREEMENT_CONTENT,
    label: 'User Agreement Content',
    description: 'The full text of the user/seller agreement shown on the registration page and the /user-agreement page',
    type: 'TEXT',
    category: 'legal',
  },
  {
    key: 'landing_nav_features_label',
    value: 'Features',
    label: 'Navigation Features Label',
    description: 'Navigation label for the features section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_nav_how_it_works_label',
    value: 'How It Works',
    label: 'Navigation How It Works Label',
    description: 'Navigation label for the how-it-works section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_nav_marketplace_label',
    value: 'Marketplace Reach',
    label: 'Navigation Marketplace Label',
    description: 'Navigation label for the marketplace section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_sign_in_label',
    value: 'Sign In',
    label: 'Header Sign In Label',
    description: 'Button text for the landing page sign-in button',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_register_label',
    value: 'Start Selling',
    label: 'Header Register Label',
    description: 'Button text for the landing page register button',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_show_hero',
    value: 'true',
    label: 'Show Hero Section',
    description: 'Turn the main landing hero on or off',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_hero_image',
    value: 'true',
    label: 'Show Hero Image',
    description: 'Display the hero banner image beside the main headline',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_hero_stats',
    value: 'true',
    label: 'Show Hero Stats',
    description: 'Display the hero statistics row',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_hero_highlights',
    value: 'true',
    label: 'Show Hero Highlights',
    description: 'Display the highlight cards under the hero image',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_features',
    value: 'true',
    label: 'Show Features Section',
    description: 'Turn the features section on or off',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_how_it_works',
    value: 'true',
    label: 'Show How It Works Section',
    description: 'Turn the how-it-works section on or off',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_marketplace',
    value: 'true',
    label: 'Show Marketplace Section',
    description: 'Turn the marketplace reach section on or off',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_growth_cta',
    value: 'true',
    label: 'Show Growth CTA Section',
    description: 'Turn the final growth call-to-action section on or off',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_show_footer',
    value: 'true',
    label: 'Show Footer',
    description: 'Turn the landing footer on or off',
    type: 'BOOLEAN',
    category: 'landing',
  },
  {
    key: 'landing_hero_kicker',
    value: 'African fashion commerce, reimagined',
    label: 'Hero Kicker',
    description: 'Small badge text shown above the landing hero heading',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_title_prefix',
    value: 'ZuriKaribu Sellers helps African fashion brands sell',
    label: 'Hero Title Prefix',
    description: 'First line of the main hero heading',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_title_highlight',
    value: 'boldly, beautifully, globally.',
    label: 'Hero Title Highlight',
    description: 'Highlighted second line of the main hero heading',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_description',
    value: 'ZuriKaribu Sellers brings together designers, fabric merchants, and handmade labels with a vibrant storefront built for modern African fashion. Publish once, then reach shoppers across Instagram, TikTok, Facebook, and eBay.',
    label: 'Hero Description',
    description: 'Supporting copy below the hero heading',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_primary_cta_label',
    value: 'Start Selling Free',
    label: 'Hero Primary CTA Label',
    description: 'Primary button text shown in the hero section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_primary_cta_href',
    value: '/auth/register',
    label: 'Hero Primary CTA Link',
    description: 'Primary button link shown in the hero section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_secondary_cta_label',
    value: 'See How It Works',
    label: 'Hero Secondary CTA Label',
    description: 'Secondary button text shown in the hero section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_secondary_cta_href',
    value: '#how-it-works',
    label: 'Hero Secondary CTA Link',
    description: 'Secondary button link shown in the hero section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_image_url',
    value: 'https://github.com/user-attachments/assets/9cb548f9-2102-4c1f-bec2-524ec826ab91',
    label: 'Hero Image URL',
    description: 'Large image shown in the landing hero',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_image_alt',
    value: 'African fashion seller workspace',
    label: 'Hero Image Alt Text',
    description: 'Accessible alt text for the hero image',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_overlay_eyebrow',
    value: 'Curated storefront',
    label: 'Hero Image Eyebrow',
    description: 'Small label shown on top of the hero image overlay',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_overlay_title',
    value: 'Design a homepage that feels full, polished, and ready to sell.',
    label: 'Hero Image Title',
    description: 'Overlay title shown on top of the hero image',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_hero_overlay_copy',
    value: 'Use the admin settings screen to update copy, swap the banner image, and control which landing sections appear to visitors.',
    label: 'Hero Image Description',
    description: 'Overlay copy shown on top of the hero image',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_stats',
    value: JSON.stringify(DEFAULT_LANDING_STATS, null, 2),
    label: 'Hero Stats',
    description: 'JSON array of hero statistics with label and value fields',
    type: 'JSON',
    category: 'landing',
  },
  {
    key: 'landing_motifs',
    value: JSON.stringify(DEFAULT_LANDING_MOTIFS, null, 2),
    label: 'Hero Highlights',
    description: 'JSON array of highlight cards with icon, name, copy, and tint fields',
    type: 'JSON',
    category: 'landing',
  },
  {
    key: 'landing_features_eyebrow',
    value: 'Built for African fashion entrepreneurs',
    label: 'Features Eyebrow',
    description: 'Small heading shown above the features title',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_features_title',
    value: 'Everything your brand needs to stand out online',
    label: 'Features Title',
    description: 'Main heading for the features section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_features_description',
    value: 'From listing to launch, ZuriKaribu Sellers handles the operational complexity so you can focus on craftsmanship, culture, and growth.',
    label: 'Features Description',
    description: 'Supporting copy for the features section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_features',
    value: JSON.stringify(DEFAULT_LANDING_FEATURES, null, 2),
    label: 'Features Cards',
    description: 'JSON array of feature cards with icon, title, desc, and tint fields',
    type: 'JSON',
    category: 'landing',
  },
  {
    key: 'landing_how_it_works_eyebrow',
    value: 'How it works',
    label: 'How It Works Eyebrow',
    description: 'Small heading shown above the how-it-works title',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_how_it_works_title',
    value: 'Bring your prints, tailoring, and textile story to every channel',
    label: 'How It Works Title',
    description: 'Main heading for the how-it-works section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_how_it_works_description',
    value: 'Launch in three simple steps while keeping your products, pricing, and brand story consistent everywhere.',
    label: 'How It Works Description',
    description: 'Supporting copy for the how-it-works section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_steps',
    value: JSON.stringify(DEFAULT_LANDING_STEPS, null, 2),
    label: 'How It Works Steps',
    description: 'JSON array of how-it-works steps with title and desc fields',
    type: 'JSON',
    category: 'landing',
  },
  {
    key: 'landing_marketplace_eyebrow',
    value: 'Marketplace reach',
    label: 'Marketplace Eyebrow',
    description: 'Small heading shown above the marketplace section title',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_marketplace_title',
    value: 'Put your collections wherever your customers discover style',
    label: 'Marketplace Title',
    description: 'Main heading for the marketplace section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_marketplace_description',
    value: 'One upload, four platforms, and a consistent brand story inspired by African fashion excellence.',
    label: 'Marketplace Description',
    description: 'Supporting copy for the marketplace section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_marketplace_panel_copy',
    value: 'Highlight your craftsmanship with AI-assisted product storytelling, multichannel publishing, and a seller dashboard that keeps every listing in sync.',
    label: 'Marketplace Panel Description',
    description: 'Copy shown inside the dark marketplace detail panel',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_platforms',
    value: JSON.stringify(DEFAULT_LANDING_PLATFORMS, null, 2),
    label: 'Marketplace Platforms',
    description: 'JSON array of supported platforms with icon and name fields',
    type: 'JSON',
    category: 'landing',
  },
  {
    key: 'landing_story_highlights',
    value: JSON.stringify(DEFAULT_LANDING_HIGHLIGHTS, null, 2),
    label: 'Marketplace Highlights',
    description: 'JSON array of marketplace highlight rows with label and copy fields',
    type: 'JSON',
    category: 'landing',
  },
  {
    key: 'landing_growth_eyebrow',
    value: 'AI-powered growth',
    label: 'Growth CTA Eyebrow',
    description: 'Small heading shown above the growth CTA title',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_growth_title',
    value: 'Craft standout listings with the energy of a digital atelier',
    label: 'Growth CTA Title',
    description: 'Main heading for the growth CTA section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_growth_description',
    value: 'ZuriKaribu Sellers adapts descriptions and captions for every platform, helping your products feel polished, premium, and culturally grounded.',
    label: 'Growth CTA Description',
    description: 'Supporting copy for the growth CTA section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_growth_cta_label',
    value: 'Try It Free',
    label: 'Growth CTA Button Label',
    description: 'Button text in the growth CTA section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_growth_cta_href',
    value: '/auth/register',
    label: 'Growth CTA Button Link',
    description: 'Button link in the growth CTA section',
    type: 'TEXT',
    category: 'landing',
  },
  {
    key: 'landing_footer_note',
    value: '"Zuri" means "beautiful" in Swahili • "Karibu" means "welcome"',
    label: 'Footer Note',
    description: 'Small footer note displayed below the copyright line',
    type: 'TEXT',
    category: 'landing',
  },
  ...DEFAULT_NOTIFICATION_APP_SETTINGS,
];

const DEFAULT_SETTING_VALUE_MAP = new Map(DEFAULT_APP_SETTINGS.map((setting) => [setting.key, setting.value]));
const LANDING_SETTING_KEYS = DEFAULT_APP_SETTINGS.map((setting) => setting.key);

type SettingsMap = Map<string, string>;

async function getStoredSettings(keys: string[]): Promise<SettingsMap> {
  if (!process.env.DATABASE_URL) {
    return new Map();
  }

  try {
    const { prisma } = await import('./prisma');
    const settings = await prisma.appSetting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    });

    return new Map(settings.map((setting) => [setting.key, setting.value]));
  } catch {
    return new Map();
  }
}

function readSetting(settings: SettingsMap, key: string): string {
  return settings.get(key) ?? DEFAULT_SETTING_VALUE_MAP.get(key) ?? '';
}

function readBooleanSetting(settings: SettingsMap, key: string): boolean {
  return readSetting(settings, key) === 'true';
}

function readJsonSetting<T>(settings: SettingsMap, key: string, fallback: T): T {
  const value = readSetting(settings, key);

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export type LandingPageContent = {
  siteName: string;
  siteTagline: string;
  navigation: {
    featuresLabel: string;
    howItWorksLabel: string;
    marketplaceLabel: string;
    signInLabel: string;
    registerLabel: string;
  };
  sections: {
    hero: boolean;
    heroImage: boolean;
    heroStats: boolean;
    heroHighlights: boolean;
    features: boolean;
    howItWorks: boolean;
    marketplace: boolean;
    growthCta: boolean;
    footer: boolean;
  };
  hero: {
    kicker: string;
    titlePrefix: string;
    titleHighlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    imageUrl: string;
    imageAlt: string;
    overlayEyebrow: string;
    overlayTitle: string;
    overlayCopy: string;
  };
  stats: LandingStat[];
  motifs: LandingMotif[];
  features: {
    eyebrow: string;
    title: string;
    description: string;
    items: LandingCard[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    steps: LandingStep[];
  };
  marketplace: {
    eyebrow: string;
    title: string;
    description: string;
    panelCopy: string;
    platforms: LandingPlatform[];
    highlights: LandingHighlight[];
  };
  growthCta: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  footerNote: string;
};

export async function getLandingPageContent(): Promise<LandingPageContent> {
  const settings = await getStoredSettings(LANDING_SETTING_KEYS);

  return {
    siteName: readSetting(settings, 'site_name'),
    siteTagline: readSetting(settings, 'site_tagline'),
    navigation: {
      featuresLabel: readSetting(settings, 'landing_nav_features_label'),
      howItWorksLabel: readSetting(settings, 'landing_nav_how_it_works_label'),
      marketplaceLabel: readSetting(settings, 'landing_nav_marketplace_label'),
      signInLabel: readSetting(settings, 'landing_sign_in_label'),
      registerLabel: readSetting(settings, 'landing_register_label'),
    },
    sections: {
      hero: readBooleanSetting(settings, 'landing_show_hero'),
      heroImage: readBooleanSetting(settings, 'landing_show_hero_image'),
      heroStats: readBooleanSetting(settings, 'landing_show_hero_stats'),
      heroHighlights: readBooleanSetting(settings, 'landing_show_hero_highlights'),
      features: readBooleanSetting(settings, 'landing_show_features'),
      howItWorks: readBooleanSetting(settings, 'landing_show_how_it_works'),
      marketplace: readBooleanSetting(settings, 'landing_show_marketplace'),
      growthCta: readBooleanSetting(settings, 'landing_show_growth_cta'),
      footer: readBooleanSetting(settings, 'landing_show_footer'),
    },
    hero: {
      kicker: readSetting(settings, 'landing_hero_kicker'),
      titlePrefix: readSetting(settings, 'landing_hero_title_prefix'),
      titleHighlight: readSetting(settings, 'landing_hero_title_highlight'),
      description: readSetting(settings, 'landing_hero_description'),
      primaryCtaLabel: readSetting(settings, 'landing_hero_primary_cta_label'),
      primaryCtaHref: readSetting(settings, 'landing_hero_primary_cta_href'),
      secondaryCtaLabel: readSetting(settings, 'landing_hero_secondary_cta_label'),
      secondaryCtaHref: readSetting(settings, 'landing_hero_secondary_cta_href'),
      imageUrl: readSetting(settings, 'landing_hero_image_url'),
      imageAlt: readSetting(settings, 'landing_hero_image_alt'),
      overlayEyebrow: readSetting(settings, 'landing_hero_overlay_eyebrow'),
      overlayTitle: readSetting(settings, 'landing_hero_overlay_title'),
      overlayCopy: readSetting(settings, 'landing_hero_overlay_copy'),
    },
    stats: readJsonSetting(settings, 'landing_stats', DEFAULT_LANDING_STATS),
    motifs: readJsonSetting(settings, 'landing_motifs', DEFAULT_LANDING_MOTIFS),
    features: {
      eyebrow: readSetting(settings, 'landing_features_eyebrow'),
      title: readSetting(settings, 'landing_features_title'),
      description: readSetting(settings, 'landing_features_description'),
      items: readJsonSetting(settings, 'landing_features', DEFAULT_LANDING_FEATURES),
    },
    howItWorks: {
      eyebrow: readSetting(settings, 'landing_how_it_works_eyebrow'),
      title: readSetting(settings, 'landing_how_it_works_title'),
      description: readSetting(settings, 'landing_how_it_works_description'),
      steps: readJsonSetting(settings, 'landing_steps', DEFAULT_LANDING_STEPS),
    },
    marketplace: {
      eyebrow: readSetting(settings, 'landing_marketplace_eyebrow'),
      title: readSetting(settings, 'landing_marketplace_title'),
      description: readSetting(settings, 'landing_marketplace_description'),
      panelCopy: readSetting(settings, 'landing_marketplace_panel_copy'),
      platforms: readJsonSetting(settings, 'landing_platforms', DEFAULT_LANDING_PLATFORMS),
      highlights: readJsonSetting(settings, 'landing_story_highlights', DEFAULT_LANDING_HIGHLIGHTS),
    },
    growthCta: {
      eyebrow: readSetting(settings, 'landing_growth_eyebrow'),
      title: readSetting(settings, 'landing_growth_title'),
      description: readSetting(settings, 'landing_growth_description'),
      ctaLabel: readSetting(settings, 'landing_growth_cta_label'),
      ctaHref: readSetting(settings, 'landing_growth_cta_href'),
    },
    footerNote: readSetting(settings, 'landing_footer_note'),
  };
}
import { DEFAULT_NOTIFICATION_APP_SETTINGS } from '@/lib/notification-settings';
