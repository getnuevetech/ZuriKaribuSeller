import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "ZuriKaribu Sellers — Sell African Fashion Globally",
  description: "ZuriKaribu Sellers connects African fashion designers and fabric sellers with customers worldwide. List products once, sell on Instagram, TikTok, Facebook, and eBay.",
  applicationName: "ZuriKaribu Sellers",
  keywords: ["African fashion", "sell online", "fashion designer", "fabric seller", "marketplace"],
  openGraph: {
    title: "ZuriKaribu Sellers",
    description: "ZuriKaribu Sellers helps African fashion businesses reach customers worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
