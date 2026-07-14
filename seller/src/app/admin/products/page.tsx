'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Card';

interface SellerOption {
  id: string;
  user: { email: string; name: string };
  seller: { id: string; businessName: string } | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  fabricsUsed: string[];
  costPrice: number;
  sellingPrice: number;
  platformPrice: number;
  status: string;
  aiOptimized: boolean;
  createdAt: string;
  images: { url: string; s3Key: string; isPrimary: boolean }[];
  seller: {
    id: string;
    name: string;
    businessName: string;
    user: { email: string; name: string };
  };
  platformProducts: {
    id: string;
    status: string;
    platformGateway: { platform: string };
  }[];
}

type ProductFormState = {
  id?: string;
  sellerId: string;
  name: string;
  description: string;
  fabricsUsed: string;
  costPrice: string;
  sellingPrice: string;
  status: string;
  images: string;
};

const INITIAL_FORM: ProductFormState = {
  sellerId: '',
  name: '',
  description: '',
  fabricsUsed: '',
  costPrice: '',
  sellingPrice: '',
  status: 'DRAFT',
  images: '',
};

function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseImageLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url) => ({ url, s3Key: url }));
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [pushing, setPushing] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      const [productsRes, sellersRes] = await Promise.all([
        fetch(`/api/admin/products?page=${page}&search=${search}`),
        fetch('/api/admin/users?role=SELLER&limit=200'),
      ]);

      const [productsData, sellersData] = await Promise.all([
        productsRes.json(),
        sellersRes.json(),
      ]);

      if (cancelled) return;

      setProducts(productsData.products || []);
      setTotal(productsData.total || 0);
      setSellers((sellersData.users || []).filter((user: SellerOption) => user.seller));
      setLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const sellerOptions = useMemo(() => sellers.map((seller) => ({
    value: seller.seller?.id || '',
    label: `${seller.seller?.businessName || seller.user.name} (${seller.user.email})`,
  })), [sellers]);

  async function refreshProducts() {
    const res = await fetch(`/api/admin/products?page=${page}&search=${search}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
  }

  async function pushToAllPlatforms(productId?: string) {
    const ids = productId ? [productId] : selected;
    if (ids.length === 0) return;

    setPushing(true);
    setPushMessage('');

    await fetch('/api/admin/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: ids, pushAll: true }),
    });
    setPushMessage(`Pushed ${ids.length} product(s) to all platforms`);
    setPushing(false);
    await refreshProducts();
  }

  async function updateProductStatus(productId: string, status: string) {
    await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await refreshProducts();
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    await refreshProducts();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function openCreate() {
    setForm(INITIAL_FORM);
    setFormMessage('');
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setForm({
      id: product.id,
      sellerId: product.seller.id,
      name: product.name,
      description: product.description,
      fabricsUsed: product.fabricsUsed.join(', '),
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      status: product.status,
      images: product.images.map((image) => image.url).join('\n'),
    });
    setFormMessage('');
    setShowForm(true);
  }

  async function saveProduct() {
    setSaving(true);
    setFormMessage('');

    const payload = {
      sellerId: form.sellerId,
      name: form.name,
      description: form.description,
      fabricsUsed: parseList(form.fabricsUsed),
      costPrice: form.costPrice,
      sellingPrice: form.sellingPrice,
      status: form.status,
      images: parseImageLines(form.images),
    };

    const res = await fetch(form.id ? `/api/admin/products/${form.id}` : '/api/admin/products', {
      method: form.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormMessage(data.error || 'Failed to save product');
      setSaving(false);
      return;
    }

    setForm(INITIAL_FORM);
    setFormMessage('Product saved successfully.');
    setShowForm(false);
    setSaving(false);
    await refreshProducts();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link href="/admin" className="text-stone-400 hover:text-white">← Admin</Link>
          <h1 className="font-black text-lg">Product Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-black text-stone-900">All Products</h2>
            <p className="text-stone-500 text-sm">{total} products</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
            <Button onClick={openCreate}>+ Add Product</Button>
            {selected.length > 0 && (
              <Button onClick={() => pushToAllPlatforms()} loading={pushing} variant="primary">
                🚀 Push {selected.length} to All Platforms
              </Button>
            )}
          </div>
        </div>

        {pushMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✅ {pushMessage}
          </div>
        )}

        {showForm && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900">{form.id ? 'Edit Product' : 'Create Product'}</h3>
                <p className="text-sm text-stone-500">Assign the product to a seller and manage all listing details from the admin portal.</p>
              </div>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Close</Button>
            </div>

            {formMessage && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                {formMessage}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Seller"
                value={form.sellerId}
                onChange={(e) => setForm((prev) => ({ ...prev, sellerId: e.target.value }))}
                options={sellerOptions}
                placeholder="Choose seller"
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
              />
              <Input label="Product Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              <Input label="Fabrics Used" value={form.fabricsUsed} onChange={(e) => setForm((prev) => ({ ...prev, fabricsUsed: e.target.value }))} hint="Comma-separated list" />
              <Input label="Cost Price" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))} />
              <Input label="Selling Price" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))} />
            </div>

            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
            />
            <Textarea
              label="Image URLs"
              value={form.images}
              onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
              rows={5}
              hint="One image URL per line"
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={saveProduct} loading={saving}>Save Product</Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => setSelected(e.target.checked ? products.map((p) => p.id) : [])}
                      checked={selected.length === products.length && products.length > 0}
                    />
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Product</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Seller</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Price</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Platforms</th>
                  <th className="text-left px-6 py-3 font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-stone-400">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-stone-400">No products found</td></tr>
                ) : products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : <div className="w-full h-full flex items-center justify-center text-xl">📸</div>}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{product.name}</p>
                          {product.aiOptimized && <span className="text-xs text-purple-600">🤖 AI optimized</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-stone-800 text-xs">{product.seller?.businessName || product.seller?.name}</p>
                      <p className="text-stone-500 text-xs">{product.seller?.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">${product.sellingPrice.toFixed(2)}</p>
                      <p className="text-xs text-stone-400">Platform: ${product.platformPrice.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        product.status === 'ACTIVE' ? 'success' :
                        product.status === 'DRAFT' ? 'warning' :
                        product.status === 'INACTIVE' ? 'default' : 'danger'
                      }>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.platformProducts.length === 0 ? (
                          <span className="text-stone-400 text-xs">None</span>
                        ) : product.platformProducts.map((pp) => (
                          <span
                            key={pp.id}
                            className={`text-xs px-1.5 py-0.5 rounded-full ${pp.status === 'PUSHED' || pp.status === 'UPDATED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {pp.platformGateway.platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => pushToAllPlatforms(product.id)}
                          loading={pushing}
                        >
                          🚀 Push All
                        </Button>
                        <div className="flex gap-1">
                          {product.status !== 'ACTIVE' && (
                            <Button size="sm" variant="success" onClick={() => updateProductStatus(product.id, 'ACTIVE')}>
                              Activate
                            </Button>
                          )}
                          {product.status === 'ACTIVE' && (
                            <Button size="sm" variant="ghost" onClick={() => updateProductStatus(product.id, 'INACTIVE')}>
                              Disable
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => deleteProduct(product.id)}>
                            Del
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
            <p className="text-stone-500 text-sm">Showing {products.length} of {total}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={products.length < 20}>Next →</Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
