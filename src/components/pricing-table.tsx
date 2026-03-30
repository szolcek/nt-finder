"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingRow {
  id: number;
  pricingType: string;
  tier: string;
  memberPrice: string | null;
  nonMemberPrice: string;
  label: string | null;
  notes: string | null;
}

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

  if (pricing.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={showMember ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMember(true)}
        >
          Member
        </Button>
        <Button
          variant={!showMember ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMember(false)}
        >
          Non-member
        </Button>
      </div>

      {entryPricing.length > 0 && (
        <PricingSection
          title="Entry"
          rows={entryPricing}
          showMember={showMember}
        />
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          {showMember ? "Member prices" : "Non-member prices"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{row.label ?? row.tier}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
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
        </div>
      </CardContent>
    </Card>
  );
}
