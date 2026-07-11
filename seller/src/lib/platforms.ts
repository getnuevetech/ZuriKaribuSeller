import { Platform } from '@prisma/client';
import { prisma } from './prisma';

export interface PlatformCredentials {
  // Instagram / Facebook (Meta)
  accessToken?: string;
  instagramAccountId?: string;
  facebookPageId?: string;
  appId?: string;
  appSecret?: string;
  // TikTok
  tiktokAccessToken?: string;
  tiktokOpenId?: string;
  // eBay
  ebayClientId?: string;
  ebayClientSecret?: string;
  ebayAccessToken?: string;
  ebayRefreshToken?: string;
  ebaySiteId?: string;
}

export interface ProductPushData {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  tags?: string[];
  condition?: string;
  quantity?: number;
}

// ─── Instagram ────────────────────────────────────────────────────────────────

async function pushToInstagram(
  product: ProductPushData,
  creds: PlatformCredentials
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    if (!creds.accessToken || !creds.instagramAccountId) {
      return { success: false, error: 'Missing Instagram credentials' };
    }

    // Step 1: Create media container for each image
    const imageUrl = product.images[0];

    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${creds.instagramAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: `${product.name}\n\n${product.description}\n\n💰 Price: $${product.price}\n\n${(product.tags || []).map((t) => `#${t}`).join(' ')}`,
          access_token: creds.accessToken,
        }),
      }
    );

    const mediaData = await mediaResponse.json();
    if (!mediaData.id) {
      return { success: false, error: mediaData.error?.message || 'Failed to create media' };
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${creds.instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: creds.accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();
    if (publishData.id) {
      return { success: true, externalId: publishData.id };
    }
    return { success: false, error: publishData.error?.message || 'Failed to publish' };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

async function pushToFacebook(
  product: ProductPushData,
  creds: PlatformCredentials
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    if (!creds.accessToken || !creds.facebookPageId) {
      return { success: false, error: 'Missing Facebook credentials' };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${creds.facebookPageId}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: product.images[0],
          message: `🌍 ${product.name}\n\n${product.description}\n\n💰 Price: $${product.price}\n\n#AfricanFashion #ZuriKaribu`,
          access_token: creds.accessToken,
        }),
      }
    );

    const data = await response.json();
    if (data.id) {
      return { success: true, externalId: data.id };
    }
    return { success: false, error: data.error?.message || 'Failed to post to Facebook' };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

async function pushToTikTok(
  product: ProductPushData,
  creds: PlatformCredentials
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    if (!creds.tiktokAccessToken) {
      return { success: false, error: 'Missing TikTok credentials' };
    }

    // TikTok Content Posting API
    const response = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + creds.tiktokAccessToken,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: `${product.name} - ${product.description.substring(0, 100)}`,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          photo_images: product.images.slice(0, 5),
          photo_cover_index: 0,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    });

    const data = await response.json();
    if (data.data?.publish_id) {
      return { success: true, externalId: data.data.publish_id };
    }
    return { success: false, error: data.error?.message || 'Failed to post to TikTok' };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── eBay ─────────────────────────────────────────────────────────────────────

async function pushToEbay(
  product: ProductPushData,
  creds: PlatformCredentials
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    if (!creds.ebayAccessToken) {
      return { success: false, error: 'Missing eBay credentials' };
    }

    const listingData = {
      product: {
        title: product.name,
        description: product.description,
        imageUrls: product.images,
        aspects: {
          Style: ['African Fashion'],
          Material: ['African Print Fabric'],
        },
      },
      condition: 'NEW',
      categoryId: '11450', // Women's Clothing
      listingPolicies: {
        fulfillmentPolicyId: creds.ebaySiteId || '12345',
        paymentPolicyId: '12345',
        returnPolicyId: '12345',
      },
      pricingSummary: {
        price: {
          value: product.price.toString(),
          currency: 'USD',
        },
      },
      quantityLimitPerBuyer: 5,
    };

    const response = await fetch(
      'https://api.ebay.com/sell/inventory/v1/offer',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + creds.ebayAccessToken,
          'Content-Type': 'application/json',
          'Content-Language': 'en-US',
        },
        body: JSON.stringify(listingData),
      }
    );

    const data = await response.json();
    if (data.offerId) {
      return { success: true, externalId: data.offerId };
    }
    return { success: false, error: data.errors?.[0]?.message || 'Failed to list on eBay' };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Main Push Function ───────────────────────────────────────────────────────

export async function pushProductToPlatform(
  product: ProductPushData,
  platform: Platform
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  const gateway = await prisma.platformGateway.findUnique({
    where: { platform },
  });

  if (!gateway || !gateway.enabled) {
    return { success: false, error: `Platform ${platform} is not configured or enabled` };
  }

  const creds = gateway.credentials as PlatformCredentials;

  switch (platform) {
    case Platform.INSTAGRAM:
      return pushToInstagram(product, creds);
    case Platform.FACEBOOK:
      return pushToFacebook(product, creds);
    case Platform.TIKTOK:
      return pushToTikTok(product, creds);
    case Platform.EBAY:
      return pushToEbay(product, creds);
    default:
      return { success: false, error: 'Unknown platform' };
  }
}

export async function pushProductToAllPlatforms(
  product: ProductPushData
): Promise<Record<Platform, { success: boolean; externalId?: string; error?: string }>> {
  const platforms = [Platform.INSTAGRAM, Platform.FACEBOOK, Platform.TIKTOK, Platform.EBAY];
  const results = {} as Record<Platform, { success: boolean; externalId?: string; error?: string }>;

  await Promise.all(
    platforms.map(async (platform) => {
      results[platform] = await pushProductToPlatform(product, platform);
    })
  );

  return results;
}

export function getPlatformCredentialFields(platform: Platform): {
  key: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
  description?: string;
}[] {
  switch (platform) {
    case Platform.INSTAGRAM:
      return [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true, description: 'Meta Business API access token' },
        { key: 'instagramAccountId', label: 'Instagram Account ID', type: 'text', required: true, description: 'Your Instagram Business Account ID' },
        { key: 'appId', label: 'App ID', type: 'text', required: false, description: 'Meta App ID' },
        { key: 'appSecret', label: 'App Secret', type: 'password', required: false, description: 'Meta App Secret' },
      ];
    case Platform.FACEBOOK:
      return [
        { key: 'accessToken', label: 'Page Access Token', type: 'password', required: true, description: 'Facebook Page access token' },
        { key: 'facebookPageId', label: 'Facebook Page ID', type: 'text', required: true, description: 'Your Facebook Business Page ID' },
      ];
    case Platform.TIKTOK:
      return [
        { key: 'tiktokAccessToken', label: 'Access Token', type: 'password', required: true, description: 'TikTok API access token' },
        { key: 'tiktokOpenId', label: 'Open ID', type: 'text', required: true, description: 'TikTok user Open ID' },
      ];
    case Platform.EBAY:
      return [
        { key: 'ebayClientId', label: 'Client ID', type: 'text', required: true, description: 'eBay App Client ID' },
        { key: 'ebayClientSecret', label: 'Client Secret', type: 'password', required: true, description: 'eBay App Client Secret' },
        { key: 'ebayAccessToken', label: 'Access Token', type: 'password', required: true, description: 'eBay OAuth Access Token' },
        { key: 'ebayRefreshToken', label: 'Refresh Token', type: 'password', required: false, description: 'eBay OAuth Refresh Token' },
        { key: 'ebaySiteId', label: 'Site ID', type: 'text', required: false, description: 'eBay Site ID (default: EBAY_US)' },
      ];
  }
}
