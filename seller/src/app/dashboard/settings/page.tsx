'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ALL_COUNTRIES, cn, FABRIC_OPTIONS } from '@/lib/utils';

interface WireTransferInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  iban: string;
}

interface LocalDepositInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  reference: string;
}

interface SellerProfileState {
  email: string;
  name: string;
  sellerType: string;
  countryCode: string;
  mobileNo: string;
  businessName: string;
  businessLicense: string;
  businessAddress: string;
  country: string;
  availableFabrics: string[];
  designFabrics: string[];
  sendSamples: boolean;
  paypalEmail: string;
  wireTransferInfo: WireTransferInfo;
  localDepositInfo: LocalDepositInfo;
}

const DEFAULT_WIRE: WireTransferInfo = { bankName: '', accountName: '', accountNumber: '', routingNumber: '', swiftCode: '', iban: '' };
const DEFAULT_LOCAL: LocalDepositInfo = { bankName: '', accountName: '', accountNumber: '', branchCode: '', reference: '' };

const INITIAL_STATE: SellerProfileState = {
  email: '',
  name: '',
  sellerType: '',
  countryCode: '',
  mobileNo: '',
  businessName: '',
  businessLicense: '',
  businessAddress: '',
  country: '',
  availableFabrics: [],
  designFabrics: [],
  sendSamples: false,
  paypalEmail: '',
  wireTransferInfo: { ...DEFAULT_WIRE },
  localDepositInfo: { ...DEFAULT_LOCAL },
};

const TABS = ['PayPal', 'Wire Transfer', 'Local Deposit'] as const;
type Tab = typeof TABS[number];

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('PayPal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<SellerProfileState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch('/api/sellers/profile');
        const result = await response.json();

        if (cancelled || !result.seller || !result.user) return;

        setData({
          email: result.user.email || '',
          name: result.user.name || '',
          sellerType: result.seller.sellerType || '',
          countryCode: result.seller.countryCode || '',
          mobileNo: result.seller.mobileNo || '',
          businessName: result.seller.businessName || '',
          businessLicense: result.seller.businessLicense || '',
          businessAddress: result.seller.businessAddress || '',
          country: result.seller.country || '',
          availableFabrics: result.seller.availableFabrics || [],
          designFabrics: result.seller.designFabrics || [],
          sendSamples: Boolean(result.seller.sendSamples),
          paypalEmail: result.seller.paypalEmail || '',
          wireTransferInfo: result.seller.wireTransferInfo
            ? { ...DEFAULT_WIRE, ...result.seller.wireTransferInfo }
            : { ...DEFAULT_WIRE },
          localDepositInfo: result.seller.localDepositInfo
            ? { ...DEFAULT_LOCAL, ...result.seller.localDepositInfo }
            : { ...DEFAULT_LOCAL },
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleFabric(key: 'availableFabrics' | 'designFabrics', fabric: string) {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(fabric)
        ? prev[key].filter((item) => item !== fabric)
        : [...prev[key], fabric],
    }));
  }

  function updateWire(field: keyof WireTransferInfo, value: string) {
    setData((prev) => ({ ...prev, wireTransferInfo: { ...prev.wireTransferInfo, [field]: value } }));
  }

  function updateLocal(field: keyof LocalDepositInfo, value: string) {
    setData((prev) => ({ ...prev, localDepositInfo: { ...prev.localDepositInfo, [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/sellers/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          businessLicense: data.businessLicense || null,
          paypalEmail: data.paypalEmail || null,
          wireTransferInfo: Object.values(data.wireTransferInfo).some(Boolean) ? data.wireTransferInfo : null,
          localDepositInfo: Object.values(data.localDepositInfo).some(Boolean) ? data.localDepositInfo : null,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to save. Please try again.');
        return;
      }

      setMessage('Profile and payment settings saved successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link href="/dashboard" className="text-stone-400 hover:text-stone-700 text-sm">← Dashboard</Link>
          <h1 className="font-black text-lg text-stone-900">Profile & Payment Settings</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-bold text-stone-900">Registration Details</h2>
            <p className="text-sm text-stone-500 mt-1">Update the seller information you submitted during registration.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Email Address" type="email" value={data.email} onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))} />
            <Input label="Full Name" value={data.name} onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))} />
            <Select
              label="Seller Type"
              value={data.sellerType}
              onChange={(e) => setData((prev) => ({ ...prev, sellerType: e.target.value }))}
              options={[
                { value: 'FASHION_DESIGNER', label: 'Fashion Designer' },
                { value: 'FABRIC_SELLER', label: 'Fabric Seller' },
              ]}
              placeholder="Choose seller type"
            />
            <Input label="Mobile Number" value={data.mobileNo} onChange={(e) => setData((prev) => ({ ...prev, mobileNo: e.target.value }))} />
            <Select
              label="Country"
              value={data.country}
              onChange={(e) => {
                const selectedCountry = ALL_COUNTRIES.find((country) => country.code === e.target.value);
                setData((prev) => ({
                  ...prev,
                  country: e.target.value,
                  countryCode: selectedCountry?.dialCode || prev.countryCode,
                }));
              }}
              options={ALL_COUNTRIES.map((country) => ({ value: country.code, label: country.name }))}
              placeholder="Choose country"
            />
            <Input label="Country Dial Code" value={data.countryCode} onChange={(e) => setData((prev) => ({ ...prev, countryCode: e.target.value }))} />
            <Input label="Business Name" value={data.businessName} onChange={(e) => setData((prev) => ({ ...prev, businessName: e.target.value }))} />
            <Input label="Business License" value={data.businessLicense} onChange={(e) => setData((prev) => ({ ...prev, businessLicense: e.target.value }))} />
          </div>

          <Input
            label="Business Address"
            value={data.businessAddress}
            onChange={(e) => setData((prev) => ({ ...prev, businessAddress: e.target.value }))}
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Available Fabrics</label>
              <div className="flex flex-wrap gap-2">
                {FABRIC_OPTIONS.map((fabric) => (
                  <button
                    key={`available-${fabric}`}
                    type="button"
                    onClick={() => toggleFabric('availableFabrics', fabric)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      data.availableFabrics.includes(fabric)
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    )}
                  >
                    {fabric}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Design Fabrics</label>
              <div className="flex flex-wrap gap-2">
                {FABRIC_OPTIONS.map((fabric) => (
                  <button
                    key={`design-${fabric}`}
                    type="button"
                    onClick={() => toggleFabric('designFabrics', fabric)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      data.designFabrics.includes(fabric)
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    )}
                  >
                    {fabric}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={data.sendSamples}
                onChange={(e) => setData((prev) => ({ ...prev, sendSamples: e.target.checked }))}
              />
              I can send product or fabric samples on request
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="font-bold text-stone-900">Payment Details</h2>
            <p className="text-sm text-stone-500 mt-1">Set up payout methods customers can use.</p>
          </div>

          <div className="flex gap-1 mb-6 border-b border-stone-200">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                  activeTab === tab
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                )}
              >
                {tab === 'PayPal' ? '💳 PayPal' : tab === 'Wire Transfer' ? '🏦 Wire Transfer' : '🏧 Local Deposit'}
              </button>
            ))}
          </div>

          {activeTab === 'PayPal' && (
            <Input
              label="PayPal Email Address"
              type="email"
              value={data.paypalEmail}
              onChange={(e) => setData((prev) => ({ ...prev, paypalEmail: e.target.value }))}
              placeholder="your-paypal@email.com"
            />
          )}

          {activeTab === 'Wire Transfer' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Bank Name" value={data.wireTransferInfo.bankName} onChange={(e) => updateWire('bankName', e.target.value)} />
              <Input label="Account Holder Name" value={data.wireTransferInfo.accountName} onChange={(e) => updateWire('accountName', e.target.value)} />
              <Input label="Account Number / IBAN" value={data.wireTransferInfo.accountNumber} onChange={(e) => updateWire('accountNumber', e.target.value)} />
              <Input label="Routing Number" value={data.wireTransferInfo.routingNumber} onChange={(e) => updateWire('routingNumber', e.target.value)} />
              <Input label="SWIFT / BIC Code" value={data.wireTransferInfo.swiftCode} onChange={(e) => updateWire('swiftCode', e.target.value)} />
              <Input label="IBAN" value={data.wireTransferInfo.iban} onChange={(e) => updateWire('iban', e.target.value)} />
            </div>
          )}

          {activeTab === 'Local Deposit' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Bank Name" value={data.localDepositInfo.bankName} onChange={(e) => updateLocal('bankName', e.target.value)} />
              <Input label="Account Holder Name" value={data.localDepositInfo.accountName} onChange={(e) => updateLocal('accountName', e.target.value)} />
              <Input label="Account Number" value={data.localDepositInfo.accountNumber} onChange={(e) => updateLocal('accountNumber', e.target.value)} />
              <Input label="Branch Code / Sort Code" value={data.localDepositInfo.branchCode} onChange={(e) => updateLocal('branchCode', e.target.value)} />
              <Input label="Payment Reference" value={data.localDepositInfo.reference} onChange={(e) => updateLocal('reference', e.target.value)} />
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
