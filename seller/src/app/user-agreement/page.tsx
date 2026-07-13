import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const DEFAULT_CONTENT = `Welcome to ZuriKaribu Sellers Platform.

By registering as a seller on ZuriKaribu Sellers, you agree to our terms and conditions. Please contact hello@zurikaribu.com for more information.`;

async function getUserAgreementContent(): Promise<string> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: 'user_agreement_content' },
    });
    return setting?.value || DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export default async function UserAgreementPage() {
  const content = await getUserAgreementContent();

  return (
    <div className="african-hero min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white font-black text-xl">Z</span>
            </div>
            <span className="font-display text-white text-2xl font-black">ZuriKaribu Sellers</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-amber-500 px-8 py-6">
            <h1 className="text-xl font-black text-white">User Agreement</h1>
            <p className="text-amber-100 text-sm mt-1">Please read carefully before registering</p>
          </div>

          <div className="p-8">
            <div className="prose prose-stone max-w-none">
              {content.split('\n').map((line, i) => {
                if (line.trim() === '') return <br key={i} />;
                const isHeading = /^\d+\.\s+[A-Z\s]+$/.test(line.trim());
                if (isHeading) {
                  return (
                    <h3 key={i} className="text-stone-900 font-bold mt-6 mb-2 text-sm uppercase tracking-wide">
                      {line}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="text-stone-700 text-sm leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
              >
                ← Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
