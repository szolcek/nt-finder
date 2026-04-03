import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { getPendingReviews, getPendingPhotos } from "@/actions/admin";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  const [pendingReviews, pendingPhotos] = await Promise.all([
    getPendingReviews(),
    getPendingPhotos(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and approve user-submitted content.
        </p>
        <AdminDashboard
          pendingReviews={pendingReviews}
          pendingPhotos={pendingPhotos}
        />
      </div>
    </div>
  );
}
