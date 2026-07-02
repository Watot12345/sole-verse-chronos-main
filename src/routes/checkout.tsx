import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CreditCard, Wallet, Smartphone, Truck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — SoleVerse" }] }),
  component: CheckoutPage,
});

const steps = ["Shipping", "Billing", "Payment", "Review", "Confirmation"];

function CheckoutPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold md:text-5xl">Checkout</h1>

      <ol className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <li key={s} className="flex shrink-0 items-center gap-2">
            <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all ${
              i < step ? "bg-gradient-to-br from-electric to-neon text-background" :
              i === step ? "bg-foreground text-background" : "border border-border text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="glass mt-8 rounded-2xl p-6 md:p-10">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" />
            <Field label="Email" type="email" />
            <Field label="Address" className="sm:col-span-2" />
            <Field label="City" />
            <Field label="ZIP" />
            <Field label="Country" />
            <Field label="Phone" />
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Billing name" className="sm:col-span-2" />
            <Field label="Billing address" className="sm:col-span-2" />
            <Field label="City" />
            <Field label="ZIP" />
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">Payment method</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { I: CreditCard, l: "Credit / Debit Card" },
                { I: Wallet, l: "PayPal" },
                { I: Smartphone, l: "Apple Pay" },
                { I: Smartphone, l: "Google Pay" },
                { I: Wallet, l: "GCash" },
                { I: Truck, l: "Cash on Delivery" },
              ].map(({ I, l }) => (
                <label key={l} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-electric/60">
                  <input type="radio" name="pay" className="accent-electric" defaultChecked={l === "Credit / Debit Card"} />
                  <I className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Card number" className="sm:col-span-2" />
              <Field label="Expiry" placeholder="MM/YY" />
              <Field label="CVC" />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Review your order</h2>
            <p className="text-sm text-muted-foreground">Double-check details before placing the order.</p>
            <div className="rounded-xl border border-border p-4 text-sm">
              <p className="font-semibold">Shipping to:</p>
              <p className="text-muted-foreground">123 Future Ave, Metro · Express delivery (1–2 days)</p>
            </div>
            <div className="rounded-xl border border-border p-4 text-sm">
              <p className="font-semibold">Payment:</p>
              <p className="text-muted-foreground">Card ending in •••• 4242</p>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="py-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-electric to-neon">
              <Check className="h-8 w-8 text-background" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold">Order placed</h2>
            <p className="mt-2 text-muted-foreground">A confirmation has been sent to your inbox.</p>
            <Link to="/" className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Continue shopping</Link>
          </div>
        )}

        {step < 4 && (
          <div className="mt-8 flex justify-between gap-3">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="rounded-full bg-gradient-to-r from-electric to-neon px-8 py-3 text-sm font-semibold text-background transition-transform hover:scale-105"
            >
              {step === 3 ? "Place order" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, className = "" }: { label: string; type?: string; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
      />
    </label>
  );
}
