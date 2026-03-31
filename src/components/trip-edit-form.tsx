"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTrip, deleteTrip } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, X } from "lucide-react";

interface TripEditFormProps {
  trip: {
    id: number;
    name: string;
    description: string | null;
    tripDate: string | null;
    status: string;
  };
}

export function TripEditForm({ trip }: TripEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      await updateTrip(trip.id, {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        tripDate: (formData.get("tripDate") as string) || undefined,
        status: (formData.get("status") as string) || "planned",
      });
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteTrip(trip.id);
      router.push("/trips");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSave} className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Edit Trip</span>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-name" className="text-xs">Name</Label>
        <Input id="edit-name" name="name" defaultValue={trip.name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-desc" className="text-xs">Description</Label>
        <Textarea
          id="edit-desc"
          name="description"
          defaultValue={trip.description ?? ""}
          rows={2}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-date" className="text-xs">Date</Label>
          <Input
            id="edit-date"
            name="tripDate"
            type="date"
            defaultValue={trip.tripDate ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-status" className="text-xs">Status</Label>
          <select
            id="edit-status"
            name="status"
            defaultValue={trip.status}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="planned">Planned</option>
            <option value="visited">Visited</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
