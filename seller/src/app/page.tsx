import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950">
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">ZuriKaribu</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-stone-400 text-sm">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-stone-300 hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="primary" size="md">Start Selling</Button>
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 text-amber-400 text-sm mb-8">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          Soft Launch — Join Today
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          Sell African Fashion<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Globally</span>
        </h1>
        <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ZuriKaribu connects African fashion designers and fabric sellers with customers worldwide.
          List your products once, reach Instagram, TikTok, Facebook, and eBay automatically.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[{label:'Sellers Waiting',value:'500+'},{label:'African Countries',value:'20+'},{label:'Platforms',value:'4'}].map((stat)=>(
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-amber-400">{stat.value}</div>
              <div className="text-stone-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-stone-900 mb-4">Everything You Need to Sell Online</h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">From listing to sale, ZuriKaribu handles the complexity so you can focus on creating.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f)=>(
              <div key={f.title} className="p-8 rounded-2xl bg-stone-50 hover:bg-amber-50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-200 transition-colors text-2xl">{f.icon}</div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-stone-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Get Selling in 3 Simple Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s,i)=>(
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto mb-6">{i+1}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-stone-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-stone-900 mb-4">Reach Customers Everywhere</h2>
          <p className="text-stone-500 text-lg mb-12 max-w-xl mx-auto">One upload, four platforms. Your products automatically appear where your customers shop.</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['📸 Instagram','🎵 TikTok','👍 Facebook','🛒 eBay'].map((p)=>(
              <div key={p} className="flex items-center gap-3 bg-stone-50 rounded-2xl px-8 py-5 text-stone-700 font-semibold text-lg hover:bg-amber-50 transition-colors">{p}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">AI-Powered Product Optimization</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">Our AI optimizes your product descriptions and captions for every platform to drive more sales.</p>
          <Link href="/auth/register">
            <Button variant="secondary" size="xl" className="rounded-full bg-stone-900 hover:bg-stone-800">Try It Free</Button>
          </Link>
        </div>
      </section>

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
