'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to reset password');
        setLoading(false);
        return;
      }

      router.push('/auth/login?reset=1');
    } catch {
      setError('Unable to reset password');
      setLoading(false);
    }
  }

  return (
    <div className="african-hero min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-stone-900">Choose a new password</h1>
          <p className="text-sm text-stone-500 mt-2">
            Set a new password for your account.
          </p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Reset password
          </Button>
        </form>

        <p className="text-center text-stone-500 text-sm mt-6">
          <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
