import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { useCurrency } from "@/lib/currency-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { format } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { add } = useCart();
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    // Quick-add standard default size (US 9.5)
    add({ id: product.id, size: 9.5, qty: 1 }, true, true);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      className="group hover-lift relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 transition-all hover:border-border"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-charcoal to-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.27_305/0.15),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={product.altImage}
            alt=""
            loading="lazy"
            width={800}
            height={800}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
          />

          {/* Badges */}
          <div className="absolute left-3.5 top-3.5 flex flex-col gap-1.5 z-10">
            {product.badge && (
              <span className="rounded-full bg-gradient-to-r from-electric to-neon px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-background shadow-md">
                {product.badge}
              </span>
            )}
            {!product.inStock && (
              <span className="rounded-full bg-destructive/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                Sold Out
              </span>
            )}
          </div>

          {product.originalPrice && (
            <span className="absolute right-3.5 top-3.5 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur border border-border/60 text-foreground z-10">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute bottom-3.5 right-3.5 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-300 ${
              wishlisted
                ? "bg-neon text-background shadow-lg"
                : "bg-background/80 text-muted-foreground opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:text-foreground hover:bg-background"
            }`}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {product.category}
              </p>
              <h3 className="mt-1 truncate font-display text-base font-semibold group-hover:text-electric transition-colors">
                {product.name}
              </h3>
            </div>

            {/* Quick Add Button */}
            {product.inStock && (
              <button
                onClick={handleQuickAdd}
                aria-label={`Quick add ${product.name} to cart`}
                title="Quick Add (US 9.5)"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-110 active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base sm:text-lg font-bold text-foreground">
                {format(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {format(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-electric text-electric" />
              <span className="font-semibold text-foreground">{product.rating}</span>
              <span className="opacity-60 text-[11px]">({product.reviews})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
