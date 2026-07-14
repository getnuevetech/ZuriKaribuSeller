'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type ActivationState = 'loading' | 'success' | 'error';

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ActivationState>('loading');
  const [message, setMessage] = useState('Activating your account...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setState('error');
      setMessage('This activation link is incomplete.');
      return;
    }

    fetch('/api/auth/activate-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { message?: string; error?: string };
        if (!res.ok) {
          throw new Error(data.error || 'Activation failed');
        }

        setState('success');
        setMessage(data.message || 'Your account is now active.');
      })
      .catch((error: unknown) => {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Activation failed');
      });
  }, [searchParams]);

  return (
    <div className="african-hero min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
        <h1 className="text-2xl font-black text-stone-900 mb-4">Account Activation</h1>
        <p
          className={`mb-6 text-sm ${
            state === 'success' ? 'text-green-700' : state === 'error' ? 'text-red-600' : 'text-stone-500'
          }`}
        >
          {message}
        </p>

        <Link href="/auth/login">
          <Button size="lg" className="w-full">
            Go to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
