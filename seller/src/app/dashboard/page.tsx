import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Card';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        where: { NOT: { status: 'DELETED' } },
        include: {
          images: { where: { isPrimary: true } },
          platformProducts: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!seller) redirect('/auth/register');

  const productCount = seller._count.products;
  const activeProducts = seller.products.filter((p) => p.status === 'ACTIVE').length;
  const pushedProducts = seller.products.reduce(
    (sum, p) => sum + p.platformProducts.filter((pp) => pp.status === 'PUSHED').length,
    0
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="font-bold text-stone-900">ZuriKaribu</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-stone-500">
            <Link href="/dashboard" className="text-amber-600 font-medium">Dashboard</Link>
            <Link href="/dashboard/products" className="hover:text-stone-800 transition-colors">Products</Link>
            <Link href="/dashboard/settings" className="hover:text-stone-800 transition-colors">Settings</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{seller.name}</span>
            <form action="/api/auth/signout" method="POST">
              <Button variant="ghost" size="sm" type="submit" className="text-stone-500">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-900">
              Welcome back, {seller.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-stone-500 mt-1">
              {seller.sellerType === 'FASHION_DESIGNER' ? '👗 Fashion Designer' : '🧵 Fabric Seller'} •{' '}
              {seller.businessName}
            </p>
          </div>
          <Link href="/dashboard/products/new">
            <Button size="lg">
              + Add Product
            </Button>
          </Link>
        </div>

        {/* Status Banner */}
        {seller.status === 'PENDING' && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <div className="text-2xl">⏳</div>
            <div>
              <p className="font-semibold text-amber-800">Account Under Review</p>
              <p className="text-amber-700 text-sm mt-1">
                Our team is reviewing your seller application. You can start adding products now and
                they&apos;ll be ready to publish once approved.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Products"
            value={productCount}
            icon={<span className="text-xl">📦</span>}
          />
          <StatCard
            title="Active Products"
            value={activeProducts}
            icon={<span className="text-xl">✅</span>}
          />
          <StatCard
            title="Platform Pushes"
            value={pushedProducts}
            icon={<span className="text-xl">🚀</span>}
          />
        </div>

        {/* Recent Products */}
        <Card>
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Recent Products</h2>
            <Link href="/dashboard/products" className="text-amber-600 text-sm hover:underline">
              View all →
            </Link>
          </div>
          <CardContent className="p-0">
            {seller.products.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-4">🛍️</div>
                <p className="text-stone-500 mb-4">You haven&apos;t added any products yet</p>
                <Link href="/dashboard/products/new">
                  <Button>Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-50">
                {seller.products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">📸</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate">{product.name}</p>
                      <p className="text-sm text-stone-500">
                        ${product.sellingPrice.toFixed(2)} •{' '}
                        {product.platformProducts.length} platform{product.platformProducts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant={
                      product.status === 'ACTIVE' ? 'success' :
                      product.status === 'DRAFT' ? 'warning' : 'default'
                    }>
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
