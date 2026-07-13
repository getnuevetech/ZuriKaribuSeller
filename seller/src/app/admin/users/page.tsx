'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  seller?: {
    id: string;
    sellerType: string;
    businessName: string;
    country: string;
    status: string;
  };
}

const ROLE_TABS = [
  { label: 'All Users', value: '' },
  { label: '👑 Admins', value: 'ADMIN' },
  { label: '🏪 Sellers', value: 'SELLER' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), search });
    if (roleFilter) params.set('role', roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  async function updateSellerStatus(userId: string, sellerStatus: string) {
    setUpdating(userId);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sellerStatus }),
    });
    await fetchUsers();
    setUpdating(null);
  }

  function handleTabChange(value: string) {
    setRoleFilter(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link href="/admin" className="text-stone-400 hover:text-white">← Admin</Link>
          <h1 className="font-black text-lg">User Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-stone-900">All Users</h2>
            <p className="text-stone-500 text-sm">{total} total users</p>
          </div>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-72"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-stone-200">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
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

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">User</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Role</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Business</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Country</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Joined</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-stone-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-stone-400">No users found</td></tr>
                ) : users.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      'hover:bg-stone-50',
                      user.role === 'ADMIN' && 'bg-amber-50/40 hover:bg-amber-50'
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'ADMIN' && <span title="Admin">👑</span>}
                        <div>
                          <p className="font-medium text-stone-900">{user.name || '—'}</p>
                          <p className="text-stone-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'ADMIN' ? 'danger' : 'info'}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.seller ? (
                        <div>
                          <p className="font-medium text-stone-800">{user.seller.businessName}</p>
                          <p className="text-stone-500 text-xs">
                            {user.seller.sellerType === 'FASHION_DESIGNER' ? '👗 Designer' : '🧵 Fabric Seller'}
                          </p>
                        </div>
                      ) : user.role === 'ADMIN' ? (
                        <span className="text-stone-400 text-xs italic">Admin account</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-stone-600">{user.seller?.country || '—'}</td>
                    <td className="px-6 py-4">
                      {user.seller && (
                        <Badge variant={
                          user.seller.status === 'APPROVED' ? 'success' :
                          user.seller.status === 'PENDING' ? 'warning' :
                          user.seller.status === 'REJECTED' ? 'danger' : 'default'
                        }>
                          {user.seller.status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {user.seller && user.seller.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            loading={updating === user.id}
                            onClick={() => updateSellerStatus(user.id, 'APPROVED')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={updating === user.id}
                            onClick={() => updateSellerStatus(user.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {user.seller && user.seller.status === 'APPROVED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSellerStatus(user.id, 'SUSPENDED')}
                        >
                          Suspend
                        </Button>
                      )}
                      {user.seller && user.seller.status === 'SUSPENDED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSellerStatus(user.id, 'APPROVED')}
                        >
                          Reinstate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
