export type SellerPayload = {
  email?: string;
  password?: string;
  name?: string;
  sellerType?: string;
  mobileNo?: string;
  countryCode?: string;
  businessName?: string;
  businessLicense?: string | null;
  businessAddress?: string;
  country?: string;
  availableFabrics?: string[];
  designFabrics?: string[];
  sendSamples?: boolean;
  sellerStatus?: string;
};

export type AdminPayload = {
  email?: string;
  password?: string;
  name?: string;
  title?: string | null;
  phoneNumber?: string | null;
  isSuperAdmin?: boolean;
  isActive?: boolean;
};

export function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function optionalString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

export function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanString(item))
    .filter(Boolean);
}

export function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 8;
}
