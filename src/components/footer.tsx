import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/50 bg-card/40 px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-neon text-background">S</span>
            SOLE<span className="text-gradient">VERSE</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Premium footwear engineered for the future. Crafted in limited runs, designed for life.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Youtube].map((I, i) => (
              <a key={i} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" href="#">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Shop", links: ["Running", "Basketball", "Lifestyle", "Limited Edition"] },
          { title: "Company", links: ["About", "Sustainability", "Press", "Careers"] },
          { title: "Support", links: ["Help Center", "Shipping", "Returns", "Contact"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{col.title}</h4>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l}><Link to="/shop" className="text-foreground/80 hover:text-foreground">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 text-xs text-muted-foreground md:flex-row">
        <p>© 2026 SoleVerse. Crafted with precision.</p>
        <p>Terms · Privacy · Cookies</p>
      </div>
    </footer>
  );
}
