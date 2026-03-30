"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createTrip } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewTripPage() {
  const router = useRouter();

  async function handleSubmit(prevState: unknown, formData: FormData) {
    try {
      const trip = await createTrip({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        tripDate: (formData.get("tripDate") as string) || undefined,
        status: (formData.get("status") as string) || "planned",
      });
      router.push(`/trips/${trip.id}`);
      return { success: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Something went wrong" };
    }
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Lake District Weekend"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What are you planning?"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tripDate">Date</Label>
                <Input id="tripDate" name="tripDate" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="planned">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="visited">Visited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {state && "error" in state && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Trip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
