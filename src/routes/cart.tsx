import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  Truck,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { getProduct, useProducts } from "@/lib/products";
import { useCurrency } from "@/lib/currency-store";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — SoleVerse" },
      {
        name: "description",
        content: "Review items in your SoleVerse shopping cart before international checkout.",
      },
    ],
  }),
  component: CartPage,
});

const FREE_SHIPPING_THRESHOLD_USD = 150;

function CartPage() {
  useProducts(); // re-render when the live catalog loads
  const { items, update, remove, clear } = useCart();
  const { format, convert } = useCurrency();
  const [coupon, setCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [freeShippingApplied, setFreeShippingApplied] = useState(false);

  const lines = items.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product);

  const subtotalUSD = lines.reduce((s, l) => s + (l.product?.price ?? 0) * l.qty, 0);
  const discountUSD = subtotalUSD * discountPercent;
  const standardShippingUSD =
    subtotalUSD >= FREE_SHIPPING_THRESHOLD_USD || subtotalUSD === 0 || freeShippingApplied ? 0 : 12;
  const estimatedTaxUSD = +(subtotalUSD * 0.08).toFixed(2);
  const totalUSD = Math.max(0, subtotalUSD - discountUSD + standardShippingUSD + estimatedTaxUSD);

  const progressPercent = Math.min(100, (subtotalUSD / FREE_SHIPPING_THRESHOLD_USD) * 100);
  const remainingUSD = Math.max(0, FREE_SHIPPING_THRESHOLD_USD - subtotalUSD);

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (code === "VERSE10") {
      setDiscountPercent(0.1);
      toast.success("Coupon 'VERSE10' applied: 10% discount added!");
    } else if (code === "CHRONOS20") {
      setDiscountPercent(0.2);
      toast.success("VIP Coupon 'CHRONOS20' applied: 20% discount added!");
    } else if (code === "GLOBALFREE") {
      setFreeShippingApplied(true);
      toast.success("Coupon 'GLOBALFREE' applied: Free international shipping unlocked!");
    } else {
      toast.error("Invalid coupon code. Try VERSE10 or CHRONOS20.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">Your Bag</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {lines.length} unique silhouette{lines.length !== 1 && "s"} ready for dispatch
          </p>
        </div>
        {lines.length > 0 && (
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear Entire Bag
          </button>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="glass mt-12 rounded-3xl py-24 text-center border border-border/80">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Truck className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">Your bag is empty</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
            You haven't added any pairs yet. Explore our performance runners, basketball court
            shoes, or lifestyle silhouettes.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-foreground px-8 py-3 text-xs font-bold uppercase tracking-wider text-background shadow-lg transition-transform hover:scale-105"
          >
            Explore The Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {/* Free shipping banner */}
            <div className="rounded-2xl border border-border/80 bg-background/50 p-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-electric" />
                  {subtotalUSD >= FREE_SHIPPING_THRESHOLD_USD || freeShippingApplied ? (
                    <span className="text-neon font-bold">
                      🎉 Congratulations! You have unlocked FREE Express Worldwide Shipping.
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-electric">{format(remainingUSD)}</strong> more to
                      get <strong>FREE Express Worldwide Shipping</strong>
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground font-mono">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-electric to-neon transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            {lines.map((l) => (
              <div
                key={`${l.id}-${l.size}`}
                className="glass flex flex-col sm:flex-row gap-4 rounded-2xl p-4 sm:p-5 border border-border/80"
              >
                <img
                  src={l.product!.image}
                  alt={l.product!.name}
                  className="h-28 w-28 shrink-0 rounded-xl object-cover bg-charcoal self-center sm:self-start"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {l.product!.category}
                      </p>
                      <Link
                        to="/product/$id"
                        params={{ id: l.product!.id }}
                        className="font-display text-base sm:text-lg font-bold text-foreground hover:text-electric transition-colors"
                      >
                        {l.product!.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Size: <strong className="text-foreground">US {l.size}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-base sm:text-lg font-bold text-foreground">
                        {format(l.product!.price * l.qty)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(l.product!.price)} each
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                    <div className="flex items-center gap-1 rounded-full border border-border bg-background/60 p-1">
                      <button
                        onClick={() => update(l.id, l.size, l.qty - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">{l.qty}</span>
                      <button
                        onClick={() => update(l.id, l.size, l.qty + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => remove(l.id, l.size)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Column */}
          <aside className="glass h-fit rounded-2xl p-6 border border-border/80 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Promo Code (try VERSE10)"
                  className="w-full rounded-full border border-border bg-background/60 py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                />
              </div>
              <button
                onClick={applyCoupon}
                className="rounded-full bg-secondary px-4 text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                Apply
              </button>
            </div>

            {/* Pricing Breakdown */}
            <dl className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="font-medium text-foreground">{format(subtotalUSD)}</dd>
              </div>

              {discountUSD > 0 && (
                <div className="flex justify-between text-neon font-semibold">
                  <dt>Promotional Discount</dt>
                  <dd>−{format(discountUSD)}</dd>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <dt>Worldwide Express Shipping</dt>
                <dd className="font-medium text-foreground">
                  {standardShippingUSD === 0 ? (
                    <span className="text-neon font-bold">FREE</span>
                  ) : (
                    format(standardShippingUSD)
                  )}
                </dd>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <dt>Estimated Duties & Tax</dt>
                <dd className="font-medium text-foreground">{format(estimatedTaxUSD)}</dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <dt className="font-display text-base font-bold">Total</dt>
                <dd className="font-display text-2xl font-black text-foreground">
                  {format(totalUSD)}
                </dd>
              </div>
            </dl>

            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric to-neon py-3.5 text-center text-xs font-bold uppercase tracking-wider text-background shadow-xl transition-transform hover:scale-[1.02] active:scale-95"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-electric shrink-0" />
                <span>256-Bit SSL Encrypted Global Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-neon shrink-0" />
                <span>30-Day Hassle-Free Global Returns & Exchanges</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
