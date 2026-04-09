"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { updateProfile, updateAvatar, removeAvatar, updateMembership, deleteAccount } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Check, AlertTriangle, Loader2, Camera, X } from "lucide-react";

interface AccountFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    isMember: boolean;
    createdAt: string;
  };
}

export function AccountForm({ user }: AccountFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.image);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(user.isMember);
  const [memberSaving, setMemberSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, publicUrl } = await res.json();

      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      await updateAvatar(publicUrl);
      setAvatarUrl(publicUrl);
      router.refresh();
    } catch {
      setError("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    setAvatarUploading(true);
    try {
      await removeAvatar();
      setAvatarUrl(null);
      router.refresh();
    } catch {
      setError("Failed to remove photo");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleToggleMember() {
    setMemberSaving(true);
    try {
      const next = !isMember;
      await updateMembership(next);
      setIsMember(next);
      await updateSession();
      router.refresh();
    } catch {
      // revert on failure
    } finally {
      setMemberSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Profile section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your public profile information.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            className="group relative h-16 w-16 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl ?? undefined} alt={user.name ?? "User"} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {avatarUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Click photo to change
            </p>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarUploading}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="max-w-sm"
              />
              <Button
                onClick={handleSave}
                disabled={saving || name.trim() === (user.name ?? "") || !name.trim()}
                size="sm"
              >
                {saving ? "Saving..." : saved ? (
                  <><Check className="mr-1.5 h-3.5 w-3.5" /> Saved</>
                ) : "Save"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Joined</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>NT Membership</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isMember}
                disabled={memberSaving}
                onClick={handleToggleMember}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: isMember ? "#0d9488" : "#d1d5db" }}
              >
                <span
                  className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform"
                  style={{ transform: isMember ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {memberSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isMember ? "Active member" : "Not a member"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle this to see member pricing by default on location pages.
            </p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/20 bg-card p-6">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>

        {showDeleteConfirm ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium">Are you sure?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will permanently delete your account, visits, reviews, trips, and photos. This cannot be undone.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Yes, delete my account"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        )}
      </div>
    </div>
  );
}
