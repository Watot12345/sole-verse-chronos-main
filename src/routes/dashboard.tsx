import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Heart, MapPin, CreditCard, Bell, Eye, User, Sparkles } from "lucide-react";
import { products } from "@/lib/products";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SoleVerse" }] }),
  component: Dashboard,
});

const tabs = [
  { id: "orders", label: "Orders", Icon: Package },
  { id: "wishlist", label: "Wishlist", Icon: Heart },
  { id: "addresses", label: "Addresses", Icon: MapPin },
  { id: "payments", label: "Payments", Icon: CreditCard },
  { id: "notifs", label: "Notifications", Icon: Bell },
  { id: "viewed", label: "Recently Viewed", Icon: Eye },
  { id: "profile", label: "Profile", Icon: User },
] as const;

function Dashboard() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("orders");

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Welcome back, Alex</h1>
        </div>
        <div className="hidden h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-electric to-neon font-bold text-background md:grid">AC</div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="glass h-fit rounded-2xl p-3 lg:sticky lg:top-28">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                tab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {tab === "orders" && (
            <div className="space-y-3">
              {[
                { id: "SV-10248", status: "Delivered", date: "Jun 18, 2026", total: 245, item: products[1] },
                { id: "SV-10231", status: "In transit", date: "Jun 22, 2026", total: 189, item: products[0] },
                { id: "SV-10198", status: "Processing", date: "Jun 26, 2026", total: 420, item: products[3] },
              ].map((o) => (
                <div key={o.id} className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
                  <img src={o.item.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{o.id} · {o.date}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{o.item.name}</h3>
                  </div>
                  <span className="rounded-full bg-electric/15 px-3 py-1 text-xs text-electric">{o.status}</span>
                  <p className="font-display text-lg font-bold">${o.total}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((p) => (
                <Link to="/product/$id" params={{ id: p.id }} key={p.id} className="glass hover-lift block rounded-2xl p-3">
                  <img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
                  <p className="mt-3 font-display font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">${p.price}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === "addresses" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { l: "Home", a: "123 Future Ave, Metro 10001" },
                { l: "Work", a: "88 Studio Lane, District 4" },
              ].map((a) => (
                <div key={a.l} className="glass rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{a.l}</p>
                  <p className="mt-2 font-display text-lg font-semibold">Alex Chen</p>
                  <p className="text-sm text-muted-foreground">{a.a}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "payments" && (
            <div className="space-y-3">
              <div className="glass flex items-center justify-between rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-electric" />
                  <div>
                    <p className="font-display font-semibold">Visa •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 08/28</p>
                  </div>
                </div>
                <span className="rounded-full bg-electric/15 px-3 py-1 text-xs text-electric">Default</span>
              </div>
            </div>
          )}

          {tab === "notifs" && (
            <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
              <p>You're all caught up. New drops will appear here.</p>
            </div>
          )}

          {tab === "viewed" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(2, 6).map((p) => (
                <Link to="/product/$id" params={{ id: p.id }} key={p.id} className="glass hover-lift block rounded-2xl p-3">
                  <img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
                  <p className="mt-3 font-display text-sm font-semibold">{p.name}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === "profile" && (
            <div className="glass rounded-2xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" defaultValue="Alex Chen" />
                <Field label="Email" defaultValue="alex@soleverse.com" />
                <Field label="Phone" defaultValue="+1 555 0142" />
                <Field label="Shoe size" defaultValue="US 9.5" />
              </div>
              <button className="mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Save changes</button>
            </div>
          )}

          {/* AI insights */}
          <div className="glass relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neon/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3 w-3 text-electric" /> AI Insights
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold">Picked for your stride.</h3>
              <p className="mt-1 text-sm text-muted-foreground">Based on your purchase history and browsing patterns.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {products.slice(4, 7).map((p) => (
                  <Link to="/product/$id" params={{ id: p.id }} key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-electric/40">
                    <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">${p.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
      />
    </label>
  );
}
