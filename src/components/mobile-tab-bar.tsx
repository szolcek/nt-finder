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

  if (pathname === "/sign-in") return null;

  const activeIndex = tabs.findIndex((tab) => {
    if (tab.auth && !session?.user) return false;
    return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-0 h-[2px] rounded-full bg-teal-500"
        style={{
          width: `${100 / tabs.length}%`,
          left: `${(Math.max(0, activeIndex) * 100) / tabs.length}%`,
          transition: "left 200ms ease-out",
        }}
      />

      <div className="flex">
        {tabs.map((tab) => {
          if (tab.auth && !session?.user) {
            return (
              <Link
                key="sign-in"
                href="/sign-in"
                className="flex flex-1 flex-col items-center gap-0.5 pb-[env(safe-area-inset-bottom,6px)] pt-2 text-[10px] font-medium text-slate-400"
              >
                <LogIn className="h-5 w-5" />
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
                "flex flex-1 flex-col items-center gap-0.5 pb-[env(safe-area-inset-bottom,6px)] pt-2 text-[10px] font-medium",
                active ? "text-teal-600" : "text-slate-400"
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
