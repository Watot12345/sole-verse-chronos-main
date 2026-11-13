import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, Globe, ShieldCheck } from "lucide-react";
import { CurrencySelector } from "./currency-selector";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-card/40 px-4 sm:px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-neon text-background font-black shadow-md">
              S
            </span>
            <span>
              SOLE<span className="text-gradient">VERSE</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Engineered footwear for athletes and cultural tastemakers worldwide. Limited numbered
            runs with climate-sealed express global dispatch.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-4 w-4 text-electric" />
            <span>Shipping worldwide from hubs in Singapore & Frankfurt</span>
          </div>

          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Youtube].map((I, i) => (
              <a
                key={i}
                className="grid h-9 w-9 place-items-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground hover:border-electric"
                href="#"
                aria-label="Social Link"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          {
            title: "Silhouettes",
            links: [
              { label: "Running", to: "/shop" as const, search: { category: "Running" } },
              { label: "Basketball", to: "/shop" as const, search: { category: "Basketball" } },
              { label: "Lifestyle", to: "/shop" as const, search: { category: "Lifestyle" } },
              {
                label: "Limited Drops",
                to: "/shop" as const,
                search: { category: "Limited Edition" },
              },
            ],
          },
          {
            title: "Global Logistics",
            links: [
              { label: "DHL Express Delivery", to: "/checkout" as const },
              { label: "Customs & Duties", to: "/checkout" as const },
              { label: "Worldwide Returns", to: "/dashboard" as const },
              { label: "Order Tracking", to: "/dashboard" as const },
            ],
          },
          {
            title: "Support & Legal",
            links: [
              { label: "Help Center", to: "/dashboard" as const },
              { label: "Size Conversion Chart", to: "/shop" as const },
              { label: "Privacy & GDPR", to: "/" as const },
              { label: "Terms of Service", to: "/" as const },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
              {col.title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    search={l.search}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Legal & Payment Options Bar */}
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p>© 2026 SoleVerse Global Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Currency:</span>
            <CurrencySelector />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="rounded border border-border/60 px-2 py-0.5">VISA</span>
          <span className="rounded border border-border/60 px-2 py-0.5">MASTERCARD</span>
          <span className="rounded border border-border/60 px-2 py-0.5">AMEX</span>
          <span className="rounded border border-border/60 px-2 py-0.5">APPLE PAY</span>
          <span className="rounded border border-border/60 px-2 py-0.5">GOOGLE PAY</span>
          <span className="rounded border border-border/60 px-2 py-0.5">PAYPAL</span>
        </div>
      </div>
    </footer>
  );
}
