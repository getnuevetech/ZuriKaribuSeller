'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface AppSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  description?: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'SELECT';
  category: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  general: '⚙️',
  pricing: '💰',
  products: '📦',
  platforms: '🔗',
  ai: '🤖',
  sellers: '🏪',
  legal: '📜',
  landing: '🏠',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [newSetting, setNewSetting] = useState({ key: '', value: '', label: '', description: '', type: 'TEXT', category: 'general' });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchSettings = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    const s = data.settings || [];
    setSettings(s);
    const vals: Record<string, string> = {};
    s.forEach((setting: AppSetting) => { vals[setting.key] = setting.value; });
    setLocalValues(vals);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  async function saveSettings() {
    setSaving(true);
    setMessage('');
    const updated = settings.map((s) => ({ ...s, value: localValues[s.key] ?? s.value }));
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: updated }),
    });
    setMessage('Settings saved successfully!');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  }

  async function addSetting() {
    if (!newSetting.key || !newSetting.value || !newSetting.label) return;
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSetting),
    });
    setNewSetting({ key: '', value: '', label: '', description: '', type: 'TEXT', category: 'general' });
    setShowAddForm(false);
    await fetchSettings(true);
  }

  const categories = [...new Set(settings.map((s) => s.category))];

  function renderSettingInput(setting: AppSetting) {
    const value = localValues[setting.key] ?? setting.value;

    if (setting.type === 'BOOLEAN') {
      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocalValues((p) => ({ ...p, [setting.key]: value === 'true' ? 'false' : 'true' }))}
            className={cn(
              'w-12 h-6 rounded-full transition-colors relative',
              value === 'true' ? 'bg-amber-500' : 'bg-stone-200'
            )}
          >
            <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow', value === 'true' ? 'left-7' : 'left-1')} />
          </button>
          <span className="text-sm text-stone-600">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
        </div>
      );
    }

    if (setting.type === 'JSON') {
      return (
        <Textarea
          value={value}
          onChange={(e) => setLocalValues((p) => ({ ...p, [setting.key]: e.target.value }))}
          rows={10}
          className="font-mono text-xs"
        />
      );
    }

    if (
      setting.key === 'user_agreement_content' ||
      (setting.category === 'landing' && value.length > 80 && !setting.key.endsWith('_href') && !setting.key.endsWith('_url'))
    ) {
      return (
        <Textarea
          value={value}
          onChange={(e) => setLocalValues((p) => ({ ...p, [setting.key]: e.target.value }))}
          rows={setting.key === 'user_agreement_content' ? 16 : 6}
          className="text-sm"
        />
      );
    }

    return (
      <Input
        type={setting.type === 'NUMBER' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setLocalValues((p) => ({ ...p, [setting.key]: e.target.value }))}
        step={setting.type === 'NUMBER' ? '0.01' : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-stone-400 hover:text-white">← Admin</Link>
            <h1 className="font-black text-lg">App Settings</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="border-stone-600 text-stone-300">
              + Add Setting
            </Button>
            <Button onClick={saveSettings} loading={saving} size="sm">
              Save All Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✅ {message}
          </div>
        )}

        {/* Add New Setting Form */}
        {showAddForm && (
          <Card className="mb-8 p-6">
            <h3 className="font-bold text-stone-900 mb-4">Add Custom Setting</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Key (unique identifier)" value={newSetting.key} onChange={(e) => setNewSetting((p) => ({ ...p, key: e.target.value }))} placeholder="e.g. featured_banner_text" />
              <Input label="Label (display name)" value={newSetting.label} onChange={(e) => setNewSetting((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Featured Banner Text" />
              <Input label="Value" value={newSetting.value} onChange={(e) => setNewSetting((p) => ({ ...p, value: e.target.value }))} placeholder="Setting value" />
              <Input label="Description (optional)" value={newSetting.description} onChange={(e) => setNewSetting((p) => ({ ...p, description: e.target.value }))} placeholder="What does this setting do?" />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={addSetting} size="sm">Add Setting</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading settings...</div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category] || '📋'}</span>
                  <span className="capitalize">{category}</span>
                </h2>
                <Card>
                  <div className="divide-y divide-stone-50">
                    {settings.filter((s) => s.category === category).map((setting) => (
                      <div key={setting.key} className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <label className="font-medium text-stone-900 text-sm">{setting.label}</label>
                              <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono">
                                {setting.key}
                              </span>
                              <Badge variant="info">{setting.type}</Badge>
                            </div>
                            {setting.description && (
                              <p className="text-stone-500 text-xs mb-3">{setting.description}</p>
                            )}
                            <div className={cn('max-w-sm', setting.category === 'landing' && 'max-w-3xl')}>
                              {renderSettingInput(setting)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button onClick={saveSettings} loading={saving} size="lg">
            Save All Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
