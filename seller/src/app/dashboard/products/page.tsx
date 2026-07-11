import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Card';

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) redirect('/auth/register');

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, NOT: { status: 'DELETED' } },
    include: {
      images: { where: { isPrimary: true } },
      platformProducts: { include: { platformGateway: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-stone-500 hover:text-stone-800">← Dashboard</Link>
            <h1 className="font-black text-stone-900">My Products</h1>
          </div>
          <Link href="/dashboard/products/new">
            <Button size="md">+ Add Product</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <Card className="py-20 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-stone-500 text-lg mb-6">No products yet</p>
            <Link href="/dashboard/products/new">
              <Button size="lg">Add Your First Product</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} hover className="overflow-hidden">
                <div className="aspect-square bg-stone-100 relative">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📸</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={
                      product.status === 'ACTIVE' ? 'success' :
                      product.status === 'DRAFT' ? 'warning' : 'default'
                    }>
                      {product.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-stone-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-stone-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-600">${product.sellingPrice.toFixed(2)}</span>
                    <span className="text-xs text-stone-400">
                      {product.platformProducts.filter((pp) => pp.status === 'PUSHED').length} platforms
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {product.platformProducts.map((pp) => (
                      <span
                        key={pp.id}
                        className={`text-xs px-2 py-0.5 rounded-full ${pp.status === 'PUSHED' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}
                      >
                        {pp.platformGateway.platform}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
