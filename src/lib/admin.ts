import type { Session } from "next-auth";

export const ADMIN_EMAIL = "kymaxsz@gmail.com";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.email === ADMIN_EMAIL;
}

export async function requireAdmin(session: Session | null): Promise<void> {
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    throw new Error("Forbidden");
  }
}
