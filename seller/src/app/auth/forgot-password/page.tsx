'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewLink, setPreviewLink] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setPreviewLink('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to start password reset');
      } else {
        setMessage(data.message || 'If the email exists, a reset link has been generated.');
        if (data.resetUrl) {
          setPreviewLink(data.resetUrl);
        }
      }
    } catch {
      setError('Unable to start password reset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="african-hero min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-stone-900">Reset your password</h1>
          <p className="text-sm text-stone-500 mt-2">
            Request a reset link for your seller or admin account.
          </p>
        </div>

        {message && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
        {previewLink && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 break-all">
            Preview reset link: <a href={previewLink} className="underline">{previewLink}</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send reset link
          </Button>
        </form>

        <p className="text-center text-stone-500 text-sm mt-6">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
