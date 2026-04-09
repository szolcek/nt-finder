import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";

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
          <main className="flex-1">{children}</main>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
