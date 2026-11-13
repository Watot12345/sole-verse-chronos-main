import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { getProduct, useProducts } from "@/lib/products";
import { useCurrency } from "@/lib/currency-store";

const FREE_SHIPPING_THRESHOLD_USD = 150;

export function CartDrawer() {
  useProducts(); // re-render when the live catalog loads
  const { items, isDrawerOpen, closeCart, update, remove } = useCart();
  const { format, convert } = useCurrency();

  const lines = items.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product);

  const subtotalUSD = lines.reduce((s, l) => s + (l.product?.price ?? 0) * l.qty, 0);
  const freeShippingMet = subtotalUSD >= FREE_SHIPPING_THRESHOLD_USD;
  const progressPercent = Math.min(100, (subtotalUSD / FREE_SHIPPING_THRESHOLD_USD) * 100);
  const remainingUSD = Math.max(0, FREE_SHIPPING_THRESHOLD_USD - subtotalUSD);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md border-border bg-card/95 backdrop-blur-2xl"
      >
        <SheetHeader className="border-b border-border/60 p-5 pb-4 text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 font-display text-lg font-bold">
              <ShoppingBag className="h-5 w-5 text-electric" />
              Your Bag{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({lines.length} items)
              </span>
            </SheetTitle>
          </div>

          {/* Worldwide Free Shipping Meter */}
          <div className="mt-3 rounded-xl border border-border/60 bg-background/50 p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-foreground">
                <Truck className="h-3.5 w-3.5 text-electric" />
                {freeShippingMet ? (
                  <span className="text-neon font-semibold">
                    🎉 You unlocked FREE Global Express Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-electric">{format(remainingUSD)}</strong> more for
                    FREE Shipping
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-electric to-neon transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-border/80 bg-background/50 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Your bag is empty</h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Explore our performance & lifestyle silhouettes to gear up for your next move.
            </p>
            <Link
              to="/shop"
              onClick={closeCart}
              className="mt-6 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold text-background transition-transform hover:scale-105"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {lines.map((item) => {
                const prod = item.product!;
                return (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="group relative flex gap-3.5 rounded-2xl border border-border/60 bg-background/40 p-3 transition-colors hover:border-border"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover bg-charcoal"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/product/$id"
                            params={{ id: prod.id }}
                            onClick={closeCart}
                            className="truncate font-display text-sm font-semibold hover:text-electric transition-colors"
                          >
                            {prod.name}
                          </Link>
                          <button
                            onClick={() => remove(item.id, item.size)}
                            aria-label="Remove item"
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Size US {item.size} · {prod.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-lg border border-border bg-background/80 px-1 py-0.5">
                          <button
                            onClick={() => update(item.id, item.size, item.qty - 1)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-medium">{item.qty}</span>
                          <button
                            onClick={() => update(item.id, item.size, item.qty + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-display text-sm font-bold">
                          {format(prod.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/60 bg-background/60 p-5 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{format(subtotalUSD)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-foreground">
                    {freeShippingMet ? (
                      <span className="text-neon font-semibold">FREE</span>
                    ) : (
                      format(12)
                    )}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border/60 pt-2 text-sm font-bold">
                  <span>Total</span>
                  <span className="font-display text-lg text-foreground">
                    {format(subtotalUSD + (freeShippingMet ? 0 : 12))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric to-neon py-3.5 text-center text-xs font-bold uppercase tracking-wider text-background shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Checkout Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block w-full rounded-full border border-border bg-background/40 py-2.5 text-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                >
                  View Full Cart & Apply Promos
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-electric" /> Secure Checkout
                </span>
                <span>•</span>
                <span>30-Day Global Returns</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
