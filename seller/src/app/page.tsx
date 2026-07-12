import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-cream)]">
      <section className="african-hero text-white">
        <div className="relative z-10">
          <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-black/20">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="font-display text-xl font-black tracking-tight">ZuriKaribu Sellers</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-stone-200 text-sm">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-stone-100 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="md" className="bg-amber-400 text-stone-950 hover:bg-amber-300">
                  Start Selling
                </Button>
              </Link>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.2fr_0.8fr] gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-amber-200 text-sm mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                African fashion commerce, reimagined
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-black leading-[0.95] mb-6">
                ZuriKaribu Sellers helps African fashion brands sell
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300">
                  boldly, beautifully, globally.
                </span>
              </h1>
              <p className="text-xl text-stone-200/90 max-w-2xl mb-10 leading-relaxed">
                ZuriKaribu Sellers brings together designers, fabric merchants, and handmade labels with
                a vibrant storefront built for modern African fashion. Publish once, then reach shoppers
                across Instagram, TikTok, Facebook, and eBay.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/auth/register">
                  <Button size="xl" variant="primary" className="rounded-full px-10 bg-amber-400 text-stone-950 hover:bg-amber-300">
                    Start Selling Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="xl" variant="ghost" className="text-stone-100 hover:text-white rounded-full hover:bg-white/10">
                    See How It Works
                  </Button>
                </Link>
              </div>
              <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-sm px-5 py-4">
                    <div className="text-3xl font-display font-black text-amber-200">{stat.value}</div>
                    <div className="text-sm text-stone-200/80 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="african-panel rounded-[2rem] p-6 lg:p-8 text-stone-900">
                <div className="kente-divider mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  {motifs.map((motif) => (
                    <div key={motif.name} className="african-pattern-chip rounded-2xl p-5 border border-white/60">
                      <div className={`w-11 h-11 rounded-2xl ${motif.tint} flex items-center justify-center text-xl mb-4 shadow-sm`}>
                        {motif.icon}
                      </div>
                      <p className="font-display font-bold text-lg text-stone-900">{motif.name}</p>
                      <p className="text-sm text-stone-600 mt-2">{motif.copy}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-3xl bg-stone-950 px-6 py-5 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-300 mb-2">Inspired by African textiles</p>
                  <p className="font-display text-2xl font-black">Warm earth tones, bold pattern energy, and a marketplace made for makers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-700 mb-4">Built for African fashion entrepreneurs</p>
            <h2 className="font-display text-4xl font-black text-stone-900 mb-4">Everything your brand needs to stand out online</h2>
            <p className="text-stone-600 text-lg">
              From listing to launch, ZuriKaribu Sellers handles the operational complexity so you can focus
              on craftsmanship, culture, and growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-stone-200 bg-[var(--brand-cream)] p-8 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className={`w-14 h-14 rounded-2xl ${feature.tint} flex items-center justify-center mb-6 text-2xl shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-black text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-stone-950 py-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300 mb-4">How it works</p>
            <h2 className="font-display text-4xl font-black mb-4">Bring your prints, tailoring, and textile story to every channel</h2>
            <p className="text-stone-300 text-lg">
              Launch in three simple steps while keeping your products, pricing, and brand story consistent everywhere.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 text-stone-950 font-display font-black text-2xl flex items-center justify-center mb-6">
                  {index + 1}
                </div>
                <h3 className="font-display text-2xl font-black mb-3">{step.title}</h3>
                <p className="text-stone-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--brand-cream)] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[2rem] bg-white border border-stone-200 p-8 lg:p-12 shadow-sm">
            <div className="grid lg:grid-cols-[1fr_0.8fr] gap-10 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 mb-4">Marketplace reach</p>
                <h2 className="font-display text-4xl font-black text-stone-900 mb-4">Put your collections wherever your customers discover style</h2>
                <p className="text-stone-600 text-lg mb-8 max-w-2xl">
                  One upload, four platforms, and a consistent brand story inspired by African fashion excellence.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {platforms.map((platform) => (
                    <div key={platform.name} className="flex items-center gap-3 rounded-2xl bg-stone-100 px-6 py-4 text-stone-700 font-semibold shadow-sm">
                      <span className="text-2xl">{platform.icon}</span>
                      {platform.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-stone-950 p-8 text-white">
                <div className="kente-divider mb-6" />
                <p className="text-sm text-stone-300 leading-relaxed mb-6">
                  Highlight your craftsmanship with AI-assisted product storytelling, multichannel publishing,
                  and a seller dashboard that keeps every listing in sync.
                </p>
                <div className="space-y-4">
                  {storyHighlights.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="mt-1 text-amber-300">◆</span>
                      <div>
                        <p className="font-display font-bold text-lg">{item.label}</p>
                        <p className="text-stone-300 text-sm">{item.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-white/80 mb-4">AI-powered growth</p>
          <h2 className="font-display text-4xl font-black text-white mb-4">Craft standout listings with the energy of a digital atelier</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            ZuriKaribu Sellers adapts descriptions and captions for every platform, helping your products feel
            polished, premium, and culturally grounded.
          </p>
          <Link href="/auth/register">
            <Button variant="secondary" size="xl" className="rounded-full bg-stone-950 hover:bg-stone-900">
              Try It Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-stone-950 border-t border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-stone-400">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="font-display text-white font-black">ZuriKaribu Sellers</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} ZuriKaribu Sellers. All rights reserved.</p>
          <p className="text-xs mt-2 text-stone-500">&quot;Zuri&quot; means &quot;beautiful&quot; in Swahili &bull; &quot;Karibu&quot; means &quot;welcome&quot;</p>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { label: 'Sellers Waiting', value: '500+' },
  { label: 'African Countries', value: '20+' },
  { label: 'Platforms', value: '4' },
];

const motifs = [
  { icon: '◆', name: 'Kente energy', copy: 'Color-rich presentation inspired by woven heritage and modern retail polish.', tint: 'bg-amber-100 text-amber-700' },
  { icon: '◈', name: 'Ankara rhythm', copy: 'Pattern-led storytelling that makes every collection feel lively and expressive.', tint: 'bg-rose-100 text-rose-700' },
  { icon: '△', name: 'Tailor-ready tools', copy: 'Keep catalogues, fabrics, and fit details clear from first click to first order.', tint: 'bg-emerald-100 text-emerald-700' },
  { icon: '⬢', name: 'Global discovery', copy: 'Showcase African fashion with a storefront that feels premium across every channel.', tint: 'bg-sky-100 text-sky-700' },
];

const features = [
  { icon: '🌍', title: 'Multi-Platform Publishing', desc: 'Publish products to Instagram, TikTok, Facebook, and eBay with a single click while keeping your pricing and imagery aligned.', tint: 'bg-amber-100 text-amber-700' },
  { icon: '🤖', title: 'AI-Optimized Listings', desc: 'Refine product descriptions, fabric details, and social captions with AI tuned for African fashion storytelling.', tint: 'bg-rose-100 text-rose-700' },
  { icon: '📸', title: 'Smart Image Management', desc: 'Upload up to 5 product images to secure cloud storage and present every print, weave, and silhouette beautifully.', tint: 'bg-emerald-100 text-emerald-700' },
  { icon: '🏪', title: 'Seller Dashboard', desc: 'Track products, monitor publishing status, and manage your storefront from one polished workspace.', tint: 'bg-sky-100 text-sky-700' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'Set your selling price confidently while the platform calculates channel-ready pricing with clear margins.', tint: 'bg-orange-100 text-orange-700' },
  { icon: '🔒', title: 'Secure & Reliable', desc: 'Run on enterprise-ready infrastructure with secure authentication and dependable cloud storage.', tint: 'bg-stone-200 text-stone-700' },
];

const steps = [
  { title: 'Create Your Seller Profile', desc: 'Register as a fashion designer or fabric seller, then introduce your craft, materials, and business story.' },
  { title: 'Upload Your Collection', desc: 'Add product photos, descriptions, fabrics, and pricing. The platform helps polish each listing for launch.' },
  { title: 'Sell Across Channels', desc: 'Push your catalogue to Instagram, TikTok, Facebook, and eBay so customers can discover your work everywhere.' },
];

const platforms = [
  { icon: '📸', name: 'Instagram' },
  { icon: '🎵', name: 'TikTok' },
  { icon: '👍', name: 'Facebook' },
  { icon: '🛒', name: 'eBay' },
];

const storyHighlights = [
  { label: 'Bold brand storytelling', copy: 'Present the meaning behind prints, fabrics, and craftsmanship with richer product copy.' },
  { label: 'Fast cross-channel launch', copy: 'Reach more buyers without rewriting each listing from scratch for every marketplace.' },
  { label: 'Seller-first operations', copy: 'Keep approvals, products, and platform settings organized from one place.' },
];
