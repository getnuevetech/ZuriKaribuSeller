'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { cn, FABRIC_OPTIONS, ALL_COUNTRIES } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Account Setup', desc: 'Create your login credentials' },
  { id: 2, title: 'Business Info', desc: 'Tell us about your business' },
  { id: 3, title: 'Fabrics & Products', desc: 'What do you sell?' },
  { id: 4, title: 'Review & Submit', desc: 'Confirm your details' },
];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  sellerType: string;
  name: string;
  countryCode: string;
  mobileNo: string;
  businessName: string;
  businessLicense: string;
  businessAddress: string;
  country: string;
  availableFabrics: string[];
  designFabrics: string[];
  sendSamples: boolean;
}

const INITIAL_FORM: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  sellerType: '',
  name: '',
  countryCode: '',
  mobileNo: '',
  businessName: '',
  businessLicense: '',
  businessAddress: '',
  country: '',
  availableFabrics: [],
  designFabrics: [],
  sendSamples: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function updateField(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function toggleFabric(type: 'availableFabrics' | 'designFabrics', fabric: string) {
    setForm((prev) => {
      const current = prev[type];
      return {
        ...prev,
        [type]: current.includes(fabric)
          ? current.filter((f) => f !== fabric)
          : [...current, fabric],
      };
    });
  }

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!form.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
      if (!form.password) newErrors.password = 'Password is required';
      else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (s === 2) {
      if (!form.sellerType) newErrors.sellerType = 'Please select seller type';
      if (!form.name) newErrors.name = 'Full name is required';
      if (!form.mobileNo) newErrors.mobileNo = 'Mobile number is required';
      if (!form.businessName) newErrors.businessName = 'Business name is required';
      if (!form.businessAddress) newErrors.businessAddress = 'Business address is required';
      if (!form.country) newErrors.country = 'Country is required';
    }

    if (s === 3) {
      if (form.availableFabrics.length === 0) newErrors.availableFabrics = 'Select at least one fabric';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setLoading(true);
    setSubmitError('');

    const selectedCountry = ALL_COUNTRIES.find((c) => c.code === form.country);

    try {
      const res = await fetch('/api/sellers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          countryCode: selectedCountry?.dialCode || '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push('/dashboard');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  }

  const selectedCountry = ALL_COUNTRIES.find((c) => c.code === form.country);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white font-black text-xl">Z</span>
            </div>
            <span className="text-white text-2xl font-black">ZuriKaribu</span>
          </Link>
          <p className="text-stone-400 mt-3">Join thousands of African fashion sellers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    step > s.id && 'bg-green-500 text-white',
                    step === s.id && 'bg-amber-500 text-white ring-4 ring-amber-500/30',
                    step < s.id && 'bg-stone-700 text-stone-400'
                  )}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={cn('text-xs mt-1 hidden md:block', step === s.id ? 'text-amber-400' : 'text-stone-500')}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2', step > s.id ? 'bg-green-500' : 'bg-stone-700')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Step Header */}
          <div className="bg-amber-500 px-8 py-6">
            <h2 className="text-xl font-black text-white">{STEPS[step - 1].title}</h2>
            <p className="text-amber-100 text-sm mt-1">{STEPS[step - 1].desc}</p>
          </div>

          <div className="p-8">
            {/* Step 1: Account Setup */}
            {step === 1 && (
              <div className="space-y-5">
                <Button
                  onClick={handleGoogle}
                  loading={googleLoading}
                  variant="outline"
                  size="lg"
                  className="w-full border-stone-200 text-stone-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                <div className="flex items-center gap-4">
                  <hr className="flex-1 border-stone-200" />
                  <span className="text-stone-400 text-sm">or create an account</span>
                  <hr className="flex-1 border-stone-200" />
                </div>
                <Input label="Email Address" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} error={errors.email} placeholder="you@example.com" required />
                <Input label="Password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} error={errors.password} placeholder="At least 8 characters" required hint="Minimum 8 characters" />
                <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} error={errors.confirmPassword} placeholder="Repeat password" required />
              </div>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <div className="space-y-5">
                <Select
                  label="Seller Type"
                  value={form.sellerType}
                  onChange={(e) => updateField('sellerType', e.target.value)}
                  error={errors.sellerType}
                  required
                  placeholder="Select your seller type"
                  options={[
                    { value: 'FASHION_DESIGNER', label: '👗 Fashion Designer' },
                    { value: 'FABRIC_SELLER', label: '🧵 Fabric Seller' },
                  ]}
                />
                <Input label="Full Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} error={errors.name} placeholder="Your full name" required />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-stone-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={form.country}
                      onChange={(e) => {
                        const c = ALL_COUNTRIES.find((cc) => cc.code === e.target.value);
                        updateField('country', e.target.value);
                        updateField('countryCode', c?.dialCode || '');
                      }}
                      placeholder="Country"
                      options={ALL_COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.dialCode})` }))}
                      className="w-64"
                    />
                    <Input
                      value={form.mobileNo}
                      onChange={(e) => updateField('mobileNo', e.target.value)}
                      error={errors.mobileNo}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  </div>
                  {errors.mobileNo && <p className="text-xs text-red-500">{errors.mobileNo}</p>}
                </div>
                <Input label="Business Name" value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} error={errors.businessName} placeholder="Your business or brand name" required />
                <Input label="Business License Number" value={form.businessLicense} onChange={(e) => updateField('businessLicense', e.target.value)} placeholder="Optional — registration number if available" hint="Optional but recommended for verification" />
                <Textarea label="Business Address" value={form.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)} error={errors.businessAddress} placeholder="Street, City, State/Province" required rows={3} />
                {!form.country && (
                  <Select
                    label="Country"
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    error={errors.country}
                    required
                    placeholder="Select country"
                    options={ALL_COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
                  />
                )}
              </div>
            )}

            {/* Step 3: Fabrics & Products */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    What fabrics are available in your country? <span className="text-red-500">*</span>
                  </label>
                  {errors.availableFabrics && <p className="text-xs text-red-500 mb-2">{errors.availableFabrics}</p>}
                  <div className="flex flex-wrap gap-2">
                    {FABRIC_OPTIONS.map((fabric) => (
                      <button
                        key={fabric}
                        type="button"
                        onClick={() => toggleFabric('availableFabrics', fabric)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm border transition-all',
                          form.availableFabrics.includes(fabric)
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-stone-200 text-stone-600 hover:border-amber-300'
                        )}
                      >
                        {fabric}
                      </button>
                    ))}
                  </div>
                </div>

                {form.sellerType === 'FASHION_DESIGNER' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-3">
                      What fabrics do you use for your designs?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FABRIC_OPTIONS.map((fabric) => (
                        <button
                          key={fabric}
                          type="button"
                          onClick={() => toggleFabric('designFabrics', fabric)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm border transition-all',
                            form.designFabrics.includes(fabric)
                              ? 'bg-stone-800 border-stone-800 text-white'
                              : 'border-stone-200 text-stone-600 hover:border-stone-400'
                          )}
                        >
                          {fabric}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Are you willing to send sample designs for online sales?
                  </label>
                  <div className="flex gap-4">
                    {[{ val: true, label: '✅ Yes, I can send samples' }, { val: false, label: '❌ No, not at this time' }].map(({ val, label }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateField('sendSamples', val)}
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all',
                          form.sendSamples === val
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.sendSamples && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-sm font-medium">📦 Great!</p>
                    <p className="text-amber-700 text-sm mt-1">
                      You&apos;ll be able to upload product images for your sample designs in your seller dashboard after registration.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {submitError}
                  </div>
                )}
                <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
                  <ReviewItem label="Email" value={form.email} />
                  <ReviewItem label="Seller Type" value={form.sellerType === 'FASHION_DESIGNER' ? '👗 Fashion Designer' : '🧵 Fabric Seller'} />
                  <ReviewItem label="Name" value={form.name} />
                  <ReviewItem label="Mobile" value={`${selectedCountry?.dialCode || ''} ${form.mobileNo}`} />
                  <ReviewItem label="Business Name" value={form.businessName} />
                  {form.businessLicense && <ReviewItem label="Business License" value={form.businessLicense} />}
                  <ReviewItem label="Country" value={ALL_COUNTRIES.find((c) => c.code === form.country)?.name || form.country} />
                  <ReviewItem label="Business Address" value={form.businessAddress} />
                  <ReviewItem label="Available Fabrics" value={form.availableFabrics.join(', ')} />
                  {form.designFabrics.length > 0 && <ReviewItem label="Design Fabrics" value={form.designFabrics.join(', ')} />}
                  <ReviewItem label="Send Samples" value={form.sendSamples ? 'Yes' : 'No'} />
                </div>
                <p className="text-stone-500 text-xs text-center">
                  By registering, you agree to ZuriKaribu&apos;s Terms of Service and Privacy Policy.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
              {step > 1 ? (
                <Button variant="ghost" onClick={prevStep} className="text-stone-600">
                  ← Back
                </Button>
              ) : (
                <div />
              )}
              {step < 4 ? (
                <Button onClick={nextStep} size="lg">
                  Continue →
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={loading} size="lg">
                  Complete Registration 🎉
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-stone-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-stone-500 text-sm">{label}</span>
      <span className="text-stone-800 text-sm font-medium text-right">{value}</span>
    </div>
  );
}
