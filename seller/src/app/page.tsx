import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getLandingPageContent } from '@/lib/app-settings';

export default async function LandingPage() {
  const landing = await getLandingPageContent();

  const navItems = [
    landing.sections.features ? { href: '#features', label: landing.navigation.featuresLabel } : null,
    landing.sections.howItWorks ? { href: '#how-it-works', label: landing.navigation.howItWorksLabel } : null,
    landing.sections.marketplace ? { href: '#marketplace', label: landing.navigation.marketplaceLabel } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 shadow-lg shadow-orange-500/20">
              <span className="text-lg font-bold text-white">Z</span>
            </div>
            <div>
              <p className="font-display text-lg font-black tracking-tight">{landing.siteName}</p>
              <p className="text-xs text-stone-500">{landing.siteTagline}</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-stone-950">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-stone-700 hover:bg-stone-100 hover:text-stone-950">
                {landing.navigation.signInLabel}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="md" className="bg-amber-400 text-stone-950 hover:bg-amber-300">
                {landing.navigation.registerLabel}
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {landing.sections.hero && (
        <section className="african-hero overflow-hidden text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-amber-200 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                {landing.hero.kicker}
              </div>

              <h1 className="mb-6 max-w-4xl font-display text-5xl font-black leading-[0.95] md:text-7xl">
                {landing.hero.titlePrefix}
                <span className="block bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent">
                  {landing.hero.titleHighlight}
                </span>
              </h1>

              <p className="mb-10 max-w-2xl text-xl leading-relaxed text-stone-200/90">
                {landing.hero.description}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href={landing.hero.primaryCtaHref}>
                  <Button size="xl" variant="primary" className="rounded-full bg-amber-400 px-10 text-stone-950 hover:bg-amber-300">
                    {landing.hero.primaryCtaLabel}
                  </Button>
                </Link>
                <Link href={landing.hero.secondaryCtaHref}>
                  <Button size="xl" variant="ghost" className="rounded-full text-stone-100 hover:bg-white/10 hover:text-white">
                    {landing.hero.secondaryCtaLabel}
                  </Button>
                </Link>
              </div>

              {landing.sections.heroStats && landing.stats.length > 0 && (
                <div className="mt-14 grid max-w-2xl gap-4 sm:grid-cols-3">
                  {landing.stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-sm">
                      <div className="font-display text-3xl font-black text-amber-200">{stat.value}</div>
                      <div className="mt-1 text-sm text-stone-200/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {landing.sections.heroImage && (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-stone-900/30 shadow-2xl shadow-black/30">
                  <div
                    role="img"
                    aria-label={landing.hero.imageAlt}
                    className="h-[320px] w-full bg-cover bg-center md:h-[420px] xl:h-[520px]"
                    style={{ backgroundImage: `url("${landing.hero.imageUrl}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-200/90">
                      {landing.hero.overlayEyebrow}
                    </p>
                    <h2 className="mb-3 max-w-lg font-display text-2xl font-black md:text-3xl">
                      {landing.hero.overlayTitle}
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed text-stone-200 md:text-base">
                      {landing.hero.overlayCopy}
                    </p>
                  </div>
                </div>
              )}

              {landing.sections.heroHighlights && landing.motifs.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {landing.motifs.map((motif) => (
                    <div key={motif.name} className="african-pattern-chip rounded-3xl border border-white/10 p-5 text-stone-900 shadow-lg shadow-black/10">
                      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-sm ${motif.tint}`}>
                        {motif.icon}
                      </div>
                      <p className="font-display text-lg font-bold">{motif.name}</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{motif.copy}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {landing.sections.features && (
        <section id="features" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="mb-4 text-sm uppercase tracking-[0.24em] text-amber-700">{landing.features.eyebrow}</p>
              <h2 className="mb-4 font-display text-4xl font-black text-stone-900">{landing.features.title}</h2>
              <p className="text-lg text-stone-600">{landing.features.description}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {landing.features.items.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-stone-200 bg-[var(--brand-cream)] p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm ${feature.tint}`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 font-display text-xl font-black text-stone-900">{feature.title}</h3>
                  <p className="leading-relaxed text-stone-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {landing.sections.howItWorks && (
        <section id="how-it-works" className="bg-stone-950 py-24 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="mb-4 text-sm uppercase tracking-[0.24em] text-amber-300">{landing.howItWorks.eyebrow}</p>
              <h2 className="mb-4 font-display text-4xl font-black">{landing.howItWorks.title}</h2>
              <p className="text-lg text-stone-300">{landing.howItWorks.description}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {landing.howItWorks.steps.map((step, index) => (
                <div key={`${step.title}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 font-display text-2xl font-black text-stone-950">
                    {index + 1}
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-black">{step.title}</h3>
                  <p className="leading-relaxed text-stone-300">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {landing.sections.marketplace && (
        <section id="marketplace" className="bg-[var(--brand-cream)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm lg:p-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.24em] text-emerald-700">{landing.marketplace.eyebrow}</p>
                  <h2 className="mb-4 font-display text-4xl font-black text-stone-900">{landing.marketplace.title}</h2>
                  <p className="mb-8 max-w-2xl text-lg text-stone-600">{landing.marketplace.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {landing.marketplace.platforms.map((platform) => (
                      <div key={platform.name} className="flex items-center gap-3 rounded-2xl bg-stone-100 px-6 py-4 font-semibold text-stone-700 shadow-sm">
                        <span className="text-2xl">{platform.icon}</span>
                        {platform.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.75rem] bg-stone-950 p-8 text-white">
                  <div className="kente-divider mb-6" />
                  <p className="mb-6 text-sm leading-relaxed text-stone-300">{landing.marketplace.panelCopy}</p>
                  <div className="space-y-4">
                    {landing.marketplace.highlights.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <span className="mt-1 text-amber-300">◆</span>
                        <div>
                          <p className="font-display text-lg font-bold">{item.label}</p>
                          <p className="text-sm text-stone-300">{item.copy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {landing.sections.growthCta && (
        <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.24em] text-white/80">{landing.growthCta.eyebrow}</p>
            <h2 className="mb-4 font-display text-4xl font-black text-white">{landing.growthCta.title}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">{landing.growthCta.description}</p>
            <Link href={landing.growthCta.ctaHref}>
              <Button variant="secondary" size="xl" className="rounded-full bg-stone-950 hover:bg-stone-900">
                {landing.growthCta.ctaLabel}
              </Button>
            </Link>
          </div>
        </section>
      )}

      {landing.sections.footer && (
        <footer className="border-t border-stone-800 bg-stone-950 py-12">
          <div className="mx-auto max-w-7xl px-6 text-center text-stone-400">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-orange-400 to-red-500">
                <span className="font-bold text-white">Z</span>
              </div>
              <span className="font-display font-black text-white">{landing.siteName}</span>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} {landing.siteName}. All rights reserved.</p>
            <p className="mt-2 text-xs text-stone-500">{landing.footerNote}</p>
          </div>
        </footer>
      )}
    </div>
  );
}
