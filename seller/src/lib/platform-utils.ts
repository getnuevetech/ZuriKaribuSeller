// Client-safe platform utilities - no server imports
export type PlatformName = 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'EBAY';

export const PLATFORM_INFO: Record<PlatformName, { emoji: string; name: string; color: string }> = {
  INSTAGRAM: { emoji: '📸', name: 'Instagram', color: 'from-purple-500 to-pink-500' },
  TIKTOK: { emoji: '🎵', name: 'TikTok', color: 'from-stone-900 to-stone-700' },
  FACEBOOK: { emoji: '👍', name: 'Facebook', color: 'from-blue-600 to-blue-800' },
  EBAY: { emoji: '🛒', name: 'eBay', color: 'from-yellow-400 to-red-500' },
};

export type CredentialField = {
  key: string;
  label: string;
  type: 'text' | 'password';
  required: boolean;
  description?: string;
};

export function getPlatformCredentialFields(platform: PlatformName): CredentialField[] {
  switch (platform) {
    case 'INSTAGRAM':
      return [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true, description: 'Meta Business API access token' },
        { key: 'instagramAccountId', label: 'Instagram Account ID', type: 'text', required: true, description: 'Your Instagram Business Account ID' },
        { key: 'appId', label: 'App ID', type: 'text', required: false, description: 'Meta App ID' },
        { key: 'appSecret', label: 'App Secret', type: 'password', required: false, description: 'Meta App Secret' },
      ];
    case 'FACEBOOK':
      return [
        { key: 'accessToken', label: 'Page Access Token', type: 'password', required: true, description: 'Facebook Page access token' },
        { key: 'facebookPageId', label: 'Facebook Page ID', type: 'text', required: true, description: 'Your Facebook Business Page ID' },
      ];
    case 'TIKTOK':
      return [
        { key: 'tiktokAccessToken', label: 'Access Token', type: 'password', required: true, description: 'TikTok API access token' },
        { key: 'tiktokOpenId', label: 'Open ID', type: 'text', required: true, description: 'TikTok user Open ID' },
      ];
    case 'EBAY':
      return [
        { key: 'ebayClientId', label: 'Client ID', type: 'text', required: true, description: 'eBay App Client ID' },
        { key: 'ebayClientSecret', label: 'Client Secret', type: 'password', required: true, description: 'eBay App Client Secret' },
        { key: 'ebayAccessToken', label: 'Access Token', type: 'password', required: true, description: 'eBay OAuth Access Token' },
        { key: 'ebayRefreshToken', label: 'Refresh Token', type: 'password', required: false, description: 'eBay OAuth Refresh Token' },
        { key: 'ebaySiteId', label: 'Site ID', type: 'text', required: false, description: 'eBay Site ID (default: EBAY_US)' },
      ];
  }
}

export const ALL_PLATFORM_NAMES: PlatformName[] = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'EBAY'];
