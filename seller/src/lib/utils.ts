import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculatePlatformPrice(sellingPrice: number, markupPercent: number) {
  return sellingPrice * (1 + markupPercent / 100);
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const FABRIC_OPTIONS = [
  'Cotton',
  'Ankara/African Print',
  'Kente',
  'Kanga/Kitenge',
  'Lace',
  'Chiffon',
  'Silk',
  'Satin',
  'Denim',
  'Linen',
  'Velvet',
  'Batik',
  'Dashiki',
  'Adire (Tie-Dye)',
  'Aso-Oke',
  'Shweshwe',
  'Other',
];

export const AFRICAN_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'MA', name: 'Morocco', dialCode: '+212' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237' },
  { code: 'SN', name: 'Senegal', dialCode: '+221' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'ZM', name: 'Zambia', dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
  { code: 'MW', name: 'Malawi', dialCode: '+265' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { code: 'AO', name: 'Angola', dialCode: '+244' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213' },
  { code: 'OTHER', name: 'Other', dialCode: '' },
];

export const ALL_COUNTRIES = [
  ...AFRICAN_COUNTRIES,
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'AE', name: 'UAE', dialCode: '+971' },
];
