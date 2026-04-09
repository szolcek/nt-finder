import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { PageTransition } from "@/components/page-transition";

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
      <body className="flex min-h-full flex-col">
        <Providers>
          <Nav />
          <main className="flex-1 pb-16 md:pb-0">
            <PageTransition>{children}</PageTransition>
          </main>
          <MobileTabBar />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
