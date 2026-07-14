'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { getPlatformCredentialFields, PLATFORM_INFO, ALL_PLATFORM_NAMES, type PlatformName } from '@/lib/platform-utils';

interface PlatformGateway {
  id: string;
  platform: PlatformName;
  enabled: boolean;
  credentials: Record<string, string>;
  createdAt: string;
  _count: { platformProducts: number };
}

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformGateway[]>([]);
  const [editing, setEditing] = useState<PlatformName | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchPlatforms() {
    const res = await fetch('/api/admin/platforms');
    const data = await res.json();
    setPlatforms(data.platforms || []);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPlatforms() {
      const res = await fetch('/api/admin/platforms');
      const data = await res.json();

      if (!cancelled) {
        setPlatforms(data.platforms || []);
      }
    }

    void loadPlatforms();

    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(platform: PlatformName, existingCreds: Record<string, string>) {
    setEditing(platform);
    setCredentials(existingCreds);
  }

  async function savePlatform(platform: PlatformName, enabled: boolean) {
    setSaving(true);
    setMessage('');

    const existing = platforms.find((p) => p.platform === platform);

    if (existing) {
      await fetch(`/api/admin/platforms/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials, enabled }),
      });
    } else {
      await fetch('/api/admin/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials, enabled }),
      });
    }

    setMessage(`${platform} configuration saved!`);
    setEditing(null);
    await fetchPlatforms();
    setSaving(false);
  }

  async function toggleEnabled(platform: PlatformGateway) {
    await fetch(`/api/admin/platforms/${platform.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !platform.enabled }),
    });
    await fetchPlatforms();
  }

  const allPlatforms = ALL_PLATFORM_NAMES;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link href="/admin" className="text-stone-400 hover:text-white">← Admin</Link>
          <h1 className="font-black text-lg">Platform Gateway</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-black text-stone-900">Social Media Platforms</h2>
          <p className="text-stone-500 mt-1">Configure API credentials for each platform to enable product publishing.</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✅ {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {allPlatforms.map((platform) => {
            const info = PLATFORM_INFO[platform];
            const gatewayData = platforms.find((p) => p.platform === platform);
            const fields = getPlatformCredentialFields(platform);

            return (
              <Card key={platform} className="overflow-hidden">
                {/* Platform Header */}
                <div className={`bg-gradient-to-r ${info.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{info.emoji}</span>
                      <div>
                        <h3 className="text-lg font-black">{info.name}</h3>
                        <p className="text-white/70 text-sm">
                          {gatewayData ? `${gatewayData._count.platformProducts} products pushed` : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    {gatewayData && (
                      <button
                        onClick={() => toggleEnabled(gatewayData)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          gatewayData.enabled
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/70'
                        }`}
                      >
                        {gatewayData.enabled ? '✅ Enabled' : '⏸ Disabled'}
                      </button>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  {editing === platform ? (
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <div key={field.key}>
                          {field.type === 'password' ? (
                            <Input
                              label={field.label}
                              type="password"
                              value={credentials[field.key] || ''}
                              onChange={(e) => setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.required ? 'Required' : 'Optional'}
                              hint={field.description}
                              required={field.required}
                            />
                          ) : (
                            <Input
                              label={field.label}
                              type="text"
                              value={credentials[field.key] || ''}
                              onChange={(e) => setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.required ? 'Required' : 'Optional'}
                              hint={field.description}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => savePlatform(platform, true)}
                          loading={saving}
                          className="flex-1"
                        >
                          Save Configuration
                        </Button>
                        <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {gatewayData ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-sm">✅ Credentials configured</span>
                          </div>
                          <p className="text-stone-500 text-sm">
                            {fields.length} credential{fields.length !== 1 ? 's' : ''} stored securely.
                            Keys are hidden for security.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(platform, gatewayData.credentials)}
                            className="w-full"
                          >
                            Update Credentials
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-stone-500 text-sm">
                            No credentials configured. Add API credentials to enable publishing to {info.name}.
                          </p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => startEdit(platform, {})}
                            className="w-full"
                          >
                            Configure {info.name}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <Card className="mt-8 p-6">
          <h3 className="font-bold text-stone-900 mb-3">📖 Integration Guide</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-stone-600">
            <div>
              <p className="font-semibold text-stone-800 mb-2">📸 Instagram / 👍 Facebook</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Meta Business Manager</li>
                <li>Create a Meta App with Instagram Basic Display API</li>
                <li>Generate a Page Access Token for your Facebook Page</li>
                <li>Note your Instagram Business Account ID</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold text-stone-800 mb-2">🎵 TikTok</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Register at TikTok for Developers</li>
                <li>Create an app with Content Posting API access</li>
                <li>Get your Access Token and Open ID</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold text-stone-800 mb-2">🛒 eBay</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Register at eBay Developers Program</li>
                <li>Create a production application</li>
                <li>Complete OAuth authorization to get Access Token</li>
              </ol>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
