import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "ZuriKaribu — Sell African Fashion Globally",
  description: "ZuriKaribu connects African fashion designers and fabric sellers with customers worldwide. List products once, sell on Instagram, TikTok, Facebook, and eBay.",
  keywords: ["African fashion", "sell online", "fashion designer", "fabric seller", "marketplace"],
  openGraph: {
    title: "ZuriKaribu Sellers",
    description: "Sell African Fashion Globally",
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
