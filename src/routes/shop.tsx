import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const searchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — SoleVerse" },
      { name: "description", content: "Browse the full SoleVerse collection — running, basketball, lifestyle, and limited edition sneakers." },
    ],
  }),
  component: ShopPage,
});

const cats = ["All", "Running", "Basketball", "Lifestyle", "Training", "Casual", "Limited Edition"];

function ShopPage() {
  const search = Route.useSearch();
  const [category, setCategory] = useState<string>(search.category ?? "All");
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      (category === "All" || p.category === category) &&
      p.price <= maxPrice &&
      p.name.toLowerCase().includes(q.toLowerCase()),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, q, maxPrice, sort]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Collection</p>
        <h1 className="mt-2 font-display text-5xl font-bold md:text-6xl">The Shop</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Every silhouette engineered in-house. Filter, explore, claim yours.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-2xl p-5">
            <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sneakers..."
                className="w-full rounded-full border border-border bg-background/60 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Category</p>
            <div className="space-y-1">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    category === c ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Max Price</p>
              <span className="text-sm font-semibold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={500}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-electric"
            />
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Sort</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>{filtered.length} products</span>
          </div>
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl py-20 text-center text-muted-foreground">No products match these filters.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
