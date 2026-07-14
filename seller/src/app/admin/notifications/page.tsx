'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SELLER_NOTIFICATION_EVENTS } from '@/lib/notification-settings';

type AppSetting = {
  key: string;
  value: string;
};

export default function AdminNotificationsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        const fetchedSettings = (data.settings || []) as AppSetting[];
        const next: Record<string, string> = {};
        fetchedSettings.forEach((setting) => {
          next[setting.key] = setting.value;
        });
        setSettings(next);
        setLoading(false);
      });
  }, []);

  const payload = useMemo(() => {
    const allowedKeys = new Set<string>(['notification_from_email']);
    SELLER_NOTIFICATION_EVENTS.forEach((event) => {
      allowedKeys.add(`${event.key}_enabled`);
      allowedKeys.add(`${event.key}_important`);
      allowedKeys.add(`${event.key}_subject`);
      allowedKeys.add(`${event.key}_template`);
    });

    return Object.entries(settings)
      .filter(([key]) => allowedKeys.has(key))
      .map(([key, value]) => ({ key, value }));
  }, [settings]);

  async function saveNotifications() {
    setSaving(true);
    setMessage('');
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: payload }),
    });
    setSaving(false);
    setMessage('Notification settings saved.');
    setTimeout(() => setMessage(''), 3000);
  }

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">Loading notifications...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-stone-400 hover:text-white">← Admin</Link>
            <h1 className="font-black text-lg">Seller Notifications</h1>
          </div>
          <Button onClick={saveNotifications} loading={saving} size="sm">
            Save Notifications
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {message && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{message}</div>}

        <Card className="p-6">
          <Input
            label="Notification Sender Email"
            value={settings.notification_from_email || ''}
            onChange={(event) => setSettings((prev) => ({ ...prev, notification_from_email: event.target.value }))}
            placeholder="no-reply@zurikaribu.com"
          />
        </Card>

        {SELLER_NOTIFICATION_EVENTS.map((event) => {
          const enabledKey = `${event.key}_enabled`;
          const importantKey = `${event.key}_important`;
          const subjectKey = `${event.key}_subject`;
          const templateKey = `${event.key}_template`;

          return (
            <Card key={event.key} className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">{event.label}</h2>
                <p className="text-sm text-stone-500">{event.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={settings[enabledKey] === 'true'}
                    onChange={(event) => setSettings((prev) => ({ ...prev, [enabledKey]: event.target.checked ? 'true' : 'false' }))}
                  />
                  Enable notification
                </label>
                <label className="flex items-center gap-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={settings[importantKey] === 'true'}
                    onChange={(event) => setSettings((prev) => ({ ...prev, [importantKey]: event.target.checked ? 'true' : 'false' }))}
                  />
                  Mark as important
                </label>
              </div>

              <Input
                label="Email Subject"
                value={settings[subjectKey] || ''}
                onChange={(event) => setSettings((prev) => ({ ...prev, [subjectKey]: event.target.value }))}
              />

              <Textarea
                label="Email Template"
                value={settings[templateKey] || ''}
                onChange={(event) => setSettings((prev) => ({ ...prev, [templateKey]: event.target.value }))}
                rows={10}
              />
            </Card>
          );
        })}
      </main>
    </div>
  );
}
