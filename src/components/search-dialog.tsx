import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Sparkles, ArrowRight, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { products } from "@/lib/products";
import { useCurrency } from "@/lib/currency-store";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const { format } = useCurrency();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const handleSelect = () => {
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 border-border bg-card/95 backdrop-blur-2xl">
        <DialogTitle className="sr-only">Search Sneakers</DialogTitle>
        <div className="flex items-center border-b border-border/70 px-4 py-3.5">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by silhouette, category (e.g. Aero Pulse, Running)..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground p-1 text-xs"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === "" ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Popular Categories
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Running", "Basketball", "Limited Edition", "Lifestyle"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setQuery(cat)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-electric hover:text-foreground transition-colors"
                    >
                      <Tag className="h-3 w-3 text-electric" /> {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Trending Now
                </p>
                <div className="mt-2 space-y-1.5">
                  {products.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={handleSelect}
                      className="flex items-center justify-between rounded-xl p-2.5 hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover bg-charcoal"
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.category}</p>
                        </div>
                      </div>
                      <span className="font-display text-xs font-bold text-electric">
                        {format(p.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Found {results.length} results
              </p>
              <div className="space-y-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to="/product/$id"
                    params={{ id: product.id }}
                    onClick={handleSelect}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover bg-charcoal"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.category} · {product.brand}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-3">
                      <span className="font-display text-xs font-bold">
                        {format(product.price)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground opacity-40" />
              <p className="mt-2 text-xs font-semibold text-foreground">
                No matching sneakers found
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Try searching for "Running", "Aero", or "Court".
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
