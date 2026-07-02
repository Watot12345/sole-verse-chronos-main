import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      className="group hover-lift relative overflow-hidden rounded-2xl border border-border/60 bg-card"
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
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0"
          />
          <img
            src={product.altImage}
            alt=""
            loading="lazy"
            width={800}
            height={800}
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
          />

          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-electric to-neon px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          )}

          <button
            onClick={(e) => e.preventDefault()}
            aria-label="Wishlist"
            className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-background/80 opacity-0 backdrop-blur transition-all duration-300 hover:bg-background group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{product.category}</p>
              <h3 className="mt-1 truncate font-display text-base font-semibold">{product.name}</h3>
            </div>
            <button
              onClick={(e) => e.preventDefault()}
              aria-label="Quick add"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-electric text-electric" />
              {product.rating} <span className="opacity-60">({product.reviews})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
