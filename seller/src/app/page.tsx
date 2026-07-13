import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <span className="text-stone-900 text-xl font-bold tracking-tight">ZuriKaribu</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-stone-500 text-sm">
          <Link href="#features" className="hover:text-stone-900 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-stone-900 transition-colors">How It Works</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="primary" size="md">Start Selling</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 min-h-[85vh] flex items-center">
        {/* Decorative geometric pattern (Kente-inspired) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="kente" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none"/>
                <rect x="0" y="0" width="20" height="20" fill="#f59e0b"/>
                <rect x="20" y="20" width="20" height="20" fill="#f59e0b"/>
                <rect x="40" y="40" width="20" height="20" fill="#f59e0b"/>
                <rect x="60" y="60" width="20" height="20" fill="#f59e0b"/>
                <rect x="20" y="0" width="20" height="20" fill="#10b981"/>
                <rect x="60" y="0" width="20" height="20" fill="#10b981"/>
                <rect x="0" y="40" width="20" height="20" fill="#10b981"/>
                <rect x="40" y="20" width="20" height="20" fill="#10b981"/>
                <rect x="40" y="0" width="20" height="20" fill="#dc2626"/>
                <rect x="0" y="20" width="20" height="20" fill="#dc2626"/>
                <rect x="60" y="40" width="20" height="20" fill="#dc2626"/>
                <rect x="20" y="60" width="20" height="20" fill="#dc2626"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kente)"/>
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl opacity-10 pointer-events-none" aria-hidden />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-600 rounded-full blur-3xl opacity-10 pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 text-amber-400 text-sm mb-8">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Soft Launch — Join Today
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Sell African Fashion<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Globally</span>
            </h1>
            <p className="text-lg text-stone-300 max-w-lg mb-10 leading-relaxed">
              ZuriKaribu connects African fashion designers and fabric sellers with customers worldwide.
              List your products once, reach Instagram, TikTok, Facebook, and eBay automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/auth/register">
                <Button size="xl" variant="primary" className="rounded-full px-10">
                  Start Selling Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="xl" variant="ghost" className="text-stone-300 hover:text-white rounded-full">
                  See How It Works
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm">
              {[{ label: 'Sellers Waiting', value: '500+' }, { label: 'African Countries', value: '20+' }, { label: 'Platforms', value: '4' }].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-amber-400">{stat.value}</div>
                  <div className="text-stone-500 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: dashboard mockup card */}
          <div className="relative hidden md:block">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Z</span>
                  </div>
                  <span className="text-white font-bold text-sm">Seller Dashboard</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              {/* Mock stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Products', value: '12', color: 'bg-amber-500/20 text-amber-300' },
                  { label: 'Published', value: '8', color: 'bg-green-500/20 text-green-300' },
                  { label: 'Platforms', value: '4', color: 'bg-blue-500/20 text-blue-300' },
                  { label: 'Pending', value: '3', color: 'bg-orange-500/20 text-orange-300' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl px-4 py-3 ${s.color}`}>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Mock product rows */}
              <div className="space-y-2">
                {[
                  { name: 'Ankara Maxi Dress', status: '✅ Live', platforms: '4' },
                  { name: 'Kente Headwrap Set', status: '✅ Live', platforms: '3' },
                  { name: 'Adire Silk Blouse', status: '⏳ Pending', platforms: '—' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-white text-xs font-medium">{p.name}</p>
                      <p className="text-stone-400 text-xs">{p.platforms} platforms</p>
                    </div>
                    <span className="text-xs text-stone-300">{p.status}</span>
                  </div>
                ))}
              </div>
              {/* Platform badges */}
              <div className="flex gap-2 mt-4">
                {['📸 IG', '🎵 TT', '👍 FB', '🛒 eBay'].map((p) => (
                  <span key={p} className="text-xs bg-amber-500/20 text-amber-300 rounded-full px-2.5 py-1">{p}</span>
                ))}
              </div>
            </div>
            {/* Floating fabric-swatch accent */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-xl pointer-events-none" aria-hidden />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 opacity-20 blur-xl pointer-events-none" aria-hidden />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-stone-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-stone-900 mb-4">Everything You Need to Sell Online</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">From listing to sale, ZuriKaribu handles the complexity so you can focus on creating.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-200 transition-colors text-2xl">{f.icon}</div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gradient-to-br from-stone-950 to-amber-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Get Selling in 3 Simple Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto mb-6">{i + 1}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-stone-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="bg-white py-24 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-stone-900 mb-4">Reach Customers Everywhere</h2>
          <p className="text-stone-500 text-lg mb-12 max-w-xl mx-auto">One upload, four platforms. Your products automatically appear where your customers shop.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: '📸 Instagram', bg: 'from-pink-500 to-purple-600' },
              { label: '🎵 TikTok', bg: 'from-stone-800 to-stone-900' },
              { label: '👍 Facebook', bg: 'from-blue-600 to-blue-700' },
              { label: '🛒 eBay', bg: 'from-amber-500 to-orange-500' },
            ].map((p) => (
              <div key={p.label} className={`flex items-center gap-3 bg-gradient-to-r ${p.bg} rounded-2xl px-8 py-5 text-white font-semibold text-lg shadow-lg`}>{p.label}</div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">AI-Powered Product Optimization</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Our AI optimizes your product descriptions and captions for every platform to drive more sales.</p>
          <Link href="/auth/register">
            <Button variant="secondary" size="xl" className="rounded-full bg-stone-900 hover:bg-stone-800">Try It Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-stone-500">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="text-white font-bold">ZuriKaribu</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} ZuriKaribu. All rights reserved.</p>
          <p className="text-xs mt-2 text-stone-600">&quot;Zuri&quot; means &quot;beautiful&quot; in Swahili &bull; &quot;Karibu&quot; means &quot;welcome&quot;</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {icon:'🌍',title:'Multi-Platform Publishing',desc:'Publish products to Instagram, TikTok, Facebook, and eBay with a single click. Update everywhere at once.'},
  {icon:'🤖',title:'AI-Optimized Listings',desc:'Our AI rewrites your product descriptions to maximize engagement and sales conversions on each platform.'},
  {icon:'📸',title:'Smart Image Management',desc:'Upload up to 5 product images to secure cloud storage. AI analyzes colors, style, and suggests improvements.'},
  {icon:'🏪',title:'Seller Dashboard',desc:"Track your products, see where they're selling, and manage everything from one beautiful dashboard."},
  {icon:'💰',title:'Transparent Pricing',desc:'Set your selling price and we automatically calculate platform pricing with clear margins.'},
  {icon:'🔒',title:'Secure & Reliable',desc:'Enterprise-grade security with Google login, encrypted data, and AWS cloud infrastructure.'},
];
const steps = [
  {title:'Create Your Profile',desc:'Register as a Fashion Designer or Fabric Seller. Tell us about your business and the fabrics you work with.'},
  {title:'Upload Your Products',desc:'Add product photos (3-5 images), descriptions, and pricing. Our AI optimizes everything automatically.'},
  {title:'Sell Globally',desc:'With one click, your products appear on Instagram, TikTok, Facebook, and eBay. Start getting orders today.'},
];
