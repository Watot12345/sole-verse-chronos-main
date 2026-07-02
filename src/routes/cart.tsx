import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, Tag, Truck } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { getProduct } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — SoleVerse" }, { name: "description", content: "Your SoleVerse shopping cart." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, update, remove } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const lines = items
    .map((i) => ({ ...i, product: getProduct(i.id) }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((s, l) => s + (l.product?.price ?? 0) * l.qty, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal - discount + shipping + tax).toFixed(2);

  function applyCoupon() {
    if (coupon.toUpperCase() === "VERSE10") setDiscount(+(subtotal * 0.1).toFixed(2));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-5xl font-bold">Your Cart</h1>
      <p className="mt-2 text-muted-foreground">{lines.length} item{lines.length !== 1 && "s"} in your bag</p>

      {lines.length === 0 ? (
        <div className="glass mt-12 rounded-3xl py-24 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {lines.map((l) => l.product && (
              <div key={`${l.id}-${l.size}`} className="glass flex gap-4 rounded-2xl p-4">
                <img src={l.product.image} alt={l.product.name} className="h-28 w-28 shrink-0 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{l.product.category}</p>
                      <h3 className="truncate font-display text-lg font-semibold">{l.product.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Size US {l.size}</p>
                    </div>
                    <p className="font-display text-lg font-bold">${l.product.price * l.qty}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border p-1">
                      <button onClick={() => update(l.id, l.size, l.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                      <button onClick={() => update(l.id, l.size, l.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button onClick={() => remove(l.id, l.size)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="glass h-fit rounded-2xl p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold">Order Summary</h2>
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon (try VERSE10)"
                  className="w-full rounded-full border border-border bg-background/60 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>
              <button onClick={applyCoupon} className="rounded-full bg-secondary px-4 text-sm font-semibold hover:bg-secondary/70">Apply</button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-neon"><dt>Discount</dt><dd>−${discount.toFixed(2)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : `$${shipping}`}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax (est.)</dt><dd>${tax.toFixed(2)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-display text-lg font-semibold">Total</dt>
                <dd className="font-display text-2xl font-bold">${total.toFixed(2)}</dd>
              </div>
            </dl>

            <Link to="/checkout" className="mt-6 block rounded-full bg-gradient-to-r from-electric to-neon py-4 text-center text-sm font-semibold text-background transition-transform hover:scale-[1.02]">
              Checkout
            </Link>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" /> Free shipping over $150
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
