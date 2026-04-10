import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "TrustQuest - Discover National Trust Locations",
    template: "%s | TrustQuest",
  },
  description:
    "Find National Trust locations, save your trips, share photos, and leave tips for fellow visitors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-72R7XYJYS8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-72R7XYJYS8');
          `}
        </Script>
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Nav />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <MobileTabBar />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
