import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { getProduct, products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — SoleVerse` },
          { name: "description", content: `${loaderData.product.name} by SoleVerse. ${loaderData.product.category}.` },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-electric">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [tab, setTab] = useState<"desc" | "spec" | "ship">("desc");
  const { add } = useCart();

  const gallery = [product.image, product.altImage, product.image, product.altImage];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <motion.div
            key={color}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-charcoal via-background to-charcoal"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.27_305/0.2),transparent_60%)]" />
            <img
              src={gallery[color]}
              alt={product.name}
              width={1200}
              height={1200}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ animation: "float 8s ease-in-out infinite" }}
            />
            <span className="glass absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">360°</span>
          </motion.div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setColor(i)}
                className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${
                  color === i ? "border-electric glow-blue" : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                <img src={g} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.brand} · {product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-electric text-electric" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>
            {product.inStock ? (
              <span className="rounded-full bg-electric/15 px-2 py-0.5 text-xs text-electric">In Stock</span>
            ) : (
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">Sold Out</span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                <span className="rounded-full bg-neon/20 px-2 py-0.5 text-xs font-bold text-neon">
                  Save ${product.originalPrice - product.price}
                </span>
              </>
            )}
          </div>

          {/* Colors */}
          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Color</p>
            <div className="flex gap-2">
              {product.colors.map((c: string, i: number) => (
                <button
                  key={c}
                  onClick={() => setColor(i % gallery.length)}
                  style={{ background: c }}
                  className={`h-10 w-10 rounded-full border-2 transition-transform ${
                    (color % product.colors.length) === i ? "border-electric scale-110" : "border-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Size (US)</p>
              <button className="inline-flex items-center gap-1 text-xs text-electric hover:underline">
                <Sparkles className="h-3 w-3" /> AI size recommendation
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-lg border py-3 text-sm font-medium transition-all ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => size && add({ id: product.id, size, qty })}
              disabled={!size}
              className="flex-1 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {size ? "Add to Cart" : "Select a size"}
            </button>
            <button className="grid h-14 w-14 place-items-center rounded-full border border-border hover:bg-secondary">
              <Heart className="h-5 w-5" />
            </button>
          </div>
          <Link
            to="/checkout"
            className="mt-3 block rounded-full bg-gradient-to-r from-electric to-neon py-4 text-center text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
          >
            Buy Now
          </Link>

          {/* Perks */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
            <div className="glass flex items-center gap-2 rounded-xl p-3"><Truck className="h-4 w-4 text-electric" /> Free shipping over $150</div>
            <div className="glass flex items-center gap-2 rounded-xl p-3"><ShieldCheck className="h-4 w-4 text-neon" /> 100% authentic</div>
          </div>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex gap-6 border-b border-border">
              {[
                ["desc", "Description"],
                ["spec", "Specifications"],
                ["ship", "Shipping & Returns"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setTab(k as never)}
                  className={`relative -mb-px py-3 text-sm transition-colors ${
                    tab === k ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l}
                  {tab === k && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-electric to-neon" />}
                </button>
              ))}
            </div>
            <div className="prose-invert mt-5 text-sm text-muted-foreground">
              {tab === "desc" && (
                <p>
                  The {product.name} fuses sculpted geometry with responsive cushioning. Engineered with breathable
                  composite mesh, a carbon-fiber midplate, and a precision-molded outsole for explosive transitions.
                  A statement piece equally at home in the studio and the street.
                </p>
              )}
              {tab === "spec" && (
                <ul className="space-y-1">
                  <li>· Upper: Engineered mesh + premium leather overlays</li>
                  <li>· Midsole: ResponsiveFoam™ with carbon plate</li>
                  <li>· Outsole: High-abrasion rubber with traction pods</li>
                  <li>· Weight: 285g (size 9)</li>
                  <li>· Made in Vietnam</li>
                </ul>
              )}
              {tab === "ship" && (
                <p>
                  Free standard shipping on orders over $150. Express delivery available at checkout.
                  Returns accepted within 30 days for unworn merchandise in original packaging.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended */}
      <section className="mt-24">
        <h2 className="mb-8 font-display text-3xl font-bold">You might also like</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.filter((p) => p.id !== product.id).slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
