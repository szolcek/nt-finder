"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Map, Route, Home, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/locations", label: "Explore", icon: Map },
  { href: "/trips", label: "Trips", icon: Route },
  { href: "/account", label: "Account", icon: User, auth: true },
];

export function MobileTabBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show on sign-in page
  if (pathname === "/sign-in") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/90 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          // Show sign-in instead of account when not logged in
          if (tab.auth && !session?.user) {
            const Icon = LogIn;
            const active = pathname === "/sign-in";
            return (
              <Link
                key="sign-in"
                href="/sign-in"
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 pb-[env(safe-area-inset-bottom,8px)] pt-2 text-[10px] font-medium transition-colors",
                  active ? "text-teal-600" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>Sign in</span>
              </Link>
            );
          }

          const Icon = tab.icon;
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 pb-[env(safe-area-inset-bottom,8px)] pt-2 text-[10px] font-medium transition-colors",
                active ? "text-teal-600" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
