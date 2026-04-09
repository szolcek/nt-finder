"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TreePine, Map, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_EMAIL } from "@/lib/admin";

const navLinks = [
  { href: "/locations", label: "Locations", icon: Map },
  { href: "/trips", label: "My Trips", icon: Route },
];

export function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-50 hidden md:block">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2 font-semibold">
          <TreePine className="h-5 w-5 text-teal-600" />
          <span>TrustQuest</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.email === ADMIN_EMAIL && (
            <Link
              href="/admin"
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  />
                }
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image ?? undefined}
                    alt={session.user.name ?? "User"}
                  />
                  <AvatarFallback>
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/account" />}>
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/trips" />}>
                  My Trips
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              render={<Link href="/sign-in" />}
              nativeButton={false}
              size="sm"
              className="hidden md:inline-flex"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
