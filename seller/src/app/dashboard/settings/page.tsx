'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

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

interface PaymentData {
  paypalEmail: string;
  wireTransferInfo: WireTransferInfo;
  localDepositInfo: LocalDepositInfo;
}

const DEFAULT_WIRE: WireTransferInfo = { bankName: '', accountName: '', accountNumber: '', routingNumber: '', swiftCode: '', iban: '' };
const DEFAULT_LOCAL: LocalDepositInfo = { bankName: '', accountName: '', accountNumber: '', branchCode: '', reference: '' };

const TABS = ['PayPal', 'Wire Transfer', 'Local Deposit'] as const;
type Tab = typeof TABS[number];

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('PayPal');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<PaymentData>({
    paypalEmail: '',
    wireTransferInfo: { ...DEFAULT_WIRE },
    localDepositInfo: { ...DEFAULT_LOCAL },
  });

  useEffect(() => {
    fetch('/api/sellers/profile')
      .then((r) => r.json())
      .then((res) => {
        if (res.seller) {
          setData({
            paypalEmail: res.seller.paypalEmail || '',
            wireTransferInfo: res.seller.wireTransferInfo
              ? { ...DEFAULT_WIRE, ...res.seller.wireTransferInfo }
              : { ...DEFAULT_WIRE },
            localDepositInfo: res.seller.localDepositInfo
              ? { ...DEFAULT_LOCAL, ...res.seller.localDepositInfo }
              : { ...DEFAULT_LOCAL },
          });
        }
      });
  }, []);

  function updateWire(field: keyof WireTransferInfo, value: string) {
    setData((p) => ({ ...p, wireTransferInfo: { ...p.wireTransferInfo, [field]: value } }));
  }

  function updateLocal(field: keyof LocalDepositInfo, value: string) {
    setData((p) => ({ ...p, localDepositInfo: { ...p.localDepositInfo, [field]: value } }));
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
          paypalEmail: data.paypalEmail || null,
          wireTransferInfo: Object.values(data.wireTransferInfo).some(Boolean) ? data.wireTransferInfo : null,
          localDepositInfo: Object.values(data.localDepositInfo).some(Boolean) ? data.localDepositInfo : null,
        }),
      });
      if (res.ok) {
        setMessage('Payment details saved successfully.');
        setTimeout(() => setMessage(''), 4000);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link href="/dashboard" className="text-stone-400 hover:text-stone-700 text-sm">← Dashboard</Link>
          <h1 className="font-black text-lg text-stone-900">Payment Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-stone-500 text-sm mb-6">
          Add your payment details so customers can pay you. You can set up multiple methods — buyers will see these options at checkout.
        </p>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
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

        <Card className="p-6">
          {activeTab === 'PayPal' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="font-bold text-stone-900">PayPal</h3>
                  <p className="text-stone-500 text-xs">Accept payments via PayPal. International-friendly.</p>
                </div>
              </div>
              <Input
                label="PayPal Email Address"
                type="email"
                value={data.paypalEmail}
                onChange={(e) => setData((p) => ({ ...p, paypalEmail: e.target.value }))}
                placeholder="your-paypal@email.com"
                hint="The email address linked to your PayPal account"
              />
            </div>
          )}

          {activeTab === 'Wire Transfer' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏦</span>
                <div>
                  <h3 className="font-bold text-stone-900">Wire Transfer / Bank Transfer</h3>
                  <p className="text-stone-500 text-xs">For international and domestic bank-to-bank payments.</p>
                </div>
              </div>
              <Input label="Bank Name" value={data.wireTransferInfo.bankName} onChange={(e) => updateWire('bankName', e.target.value)} placeholder="e.g. First Bank, Chase, Barclays" />
              <Input label="Account Holder Name" value={data.wireTransferInfo.accountName} onChange={(e) => updateWire('accountName', e.target.value)} placeholder="Name on the account" />
              <Input label="Account Number / IBAN" value={data.wireTransferInfo.accountNumber} onChange={(e) => updateWire('accountNumber', e.target.value)} placeholder="Account number or IBAN" />
              <Input label="Routing Number" value={data.wireTransferInfo.routingNumber} onChange={(e) => updateWire('routingNumber', e.target.value)} placeholder="For US banks (ABA routing number)" hint="Leave blank if not applicable" />
              <Input label="SWIFT / BIC Code" value={data.wireTransferInfo.swiftCode} onChange={(e) => updateWire('swiftCode', e.target.value)} placeholder="e.g. AAAABBCC123" hint="Required for international transfers" />
              <Input label="IBAN (Europe/Middle East)" value={data.wireTransferInfo.iban} onChange={(e) => updateWire('iban', e.target.value)} placeholder="e.g. GB29NWBK60161331926819" hint="Required for SEPA transfers" />
            </div>
          )}

          {activeTab === 'Local Deposit' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏧</span>
                <div>
                  <h3 className="font-bold text-stone-900">Local Bank Deposit</h3>
                  <p className="text-stone-500 text-xs">For buyers who want to deposit directly at your local bank.</p>
                </div>
              </div>
              <Input label="Bank Name" value={data.localDepositInfo.bankName} onChange={(e) => updateLocal('bankName', e.target.value)} placeholder="e.g. GTBank, UBA, Equity Bank" />
              <Input label="Account Holder Name" value={data.localDepositInfo.accountName} onChange={(e) => updateLocal('accountName', e.target.value)} placeholder="Name on the account" />
              <Input label="Account Number" value={data.localDepositInfo.accountNumber} onChange={(e) => updateLocal('accountNumber', e.target.value)} placeholder="Your account number" />
              <Input label="Branch Code / Sort Code" value={data.localDepositInfo.branchCode} onChange={(e) => updateLocal('branchCode', e.target.value)} placeholder="Branch or sort code" hint="Leave blank if not required" />
              <Input label="Payment Reference" value={data.localDepositInfo.reference} onChange={(e) => updateLocal('reference', e.target.value)} placeholder="e.g. Your business name" hint="Buyers should use this as the payment reference" />
            </div>
          )}
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            Save Payment Details
          </Button>
        </div>
      </main>
    </div>
  );
}
