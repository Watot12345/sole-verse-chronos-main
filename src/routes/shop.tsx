import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw, LayoutGrid, Grid3X3 } from "lucide-react";
import { z } from "zod";
import { products, type Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { PrimaryColorWheel, hexToHsl } from "@/components/primary-color-wheel";
import { useCurrency } from "@/lib/currency-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const searchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Sneaker Collection — SoleVerse" },
      {
        name: "description",
        content:
          "Browse the full SoleVerse collection — running, basketball, lifestyle, and limited edition sneakers.",
      },
    ],
  }),
  component: ShopPage,
});

const categories = [
  "All",
  "Running",
  "Basketball",
  "Lifestyle",
  "Training",
  "Casual",
  "Limited Edition",
];
const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

function matchesPrimaryColor(productColors: string[], selectedHex: string): boolean {
  const primaryHex = productColors[0];
  if (!primaryHex) return false;
  const target = hexToHsl(selectedHex);
  const prod = hexToHsl(primaryHex);

  // Near-neutral colors (black, white, silver/gray)
  if (target.s < 20) {
    if (prod.s >= 25) return false;
    if (target.l <= 25) return prod.l <= 30;
    if (target.l >= 75) return prod.l >= 70;
    return prod.l > 25 && prod.l < 85;
  }

  // Chromatic color: match by hue proximity (circular 0-360)
  if (prod.s < 15) return false;
  const diff = Math.abs(target.h - prod.h);
  const hueDist = Math.min(diff, 360 - diff);
  return hueDist <= 42;
}

function ShopPage() {
  const search = Route.useSearch();
  const { format, currentConfig } = useCurrency();

  const [category, setCategory] = useState<string>(search.category ?? "All");
  const [q, setQ] = useState("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sort, setSort] = useState("featured");
  const [columns, setColumns] = useState<3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (inStockOnly && !p.inStock) return false;
      if (q.trim()) {
        const query = q.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brand.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchCategory) return false;
      }
      if (selectedColor && !matchesPrimaryColor(p.colors, selectedColor)) {
        return false;
      }
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "reviews") list = [...list].sort((a, b) => b.reviews - a.reviews);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, q, maxPrice, sort, inStockOnly, selectedColor]);

  const activeFiltersCount =
    (category !== "All" ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    (q ? 1 : 0);

  const resetAllFilters = () => {
    setCategory("All");
    setQ("");
    setSelectedSize(null);
    setSelectedColor(null);
    setInStockOnly(false);
    setMaxPrice(500);
    setSort("featured");
  };

  const FiltersContent = (
    <div className="space-y-6">
      {/* Search */}
      <div className="glass rounded-2xl p-5 border border-border/80">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Search Silhouettes
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-full border border-border bg-background/60 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>
      </div>

      {/* Category */}
      <div className="glass rounded-2xl p-5 border border-border/80">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Category
        </p>
        <div className="space-y-1">
          {categories.map((c) => {
            const count =
              c === "All" ? products.length : products.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                  category === c
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{c}</span>
                <span
                  className={`text-[10px] ${
                    category === c ? "text-background/80" : "text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoe Sizes */}
      <div className="glass rounded-2xl p-5 border border-border/80">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Size (US)
          </p>
          {selectedSize && (
            <button
              onClick={() => setSelectedSize(null)}
              className="text-[10px] text-electric hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSize(selectedSize === s ? null : s)}
              className={`rounded-xl border py-2 text-center text-xs font-semibold transition-all ${
                selectedSize === s
                  ? "border-electric bg-electric/15 text-electric shadow-sm"
                  : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="glass rounded-2xl p-5 border border-border/80">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Primary Color
          </p>
          {selectedColor && (
            <div className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-full border border-white/25"
                style={{ backgroundColor: selectedColor }}
              />
              <button
                onClick={() => setSelectedColor(null)}
                className="text-[10px] text-electric hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <PrimaryColorWheel
          wheelOnly
          value={selectedColor ?? "#3b82f6"}
          onChange={(hex) => setSelectedColor(hex)}
        />
      </div>

      {/* Price Slider */}
      <div className="glass rounded-2xl p-5 border border-border/80">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Price Ceiling
          </p>
          <span className="font-display text-xs font-bold text-electric">
            Up to {format(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={500}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-electric cursor-pointer"
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>{format(100)}</span>
          <span>{format(500)}</span>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="glass rounded-2xl p-5 border border-border/80 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">In Stock Only</p>
          <p className="text-[10px] text-muted-foreground">Hide sold out silhouettes</p>
        </div>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-electric cursor-pointer"
        />
      </div>

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <button
          onClick={resetAllFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/40 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      {/* Header Banner */}
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Official Catalog
            </p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              The Collection
            </h1>
            <p className="mt-3 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every silhouette is engineered with proprietary responsive foam and adaptive knit.
              Designed for world-class athletes and style innovators.
            </p>
          </div>

          {/* Quick Category Chips */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-1">
            {categories.slice(1, 5).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? "All" : c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  category === c
                    ? "bg-foreground text-background"
                    : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:self-start">
          {FiltersContent}
        </aside>

        {/* Product Catalog Column */}
        <div>
          {/* Controls Bar */}
          <div className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 border border-border/80">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <button className="flex lg:hidden items-center gap-2 rounded-xl border border-border/80 bg-background/50 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
                    <SlidersHorizontal className="h-4 w-4 text-electric" />
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-full sm:max-w-md overflow-y-auto p-6 border-border bg-card"
                >
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle className="font-display text-lg font-bold">
                      Filter Collection
                    </SheetTitle>
                  </SheetHeader>
                  {FiltersContent}
                </SheetContent>
              </Sheet>

              <p className="text-xs font-medium text-muted-foreground">
                Showing <strong className="text-foreground">{filtered.length}</strong> silhouette
                {filtered.length !== 1 && "s"}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Grid switcher */}
              <div className="hidden sm:flex items-center rounded-xl border border-border/80 bg-background/40 p-0.5">
                <button
                  onClick={() => setColumns(3)}
                  aria-label="3 columns grid"
                  className={`p-1.5 rounded-lg transition-colors ${
                    columns === 3
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setColumns(4)}
                  aria-label="4 columns grid"
                  className={`p-1.5 rounded-lg transition-colors ${
                    columns === 4
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-electric/40 text-foreground cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Popular</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {category !== "All" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                  Category: {category}
                  <button onClick={() => setCategory("All")} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedSize && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                  Size: US {selectedSize}
                  <button onClick={() => setSelectedSize(null)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedColor && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                  Color: {selectedColor}
                  <button onClick={() => setSelectedColor(null)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {maxPrice < 500 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                  Under {format(maxPrice)}
                  <button onClick={() => setMaxPrice(500)} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {q && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-xs text-electric">
                  "{q}"
                  <button onClick={() => setQ("")} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div className="glass rounded-3xl py-24 text-center border border-border/80">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                No silhouettes found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                No sneakers match your selected criteria. Try adjusting your price ceiling, size, or
                clearing filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-6 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold text-background transition-transform hover:scale-105"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-5 sm:grid-cols-2 ${
                columns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"
              }`}
            >
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
