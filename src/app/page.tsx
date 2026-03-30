import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera, Star, Users } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Discover Locations",
    description:
      "Browse National Trust properties, gardens, coastlines, and countryside spots across the UK.",
  },
  {
    icon: Camera,
    title: "Save Your Trips",
    description:
      "Plan future visits and record past trips with photos and personal notes.",
  },
  {
    icon: Star,
    title: "Reviews & Tips",
    description:
      "Share your experience and read tips from other visitors before you go.",
  },
  {
    icon: Users,
    title: "Member Pricing",
    description:
      "See accurate entry and parking prices for both members and non-members.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-nt-green-light to-background py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Explore the
            <span className="text-primary"> National Trust</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Find locations, check pricing, save your trips, and share tips with
            fellow visitors.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button render={<Link href="/locations" />} nativeButton={false} size="lg">
              Browse Locations
            </Button>
            <Button render={<Link href="/sign-in" />} nativeButton={false} variant="outline" size="lg">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
