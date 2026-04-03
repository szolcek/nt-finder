"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingRow {
  id: number;
  pricingType: string;
  pricingCategory: string;
  tier: string;
  memberPrice: string | null;
  nonMemberPrice: string;
  label: string | null;
  notes: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  "standard": "Entry",
  "house-and-garden": "House & Garden",
  "garden-only": "Garden only",
  "grounds-only": "Grounds only",
  "garden-and-woodland": "Garden & Woodland",
  "house-garden-and-woodland": "House, Garden & Woodland",
  "house-and-grounds": "House & Grounds",
};

function formatPrice(price: string | null): string {
  if (price === null) return "Free";
  const num = parseFloat(price);
  if (num === 0) return "Free";
  return `\u00A3${num.toFixed(2)}`;
}

export function PricingTable({
  pricing,
  isMember: initialIsMember = false,
}: {
  pricing: PricingRow[];
  isMember?: boolean;
}) {
  const [showMember, setShowMember] = useState(initialIsMember);

  const entryPricing = pricing.filter((p) => p.pricingType === "entry");
  const parkingPricing = pricing.filter((p) => p.pricingType === "parking");

  // Group entry pricing by pricingCategory
  const entryCategories = new Map<string, PricingRow[]>();
  for (const row of entryPricing) {
    const cat = row.pricingCategory || "standard";
    if (!entryCategories.has(cat)) entryCategories.set(cat, []);
    entryCategories.get(cat)!.push(row);
  }

  // Check if all entry prices are free (for non-members)
  const isFreeEntry = entryPricing.length > 0 &&
    entryPricing.every((p) => parseFloat(p.nonMemberPrice) === 0);

  if (pricing.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center rounded-lg bg-white p-1 shadow-sm">
        <button
          onClick={() => setShowMember(true)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${showMember ? "bg-teal-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          Member
        </button>
        <button
          onClick={() => setShowMember(false)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${!showMember ? "bg-teal-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          Non-member
        </button>
      </div>

      {isFreeEntry ? (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">Entry</div>
          <div className="mt-0.5 text-xs text-slate-500">Free for everyone</div>
          <p className="mt-2 text-sm text-slate-600">
            {entryPricing[0]?.notes || "No entry fee required"}
          </p>
        </div>
      ) : (
        [...entryCategories.entries()].map(([category, rows]) => (
          <PricingSection
            key={category}
            title={entryCategories.size > 1
              ? (CATEGORY_LABELS[category] ?? category)
              : "Entry"}
            rows={rows}
            showMember={showMember}
          />
        ))
      )}

      {parkingPricing.length > 0 && (
        <PricingSection
          title="Parking"
          rows={parkingPricing}
          showMember={showMember}
        />
      )}
    </div>
  );
}

function PricingSection({
  title,
  rows,
  showMember,
}: {
  title: string;
  rows: PricingRow[];
  showMember: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <div className="mt-0.5 text-xs text-slate-500">
        {showMember ? "Member prices" : "Non-member prices"}
      </div>
      <div className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-600">{row.label ?? row.tier}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {showMember
                  ? formatPrice(row.memberPrice)
                  : formatPrice(row.nonMemberPrice)}
              </span>
              {showMember && row.memberPrice === null && (
                <Badge variant="secondary" className="text-xs">
                  Member benefit
                </Badge>
              )}
            </div>
          </div>
        ))}
        {rows.some((r) => r.notes) && (
          <div className="mt-2 space-y-1">
            {rows.filter((r) => r.notes).map((r) => (
              <p key={r.id} className="text-xs text-slate-400">
                {r.notes}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
