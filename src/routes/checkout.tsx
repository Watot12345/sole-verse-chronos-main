import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Check,
  CreditCard,
  Wallet,
  Smartphone,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Building,
  Lock,
  Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { getProduct, useProducts } from "@/lib/products";
import { useCurrency } from "@/lib/currency-store";
import { useCmsContent } from "@/lib/cms-store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Worldwide Checkout — SoleVerse" },
      {
        name: "description",
        content: "Complete your sneaker purchase with 256-bit encrypted global checkout.",
      },
    ],
  }),
  component: CheckoutPage,
});

const steps = ["Shipping", "Method", "Payment", "Review", "Confirmation"];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "PH", name: "Philippines" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "NL", name: "Netherlands" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
];

function CheckoutPage() {
  const products = useProducts();
  const navigate = useNavigate();
  const { user, isAuthenticated, isHydrated, addOrder, updateProfile } = useAuth();
  const { items, clear, add } = useCart();
  const { format, convert } = useCurrency();
  const { content } = useCmsContent();
  const freeShippingThresholdUSD = content.freeShippingThresholdUSD || 150;
  const [step, setStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");

  // Shipping form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "United States",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
  });

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<"standard" | "dhl" | "fedex">("dhl");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"card" | "applepay" | "paypal" | "klarna">(
    "card",
  );
  const [cardData, setCardData] = useState({
    number: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvc: "888",
    name: "",
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      toast.info("Please sign in to proceed to checkout");
      void navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [isHydrated, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      fullName: prev.fullName || user.fullName,
      email: prev.email || user.email,
      phone: prev.phone || user.phone,
      country: user.country || prev.country,
      address: prev.address || user.address,
      apartment: prev.apartment || user.apartment,
      city: prev.city || user.city,
      state: prev.state || user.state,
      zip: prev.zip || user.zip,
    }));
    setCardData((prev) => ({
      ...prev,
      name: prev.name || user.fullName,
    }));
  }, [user]);

  // Cart lines resolution
  const lines = items.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product);

  const subtotalUSD = lines.reduce((s, l) => s + (l.product?.price ?? 0) * l.qty, 0);

  // Shipping fee calculation
  const shippingCostUSD =
    shippingMethod === "fedex"
      ? 28
      : shippingMethod === "dhl"
        ? subtotalUSD >= freeShippingThresholdUSD
          ? 0
          : 15
        : subtotalUSD >= freeShippingThresholdUSD
          ? 0
          : 10;

  const estimatedTaxUSD = +(subtotalUSD * 0.08).toFixed(2);
  const totalUSD = subtotalUSD + shippingCostUSD + estimatedTaxUSD;

  const handlePlaceOrder = () => {
    const generatedId = `SV-${Math.floor(100000 + Math.random() * 900000)}-INTL`;
    const primaryProduct = lines[0]?.product ?? products[0];
    const courierLabel =
      shippingMethod === "fedex"
        ? "FedEx Priority International"
        : shippingMethod === "dhl"
          ? "DHL Express Worldwide"
          : "Standard International Tracked";

    addOrder({
      id: generatedId,
      trackingNumber: `${shippingMethod === "fedex" ? "FDX" : "DHL"}-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      courier: courierLabel,
      status: "Processing",
      currentStep: 1,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      estimatedDelivery: "Dispatching in 24 hours",
      totalUSD,
      origin: "SoleVerse Global Fulfillment",
      destination: `${formData.city}, ${formData.country}`,
      item: primaryProduct,
      items: lines.map((l) => ({
        id: l.id,
        name: l.product!.name,
        category: l.product!.category,
        image: l.product!.image,
        size: l.size,
        qty: l.qty,
        price: l.product!.price,
      })),
    });

    updateProfile({
      fullName: formData.fullName,
      phone: formData.phone,
      country: formData.country,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
    });

    setOrderNumber(generatedId);
    setStep(4);
    clear();
    toast.success("Order Placed Successfully!", {
      description: `Confirmation email dispatched to ${formData.email}`,
    });
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Verifying your SoleVerse session...</p>
      </div>
    );
  }

  const handleFieldChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // If cart is empty on step 0, provide sample fill button
  const handleLoadDemoCart = () => {
    add({ id: products[0].id, size: 9.5, qty: 1 }, false, false);
    add({ id: products[1].id, size: 10, qty: 1 }, false, false);
    toast.info("Added demo silhouettes to bag for checkout preview");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Secure Global Checkout</h1>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-electric" /> 256-bit TLS encrypted transaction · Fraud
            protection active
          </p>
        </div>

        {/* Stepper Progress */}
        <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-1 sm:gap-2">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-all ${
                  i < step
                    ? "bg-gradient-to-br from-electric to-neon text-background"
                    : i === step
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs ${
                  i === step ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-4 sm:w-6 bg-border" />}
            </li>
          ))}
        </ol>
      </div>

      {step === 4 ? (
        /* Step 5: Confirmation Success Screen */
        <div className="glass mx-auto mt-10 max-w-2xl rounded-3xl p-8 sm:p-12 text-center border border-border/80 shadow-2xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-electric to-neon text-background shadow-lg">
            <Check className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl font-bold">Order Confirmed!</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Thank you, <strong className="text-foreground">{formData.fullName}</strong>. Your
            payment was verified and your order reference is:
          </p>
          <div className="mt-4 inline-block rounded-xl border border-electric/40 bg-electric/10 px-4 py-2 font-mono text-sm font-bold text-electric">
            {orderNumber}
          </div>

          <div className="mt-8 rounded-2xl border border-border/80 bg-background/50 p-5 text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Courier Service:</span>
              <span className="font-semibold text-foreground">
                {shippingMethod === "dhl"
                  ? "DHL Express Worldwide"
                  : shippingMethod === "fedex"
                    ? "FedEx Priority International"
                    : "Standard Tracked Post"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Shipping To:</span>
              <span className="font-semibold text-foreground text-right">
                {formData.address}, {formData.city}, {formData.country}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Tracking Number:</span>
              <span className="font-mono text-electric font-semibold">DHL-EXP-99482019</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confirmation Email:</span>
              <span className="font-semibold text-foreground">{formData.email}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background transition-transform hover:scale-105"
            >
              Track in Account Dashboard
            </Link>
            <Link
              to="/shop"
              className="rounded-full border border-border bg-background/50 px-6 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        /* Steps 0 to 3: Checkout Form + Order Summary Sidebar */
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Checkout Form Card */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/80">
            {/* Step 0: International Shipping Address */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    1. International Shipping Address
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Where should we deliver your SoleVerse order?
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Destination Country / Region
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleFieldChange("country", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Email (for tracking & receipt)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      placeholder="Street name and house/flat number"
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Apartment / Suite (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => handleFieldChange("apartment", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      State / Province / County
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => handleFieldChange("zip", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Phone Number (Required for courier SMS delivery)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-3 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Shipping Courier Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    2. Select International Shipping Method
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Delivering to{" "}
                    <strong>
                      {formData.city}, {formData.country}
                    </strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethod("dhl")}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                      shippingMethod === "dhl"
                        ? "border-electric bg-electric/10 shadow-md ring-1 ring-electric"
                        : "border-border/80 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={shippingMethod === "dhl"}
                        onChange={() => setShippingMethod("dhl")}
                        className="accent-electric"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-foreground">
                            DHL Express Worldwide
                          </p>
                          <span className="rounded bg-electric/20 px-2 py-0.5 text-[10px] font-bold text-electric">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          2 to 4 business days · Real-time GPS flight tracking
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-xs font-bold text-foreground">
                      {subtotalUSD >= freeShippingThresholdUSD ? <span className="text-neon">FREE</span> : format(15)}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("fedex")}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                      shippingMethod === "fedex"
                        ? "border-electric bg-electric/10 shadow-md ring-1 ring-electric"
                        : "border-border/80 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={shippingMethod === "fedex"}
                        onChange={() => setShippingMethod("fedex")}
                        className="accent-electric"
                      />
                      <div>
                        <p className="font-semibold text-xs text-foreground">
                          FedEx Priority International
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          1 to 3 business days · Next-flight outbound guarantee
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-xs font-bold text-foreground">
                      {format(28)}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("standard")}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                      shippingMethod === "standard"
                        ? "border-electric bg-electric/10 shadow-md ring-1 ring-electric"
                        : "border-border/80 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-electric"
                      />
                      <div>
                        <p className="font-semibold text-xs text-foreground">
                          Standard Tracked Postal Service
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          6 to 10 business days · Standard local postal handover
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-xs font-bold text-foreground">
                      {subtotalUSD >= freeShippingThresholdUSD ? <span className="text-neon">FREE</span> : format(10)}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold">3. Payment Information</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All transactions are encrypted with PCI-DSS Level 1 compliance.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      id: "card",
                      title: "Credit / Debit Card",
                      icon: CreditCard,
                      subtitle: "Visa, Mastercard, Amex",
                    },
                    {
                      id: "applepay",
                      title: "Apple / Google Pay",
                      icon: Smartphone,
                      subtitle: "1-Tap Express Pay",
                    },
                    { id: "paypal", title: "PayPal", icon: Wallet, subtitle: "Buyer Protection" },
                    {
                      id: "klarna",
                      title: "Klarna / Afterpay",
                      icon: Building,
                      subtitle: "Pay in 4 Installments",
                    },
                  ].map((m) => (
                    <label
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as never)}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                        paymentMethod === m.id
                          ? "border-electric bg-electric/10 ring-1 ring-electric shadow-sm"
                          : "border-border/80 hover:bg-secondary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id as never)}
                        className="accent-electric mt-0.5"
                      />
                      <div>
                        <p className="font-semibold text-xs text-foreground">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">{m.subtitle}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-4">
                    <div>
                      <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-electric/40"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-electric/40"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                          Security Code (CVC)
                        </label>
                        <input
                          type="password"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                          className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-electric/40"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "klarna" && (
                  <div className="rounded-2xl border border-electric/30 bg-electric/10 p-4 text-xs text-foreground">
                    <p className="font-semibold">Pay in 4 interest-free installments of:</p>
                    <p className="mt-1 font-display text-lg font-bold text-electric">
                      {format(totalUSD / 4)} / every 2 weeks
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      No interest or fees when paid on time. Automatic deduction.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold">4. Review & Confirm Order</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Verify all shipping, billing, and order items before authorizing payment.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-2xl border border-border/80 bg-background/40 p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-foreground">Delivery Destination</span>
                      <button
                        onClick={() => setStep(0)}
                        className="text-[11px] text-electric hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-muted-foreground">
                      {formData.fullName} ({formData.phone})<br />
                      {formData.address}, {formData.apartment && `${formData.apartment}, `}
                      {formData.city}, {formData.state} {formData.zip}, {formData.country}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-background/40 p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-foreground">Shipping Courier</span>
                      <button
                        onClick={() => setStep(1)}
                        className="text-[11px] text-electric hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-muted-foreground">
                      {shippingMethod === "dhl"
                        ? "DHL Express Worldwide (2-4 business days)"
                        : shippingMethod === "fedex"
                          ? "FedEx Priority International (1-3 days)"
                          : "Standard Tracked Post"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-background/40 p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-foreground">Payment Authorization</span>
                      <button
                        onClick={() => setStep(2)}
                        className="text-[11px] text-electric hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-muted-foreground">
                      {paymentMethod === "card"
                        ? `Card ending in 4242 (Visa)`
                        : paymentMethod === "applepay"
                          ? "Apple / Google Pay Express"
                          : paymentMethod === "klarna"
                            ? "Klarna 4-Installment Plan"
                            : "PayPal Express"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              <button
                onClick={() => {
                  if (lines.length === 0) {
                    toast.error("Your cart is currently empty! Add a shoe first.");
                    return;
                  }
                  if (step === 3) {
                    handlePlaceOrder();
                  } else {
                    setStep(step + 1);
                  }
                }}
                className="rounded-full bg-gradient-to-r from-electric to-neon px-8 py-3 text-xs font-bold uppercase tracking-wider text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {step === 3 ? "Authorize & Place Order" : "Continue"}
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Order Summary Sidebar */}
          <aside className="glass h-fit rounded-3xl p-6 border border-border/80 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-base font-bold">Order Summary</h3>
              <span className="text-xs text-muted-foreground">({lines.length} items)</span>
            </div>

            {lines.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-muted-foreground">No shoes in cart</p>
                <button
                  onClick={handleLoadDemoCart}
                  className="rounded-full border border-electric/40 bg-electric/10 px-3 py-1.5 text-[11px] font-semibold text-electric hover:bg-electric/20 transition-colors"
                >
                  + Add 2 Demo Shoes to Cart
                </button>
              </div>
            ) : (
              <div className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-1">
                {lines.map((l) => (
                  <div key={`${l.id}-${l.size}`} className="flex items-center gap-3 text-xs">
                    <img
                      src={l.product!.image}
                      alt={l.product!.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover bg-charcoal"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{l.product!.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Size US {l.size} · Qty {l.qty}
                      </p>
                    </div>
                    <span className="font-display font-bold text-foreground">
                      {format(l.product!.price * l.qty)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <dl className="mt-5 space-y-2.5 border-t border-border/60 pt-4 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd className="font-medium text-foreground">{format(subtotalUSD)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Shipping</dt>
                <dd className="font-medium text-foreground">
                  {shippingCostUSD === 0 ? (
                    <span className="text-neon font-bold">FREE</span>
                  ) : (
                    format(shippingCostUSD)
                  )}
                </dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Estimated Tax & Duties</dt>
                <dd className="font-medium text-foreground">{format(estimatedTaxUSD)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-display text-sm font-bold">Total ({formData.country})</dt>
                <dd className="font-display text-xl font-bold text-foreground">
                  {format(totalUSD)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/40 p-2.5 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-electric shrink-0" />
              <span>Money-Back Guarantee · 30-Day Free Returns</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
