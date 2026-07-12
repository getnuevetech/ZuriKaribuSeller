import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/ui/Card';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Card';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/auth/login');

  const [
    totalUsers,
    totalSellers,
    totalProducts,
    pendingSellers,
    activePlatforms,
    recentSellers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.seller.count(),
    prisma.product.count({ where: { NOT: { status: 'DELETED' } } }),
    prisma.seller.count({ where: { status: 'PENDING' } }),
    prisma.platformGateway.count({ where: { enabled: true } }),
    prisma.seller.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 flex items-center justify-center">
              <span className="font-bold">Z</span>
            </div>
            <span className="font-display font-bold">ZuriKaribu Sellers Admin</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-stone-400">
            <Link href="/admin" className="text-white font-medium">Overview</Link>
            <Link href="/admin/users" className="hover:text-white transition-colors">Users</Link>
            <Link href="/admin/products" className="hover:text-white transition-colors">Products</Link>
            <Link href="/admin/platforms" className="hover:text-white transition-colors">Platforms</Link>
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
          </nav>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-stone-400 hover:text-white text-sm">Sign Out</button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 mt-1">Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={totalUsers} icon={<span className="text-xl">👥</span>} />
          <StatCard title="Total Sellers" value={totalSellers} icon={<span className="text-xl">🏪</span>} />
          <StatCard title="Total Products" value={totalProducts} icon={<span className="text-xl">📦</span>} />
          <StatCard
            title="Pending Approval"
            value={pendingSellers}
            icon={<span className="text-xl">⏳</span>}
            change={pendingSellers > 0 ? `${pendingSellers} sellers waiting` : 'All reviewed'}
            positive={pendingSellers === 0}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Sellers */}
          <Card>
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-bold text-stone-900">Recent Registrations</h2>
              <Link href="/admin/users" className="text-amber-600 text-sm hover:underline">View all →</Link>
            </div>
            <CardContent className="p-0">
              {recentSellers.map((seller) => (
                <div key={seller.id} className="flex items-center gap-4 px-6 py-4 border-b border-stone-50 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold flex-shrink-0">
                    {seller.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 truncate">{seller.name}</p>
                    <p className="text-xs text-stone-500">{seller.user.email}</p>
                  </div>
                  <Badge variant={
                    seller.status === 'APPROVED' ? 'success' :
                    seller.status === 'PENDING' ? 'warning' :
                    seller.status === 'REJECTED' ? 'danger' : 'default'
                  }>
                    {seller.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card>
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-bold text-stone-900">Platform Status</h2>
              <Link href="/admin/platforms" className="text-amber-600 text-sm hover:underline">Manage →</Link>
            </div>
            <CardContent>
              <div className="space-y-4">
                {['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'EBAY'].map((platform) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {platform === 'INSTAGRAM' ? '📸' : platform === 'TIKTOK' ? '🎵' : platform === 'FACEBOOK' ? '👍' : '🛒'}
                      </span>
                      <span className="font-medium text-stone-700">{platform}</span>
                    </div>
                    <Link href="/admin/platforms">
                      <Badge variant="warning">Configure</Badge>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                <p className="text-amber-700 text-sm">
                  <strong>{activePlatforms}</strong> platforms active. Configure API credentials to enable auto-push.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid sm:grid-cols-4 gap-4">
          {[
            { href: '/admin/users', label: 'Manage Users', icon: '👥' },
            { href: '/admin/products', label: 'Manage Products', icon: '📦' },
            { href: '/admin/platforms', label: 'Platform Gateway', icon: '🔗' },
            { href: '/admin/settings', label: 'App Settings', icon: '⚙️' },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card hover className="p-5 text-center">
                <div className="text-3xl mb-2">{action.icon}</div>
                <p className="font-medium text-stone-700 text-sm">{action.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
