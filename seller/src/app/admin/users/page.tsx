'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Card';
import { ALL_COUNTRIES, cn } from '@/lib/utils';

interface AdminProfile {
  title?: string | null;
  phoneNumber?: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
}

interface SellerProfile {
  id: string;
  sellerType: string;
  mobileNo: string;
  businessName: string;
  businessLicense?: string | null;
  businessAddress: string;
  country: string;
  countryCode: string;
  availableFabrics: string[];
  designFabrics: string[];
  sendSamples: boolean;
  status: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER';
  createdAt: string;
  adminProfile?: AdminProfile | null;
  seller?: SellerProfile | null;
}

type FormMode = 'create-seller' | 'create-admin' | 'edit';

type UserFormState = {
  mode: FormMode;
  userId?: string;
  role: 'ADMIN' | 'SELLER';
  email: string;
  password: string;
  name: string;
  sellerType: string;
  mobileNo: string;
  businessName: string;
  businessLicense: string;
  businessAddress: string;
  country: string;
  countryCode: string;
  availableFabrics: string;
  designFabrics: string;
  sendSamples: boolean;
  sellerStatus: string;
  title: string;
  phoneNumber: string;
  isSuperAdmin: boolean;
  isActive: boolean;
};

const ROLE_TABS = [
  { label: 'All Users', value: '' },
  { label: '👑 Admins', value: 'ADMIN' },
  { label: '🏪 Sellers', value: 'SELLER' },
];

const INITIAL_FORM: UserFormState = {
  mode: 'create-seller',
  role: 'SELLER',
  email: '',
  password: '',
  name: '',
  sellerType: 'FASHION_DESIGNER',
  mobileNo: '',
  businessName: '',
  businessLicense: '',
  businessAddress: '',
  country: '',
  countryCode: '',
  availableFabrics: '',
  designFabrics: '',
  sendSamples: false,
  sellerStatus: 'PENDING',
  title: '',
  phoneNumber: '',
  isSuperAdmin: false,
  isActive: true,
};

function arrayFromList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [viewerIsSuperAdmin, setViewerIsSuperAdmin] = useState(false);
  const [form, setForm] = useState<UserFormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), search });
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (cancelled) return;

      setUsers(data.users || []);
      setTotal(data.total || 0);
      setViewerIsSuperAdmin(Boolean(data.viewerIsSuperAdmin));
      setLoading(false);
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [page, search, roleFilter]);

  const formTitle = useMemo(() => {
    if (form.mode === 'create-admin') return 'Create Admin User';
    if (form.mode === 'create-seller') return 'Create Seller User';
    return `Edit ${form.role === 'ADMIN' ? 'Admin' : 'Seller'} User`;
  }, [form.mode, form.role]);

  function openCreateSeller() {
    setForm({ ...INITIAL_FORM, mode: 'create-seller', role: 'SELLER' });
    setShowForm(true);
    setMessage('');
  }

  function openCreateAdmin() {
    setForm({
      ...INITIAL_FORM,
      mode: 'create-admin',
      role: 'ADMIN',
      isActive: true,
    });
    setShowForm(true);
    setMessage('');
  }

  function openEdit(user: UserRecord) {
    setForm({
      mode: 'edit',
      userId: user.id,
      role: user.role,
      email: user.email,
      password: '',
      name: user.name || '',
      sellerType: user.seller?.sellerType || 'FASHION_DESIGNER',
      mobileNo: user.seller?.mobileNo || '',
      businessName: user.seller?.businessName || '',
      businessLicense: user.seller?.businessLicense || '',
      businessAddress: user.seller?.businessAddress || '',
      country: user.seller?.country || '',
      countryCode: user.seller?.countryCode || '',
      availableFabrics: user.seller?.availableFabrics.join(', ') || '',
      designFabrics: user.seller?.designFabrics.join(', ') || '',
      sendSamples: Boolean(user.seller?.sendSamples),
      sellerStatus: user.seller?.status || 'PENDING',
      title: user.adminProfile?.title || '',
      phoneNumber: user.adminProfile?.phoneNumber || '',
      isSuperAdmin: Boolean(user.adminProfile?.isSuperAdmin),
      isActive: user.adminProfile?.isActive ?? true,
    });
    setShowForm(true);
    setMessage('');
  }

  async function refreshUsers() {
    const params = new URLSearchParams({ page: String(page), search });
    if (roleFilter) params.set('role', roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setViewerIsSuperAdmin(Boolean(data.viewerIsSuperAdmin));
  }

  async function updateSellerStatus(userId: string, sellerStatus: string) {
    setUpdating(userId);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sellerStatus }),
    });
    await refreshUsers();
    setUpdating(null);
  }

  async function saveUser() {
    setSaving(true);
    setMessage('');

    const payload = form.role === 'SELLER'
      ? {
          kind: 'seller',
          email: form.email,
          password: form.password,
          name: form.name,
          sellerType: form.sellerType,
          mobileNo: form.mobileNo,
          businessName: form.businessName,
          businessLicense: form.businessLicense,
          businessAddress: form.businessAddress,
          country: form.country,
          countryCode: form.countryCode,
          availableFabrics: arrayFromList(form.availableFabrics),
          designFabrics: arrayFromList(form.designFabrics),
          sendSamples: form.sendSamples,
          sellerStatus: form.sellerStatus,
        }
      : {
          kind: 'admin',
          email: form.email,
          password: form.password,
          name: form.name,
          title: form.title,
          phoneNumber: form.phoneNumber,
          isSuperAdmin: form.isSuperAdmin,
          isActive: form.isActive,
        };

    const url = form.mode === 'edit' ? `/api/admin/users/${form.userId}` : '/api/admin/users';
    const method = form.mode === 'edit' ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || 'Unable to save user');
      setSaving(false);
      return;
    }

    setShowForm(false);
    setForm(INITIAL_FORM);
    setMessage('User saved successfully.');
    setSaving(false);
    await refreshUsers();
  }

  async function resetPassword(user: UserRecord) {
    const newPassword = window.prompt(`Enter a new password for ${user.email}`);
    if (!newPassword) return;

    const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();

    setMessage(res.ok ? 'Password reset successfully.' : data.error || 'Password reset failed');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link href="/admin" className="text-stone-400 hover:text-white">← Admin</Link>
          <h1 className="font-black text-lg">User Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {message && (
          <div className={cn(
            'p-4 rounded-xl text-sm border',
            message.toLowerCase().includes('success')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          )}>
            {message}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-black text-stone-900">All Users</h2>
            <p className="text-stone-500 text-sm">{total} total users</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              placeholder="Search by name, email or business..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-72"
            />
            <Button onClick={openCreateSeller}>+ Add Seller</Button>
            {viewerIsSuperAdmin && (
              <Button variant="outline" onClick={openCreateAdmin}>+ Add Admin</Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 border-b border-stone-200">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setRoleFilter(tab.value); setPage(1); }}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                roleFilter === tab.value
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {showForm && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-stone-900">{formTitle}</h3>
                <p className="text-sm text-stone-500">
                  {form.role === 'SELLER'
                    ? 'Manage seller registration and approval details.'
                    : 'Manage admin identity and permissions.'}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Close</Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              <Input label="Full Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              {form.mode !== 'edit' && (
                <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
              )}
              {form.role === 'ADMIN' ? (
                <>
                  <Input label="Job Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                  <Input label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} />
                  {viewerIsSuperAdmin && (
                    <>
                      <label className="flex items-center gap-3 text-sm text-stone-700">
                        <input type="checkbox" checked={form.isSuperAdmin} onChange={(e) => setForm((prev) => ({ ...prev, isSuperAdmin: e.target.checked }))} />
                        Super admin access
                      </label>
                      <label className="flex items-center gap-3 text-sm text-stone-700">
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
                        Account active
                      </label>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Select
                    label="Seller Type"
                    value={form.sellerType}
                    onChange={(e) => setForm((prev) => ({ ...prev, sellerType: e.target.value }))}
                    options={[
                      { value: 'FASHION_DESIGNER', label: 'Fashion Designer' },
                      { value: 'FABRIC_SELLER', label: 'Fabric Seller' },
                    ]}
                  />
                  <Input label="Mobile Number" value={form.mobileNo} onChange={(e) => setForm((prev) => ({ ...prev, mobileNo: e.target.value }))} />
                  <Input label="Business Name" value={form.businessName} onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))} />
                  <Input label="Business License" value={form.businessLicense} onChange={(e) => setForm((prev) => ({ ...prev, businessLicense: e.target.value }))} />
                  <Input label="Business Address" value={form.businessAddress} onChange={(e) => setForm((prev) => ({ ...prev, businessAddress: e.target.value }))} />
                  <Select
                    label="Country"
                    value={form.country}
                    onChange={(e) => {
                      const selectedCountry = ALL_COUNTRIES.find((country) => country.code === e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                        countryCode: selectedCountry?.dialCode || prev.countryCode,
                      }));
                    }}
                    options={ALL_COUNTRIES.map((country) => ({ value: country.code, label: country.name }))}
                    placeholder="Choose country"
                  />
                  <Input label="Country Dial Code" value={form.countryCode} onChange={(e) => setForm((prev) => ({ ...prev, countryCode: e.target.value }))} />
                  <Input label="Available Fabrics" value={form.availableFabrics} onChange={(e) => setForm((prev) => ({ ...prev, availableFabrics: e.target.value }))} hint="Comma-separated list" />
                  <Input label="Design Fabrics" value={form.designFabrics} onChange={(e) => setForm((prev) => ({ ...prev, designFabrics: e.target.value }))} hint="Comma-separated list" />
                  <Select
                    label="Seller Status"
                    value={form.sellerStatus}
                    onChange={(e) => setForm((prev) => ({ ...prev, sellerStatus: e.target.value }))}
                    options={[
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'APPROVED', label: 'Approved' },
                      { value: 'REJECTED', label: 'Rejected' },
                      { value: 'SUSPENDED', label: 'Suspended' },
                    ]}
                  />
                  <label className="flex items-center gap-3 text-sm text-stone-700">
                    <input type="checkbox" checked={form.sendSamples} onChange={(e) => setForm((prev) => ({ ...prev, sendSamples: e.target.checked }))} />
                    Can send samples
                  </label>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={saveUser} loading={saving}>Save User</Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">User</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Role</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Details</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Joined</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-stone-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-stone-400">No users found</td></tr>
                ) : users.map((user) => (
                  <tr key={user.id} className={cn('hover:bg-stone-50', user.role === 'ADMIN' && 'bg-amber-50/30')}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{user.name || '—'}</p>
                      <p className="text-stone-500 text-xs">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'ADMIN' ? 'danger' : 'info'}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'SELLER' && user.seller ? (
                        <div>
                          <p className="font-medium text-stone-800">{user.seller.businessName}</p>
                          <p className="text-stone-500 text-xs">{user.seller.country} • {user.seller.mobileNo}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-stone-800">{user.adminProfile?.title || 'Admin account'}</p>
                          <p className="text-stone-500 text-xs">
                            {user.adminProfile?.isSuperAdmin ? 'Super Admin' : 'Admin'} • {user.adminProfile?.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'SELLER' && user.seller ? (
                        <Badge variant={
                          user.seller.status === 'APPROVED' ? 'success' :
                          user.seller.status === 'PENDING' ? 'warning' :
                          user.seller.status === 'REJECTED' ? 'danger' : 'default'
                        }>
                          {user.seller.status}
                        </Badge>
                      ) : (
                        <Badge variant={user.adminProfile?.isActive ? 'success' : 'default'}>
                          {user.adminProfile?.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(user.role === 'SELLER' || viewerIsSuperAdmin) && (
                          <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                            Edit
                          </Button>
                        )}
                        {viewerIsSuperAdmin && (
                          <Button size="sm" variant="ghost" onClick={() => resetPassword(user)}>
                            Reset Password
                          </Button>
                        )}
                        {user.seller && user.seller.status === 'PENDING' && (
                          <>
                            <Button size="sm" variant="success" loading={updating === user.id} onClick={() => updateSellerStatus(user.id, 'APPROVED')}>
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" loading={updating === user.id} onClick={() => updateSellerStatus(user.id, 'REJECTED')}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
            <p className="text-stone-500 text-sm">Showing {users.length} of {total}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ← Prev
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={users.length < 20}>
                Next →
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
