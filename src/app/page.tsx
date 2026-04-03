import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Mountain, TreePine,
  Map, CheckCircle2, Route, Star, MapPin,
  Heart, Calendar, MessageCircle, Trophy, Compass,
} from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { AnimatedCounter } from "@/components/animated-counter";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const [count, session] = await Promise.all([
    db.$count(locations),
    auth(),
  ]);
  const exploreHref = session?.user ? "/locations" : "/sign-in";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero — light, centered, with floating cards ── */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-teal-50/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(20,184,166,0.06),transparent_50%),radial-gradient(ellipse_at_right,rgba(14,165,233,0.05),transparent_50%)]" />

        {/* Floating cards — left side */}
        <div className="pointer-events-none absolute inset-y-0 left-[18%] hidden w-[260px] xl:block">
          <div className="absolute left-0 top-[10%] w-60 rotate-[-4deg] rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <div className="relative h-40 overflow-hidden rounded-xl">
              <Image src="/hero.jpg" alt="Stately home" fill className="object-cover" sizes="240px" />
            </div>
            <div className="px-1.5 py-2">
              <div className="text-sm font-semibold text-slate-800">Montacute House</div>
              <div className="text-xs text-slate-400">Somerset</div>
            </div>
          </div>

          <div className="absolute left-6 top-[52%] w-52 rotate-[-1deg] rounded-xl bg-white p-3.5 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-teal-500">Tip</div>
            <div className="text-sm text-slate-600">Arrive early for the best parking spots</div>
          </div>

          <div className="absolute bottom-[25%] left-4 flex w-56 rotate-[2deg] items-center gap-3 rounded-xl bg-white p-3.5 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Corfe Castle</div>
              <div className="text-xs text-slate-400">Visited 15 Mar</div>
            </div>
          </div>
        </div>

        {/* Floating cards — right side */}
        <div className="pointer-events-none absolute inset-y-0 right-[18%] hidden w-[260px] xl:block">
          <div className="absolute right-0 top-[8%] w-60 rotate-[4deg] rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <div className="relative h-40 overflow-hidden rounded-xl">
              <Image src="/bodiam.jpg" alt="Bodiam Castle" fill className="object-cover" sizes="240px" />
            </div>
            <div className="px-1.5 py-2">
              <div className="text-sm font-semibold text-slate-800">Bodiam Castle</div>
              <div className="text-xs text-slate-400">Sussex &middot; Castle</div>
            </div>
          </div>

          <div className="absolute right-16 top-[50%] flex rotate-[-2deg] items-center gap-2.5 rounded-xl bg-white px-5 py-3 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">4.8</span>
            <span className="text-xs text-slate-400">(142)</span>
          </div>

          <div className="absolute bottom-[28%] right-6 flex w-52 rotate-[2deg] items-center gap-3 rounded-xl bg-white p-3.5 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
              <Route className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Dorset Weekend</div>
              <div className="text-xs text-slate-400">3 stops &middot; Apr 12</div>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 mx-auto flex flex-1 max-w-lg items-center justify-center px-6 py-12">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-100">
              <TreePine className="h-4 w-4" />
              Your NT Tracker
            </div>

            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              The{" "}
              <span className="relative inline-block">
                <span className="relative z-10 px-3 text-teal-600">
                  <AnimatedCounter target={count} />
                </span>
                <span className="absolute inset-0 rounded-2xl bg-teal-100/60 ring-1 ring-teal-200/50" />
              </span>
              {" "}places<br />
              waiting for you
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
              From grand country houses to rugged coastlines — discover, track, and plan your National Trust adventures.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#features"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0c2d3f] px-7 text-[15px] font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#164e63] hover:shadow-xl"
              >
                <MapPin className="h-4 w-4" />
                See How It Works
              </a>
              <Button
                render={<Link href={exploreHref} />}
                nativeButton={false}
                size="lg"
                className="border-slate-200 bg-white px-7 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-12 rounded-xl shadow-sm ring-1 ring-slate-200"
              >
                Start Exploring
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Map className="h-4 w-4" />
                <span>{count} properties</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>32 regions</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                <span>Free to use</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute inset-x-0 -bottom-1 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* ── Two-panel showcase ── */}
      <section id="features" className="relative scroll-mt-4 bg-white pt-16 pb-10 px-6">
        {/* Curved top edge */}
        <div className="absolute inset-x-0 -top-10 h-12">
          <svg viewBox="0 0 1440 48" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48Z" fill="white" />
          </svg>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">See what you can do</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Explore the map, track visits, plan trips, and share tips — all in one place.</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {/* Left — Map preview */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-sky-50/60 to-white p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-200/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative space-y-3">
              <div className="rounded-xl bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
                    <Map className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Interactive Map View</div>
                    <div className="text-xs text-slate-500">Filter by region, category &amp; distance</div>
                  </div>
                </div>
              </div>

              <div className="ml-4 rounded-xl bg-white p-3 shadow-sm sm:ml-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-100">
                    <Mountain className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">Stourhead</div>
                    <div className="text-xs text-slate-500">Wiltshire &middot; House &amp; Garden</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-teal-600">
                      <CheckCircle2 className="h-3 w-3" /> Visited
                    </div>
                  </div>
                  <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
                </div>
              </div>

              <div className="ml-4 rounded-xl bg-white p-3 shadow-sm sm:ml-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sky-100">
                    <Mountain className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">Bodiam Castle</div>
                    <div className="text-xs text-slate-500">Sussex &middot; Castle</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-sky-500">
                      <Heart className="h-3 w-3" /> Add to Wishlist
                    </div>
                  </div>
                  <Star className="h-4 w-4 flex-shrink-0 text-slate-200" />
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 text-sm text-slate-400">Search {count} properties...</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500 text-white">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Features grid */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-teal-50/40 to-white p-6 sm:p-8">
            <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20">
                <MapPin className="h-7 w-7 text-white" />
              </div>

              <svg className="pointer-events-none absolute left-1/2 top-14 -z-0 hidden h-[180px] w-full -translate-x-1/2 sm:block" viewBox="0 0 400 180">
                <line x1="200" y1="0" x2="80" y2="55" stroke="#ccfbf1" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="320" y2="55" stroke="#ccfbf1" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="80" y2="135" stroke="#ccfbf1" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="320" y2="135" stroke="#ccfbf1" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              <div className="relative z-10 grid grid-cols-2 gap-3">
                {[
                  { icon: Map, label: "Map Explorer", desc: "Interactive full-screen map" },
                  { icon: CheckCircle2, label: "Visit Tracker", desc: "Check off properties" },
                  { icon: Route, label: "Trip Planner", desc: "Create itineraries" },
                  { icon: Star, label: "Reviews", desc: "Share tips & ratings" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="text-[13px] font-semibold text-slate-800">{item.label}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-500">
                Everything you need to discover, plan, and track your National Trust adventures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Track Your Progress ── */}
      <section className="bg-white px-6 py-10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-sky-50/40 p-6 sm:p-8">
            <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-teal-200/20 blur-3xl" />

            <div className="relative space-y-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">Your Progress</div>
                  <div className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">12%</div>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-[12%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                </div>
                <div className="mt-1.5 text-xs text-slate-500">27 of {count} properties visited</div>
              </div>

              <div className="ml-4 rounded-xl bg-white p-3.5 shadow-sm sm:ml-8">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recent visits</div>
                {[
                  { name: "Stourhead", date: "28 Mar", emoji: "\uD83C\uDFE0" },
                  { name: "Corfe Castle", date: "15 Mar", emoji: "\uD83C\uDFF0" },
                  { name: "White Cliffs", date: "2 Mar", emoji: "\uD83C\uDFD6\uFE0F" },
                ].map((v) => (
                  <div key={v.name} className="flex items-center gap-2.5 border-b border-slate-100 py-1.5 last:border-0">
                    <span className="text-base">{v.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-slate-700">{v.name}</span>
                    <span className="text-xs text-slate-400">{v.date}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-sm">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-slate-600">Castle Explorer unlocked!</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Track every visit.</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              Check off properties as you explore them. Watch your progress grow and see your journey across Britain come to life.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: CheckCircle2, text: "One-tap check-in" },
                { icon: Trophy, text: "Progress tracking" },
                { icon: Heart, text: "Wishlist for later" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan Your Trips ── */}
      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Plan the perfect day out.</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              Group properties into trips, set dates, add notes, and organise your route before you set off.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Route, text: "Trip itineraries" },
                { icon: Calendar, text: "Date planning" },
                { icon: MapPin, text: "Multi-stop routes" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/40 to-teal-50/30 p-6 sm:p-8 lg:order-2">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative space-y-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Dorset Weekend</div>
                    <div className="mt-0.5 text-xs text-slate-500">3 properties &middot; 2 days</div>
                  </div>
                  <div className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    Apr 12-13
                  </div>
                </div>
              </div>

              <div className="ml-4 space-y-2 sm:ml-8">
                {[
                  { num: "1", name: "Corfe Castle", type: "Castle", color: "border-l-violet-400" },
                  { num: "2", name: "Brownsea Island", type: "Coast", color: "border-l-sky-400" },
                  { num: "3", name: "Kingston Lacy", type: "House & Garden", color: "border-l-blue-400" },
                ].map((stop) => (
                  <div key={stop.name} className={`flex items-center gap-2.5 rounded-lg border-l-[3px] bg-white p-2.5 shadow-sm ${stop.color}`}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                      {stop.num}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{stop.name}</div>
                      <div className="text-xs text-slate-400">{stop.type}</div>
                    </div>
                    <Compass className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                ))}
              </div>

              <div className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:ml-4">
                <MessageCircle className="h-3 w-3 text-sky-500" />
                Remember to book parking at Corfe!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews & Tips ── */}
      <section className="bg-white px-6 py-10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-rose-50/40 p-6 sm:p-8">
            <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-amber-200/30 blur-3xl" />

            <div className="relative space-y-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">KM</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-800">Absolutely stunning</div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">2d ago</div>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  The gardens are magnificent in spring. Spent the whole afternoon here.
                </p>
              </div>

              <div className="ml-4 rounded-xl border-l-[3px] border-l-teal-400 bg-white p-3.5 shadow-sm sm:ml-8">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-teal-600">Visitor tip</div>
                <p className="text-sm text-slate-600">
                  Arrive before 10am to avoid crowds. The walled garden is the hidden gem!
                </p>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-800">4.8</span>
                </div>
                <div className="h-3.5 w-px bg-slate-200" />
                <span className="text-xs text-slate-500">142 reviews</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Real tips from real visitors.</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              Read honest reviews and insider tips before you go. Share your experience to help others plan their day out.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Star, text: "Star ratings" },
                { icon: MessageCircle, text: "Visitor tips" },
                { icon: Heart, text: "Helpful votes" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA + Footer ── */}
      <section className="bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
            <MapPin className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ready to start exploring?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            Start tracking your NT visits across England, Wales &amp; Northern Ireland today.
          </p>
          <div className="mt-6">
            <Button
              render={<Link href={exploreHref} />}
              nativeButton={false}
              size="lg"
              className="bg-[#0c2d3f] px-8 text-[15px] font-semibold text-white hover:bg-[#164e63] border-none h-12 rounded-xl shadow-lg shadow-slate-900/10"
            >
              Start Exploring
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-slate-100 px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <TreePine className="h-3.5 w-3.5" />
            NT Finder
          </div>
          <div className="text-xs text-slate-300">
            Not affiliated with the National Trust
          </div>
        </div>
      </footer>
    </div>
  );
}
