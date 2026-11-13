import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Eye,
  User,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Truck,
  Clock,
  ArrowRight,
  Globe,
  LogOut,
} from "lucide-react";
import { useAuth, type OrderRecord } from "@/lib/auth-store";
import { products, getProduct } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { useCurrency } from "@/lib/currency-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Account Dashboard — SoleVerse" }] }),
  component: Dashboard,
});

const tabs = [
  { id: "orders", label: "Orders & Tracking", Icon: Package },
  { id: "wishlist", label: "Wishlist", Icon: Heart },
  { id: "addresses", label: "Saved Addresses", Icon: MapPin },
  { id: "payments", label: "Payment Methods", Icon: CreditCard },
  { id: "notifs", label: "Drops & Alerts", Icon: Bell },
  { id: "viewed", label: "Recently Viewed", Icon: Eye },
  { id: "profile", label: "Personal Profile", Icon: User },
] as const;

interface OrderItem {
  id: string;
  trackingNumber: string;
  courier: string;
  status: "In Transit" | "Delivered" | "Processing";
  currentStep: number;
  date: string;
  estimatedDelivery: string;
  totalUSD: number;
  origin: string;
  destination: string;
  item: (typeof products)[number];
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "SV-10248-INTL",
    trackingNumber: "DHL-EXP-8849201",
    courier: "DHL Express Worldwide",
    status: "Delivered",
    currentStep: 4,
    date: "Jun 18, 2026",
    estimatedDelivery: "Delivered on Jun 21, 2026",
    totalUSD: 245,
    origin: "Frankfurt Hub, DE",
    destination: "London, UK",
    item: products[1],
  },
  {
    id: "SV-10231-INTL",
    trackingNumber: "DHL-EXP-9923144",
    courier: "DHL Express Worldwide",
    status: "In Transit",
    currentStep: 2,
    date: "Jun 22, 2026",
    estimatedDelivery: "Expected tomorrow by 6:00 PM",
    totalUSD: 189,
    origin: "Singapore Regional Facility, SG",
    destination: "Tokyo, JP",
    item: products[0],
  },
  {
    id: "SV-10198-INTL",
    trackingNumber: "FDX-PRI-3349102",
    courier: "FedEx Priority International",
    status: "Processing",
    currentStep: 1,
    date: "Jun 26, 2026",
    estimatedDelivery: "Dispatching in 24 hours",
    totalUSD: 420,
    origin: "Precision Lab, US",
    destination: "Paris, FR",
    item: products[3],
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isHydrated, orders, signOut, updateProfile } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("orders");
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { add } = useCart();
  const { format } = useCurrency();

  // Selected order for tracking modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Address book state
  const [addresses, setAddresses] = useState([
    {
      id: "a1",
      label: "Primary Residence",
      name: "Alex Chen",
      street: "123 Future Ave, Apt 4B",
      city: "Metro",
      country: "United States",
      zip: "10001",
      isDefault: true,
    },
  ]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Vacation",
    name: "",
    street: "",
    city: "",
    country: "United States",
    zip: "",
  });

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    shoeSize: "US 9.5",
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      void navigate({ to: "/login", search: { redirect: "/dashboard" } });
    }
  }, [isHydrated, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
    }));
    setAddresses([
      {
        id: "a-primary",
        label: "Primary Residence",
        name: user.fullName,
        street: [user.address, user.apartment].filter(Boolean).join(", ") || "Address not set",
        city: [user.city, user.state].filter(Boolean).join(", ") || "City",
        country: user.country || "United States",
        zip: user.zip || "",
        isDefault: true,
      },
    ]);
    setNewAddr((prev) => ({ ...prev, name: user.fullName }));
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: profile.name,
      phone: profile.phone,
    });
    toast.success("Profile preferences updated successfully");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city) {
      toast.error("Please fill in the street address and city");
      return;
    }
    setAddresses([...addresses, { ...newAddr, id: `a-${Date.now()}`, isDefault: false }]);
    setAddressModalOpen(false);
    toast.success("New address added to your address book");
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.info("Address removed");
  };

  const wishlistedProducts = wishlist
    .map((id) => getProduct(id))
    .filter(Boolean) as (typeof products)[number][];

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Loading your SoleVerse account...</p>
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      {/* Header */}
      <div className="flex items-end justify-between gap-6 border-b border-border/80 pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            Customer Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-bold">
            Welcome back, {profile.name}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your worldwide deliveries, saved silhouettes, and account credentials.
          </p>
        </div>
        <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-electric to-neon font-display font-black text-background md:grid shadow-lg">
          {initials}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Navigation Sidebar */}
        <aside className="glass h-fit rounded-2xl p-2.5 lg:sticky lg:top-24 border border-border/80">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <t.Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </div>
              {t.id === "wishlist" && wishlist.length > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "wishlist" ? "bg-background text-foreground" : "bg-neon text-background"}`}
                >
                  {wishlist.length}
                </span>
              )}
            </button>
          ))}
          <div className="mt-2 border-t border-border/60 pt-2">
            <button
              type="button"
              onClick={() => {
                signOut();
                void navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Tab Content Column */}
        <div className="space-y-6">
          {/* TAB 1: Orders & Real-time Live Tracking */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Past Orders & Shipments</h2>
                <span className="text-xs text-muted-foreground">
                  {orders.length} order{orders.length !== 1 && "s"} on record
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center border border-border/80">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-3 font-display text-base font-bold">No orders yet</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Once you place an order, your tracking number and live delivery status will
                    appear here.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-bold text-background"
                  >
                    Browse Sneakers
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5 border border-border/80 transition-all hover:border-border"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={o.item.image}
                          alt={o.item.name}
                          className="h-20 w-20 rounded-xl object-cover bg-charcoal"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {o.id}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                o.status === "Delivered"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : o.status === "In Transit"
                                    ? "bg-electric/15 text-electric"
                                    : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-base font-bold text-foreground">
                            {o.item.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            {o.date} · {o.courier}
                          </p>
                        </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                      <p className="font-display text-base font-bold text-foreground">
                        {format(o.totalUSD)}
                      </p>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3.5 py-1.5 text-xs font-semibold text-electric hover:bg-electric/20 transition-colors"
                      >
                        <Truck className="h-3.5 w-3.5" /> Track Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* TAB 2: Dynamic Wishlist */}
          {tab === "wishlist" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Saved Silhouettes</h2>
                  <p className="text-xs text-muted-foreground">
                    Sneakers you have bookmarked for future drops.
                  </p>
                </div>
                {wishlistedProducts.length > 0 && (
                  <button
                    onClick={clearWishlist}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="glass rounded-3xl py-16 text-center border border-border/80">
                  <Heart className="mx-auto h-10 w-10 text-muted-foreground opacity-40 stroke-[1.5]" />
                  <h3 className="mt-3 font-display text-base font-bold text-foreground">
                    Your wishlist is empty
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                    Click the heart icon on any sneaker in our shop to save it here for later.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-5 inline-block rounded-full bg-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:scale-105 transition-transform"
                  >
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="glass rounded-2xl p-4 border border-border/80 space-y-3"
                    >
                      <Link to="/product/$id" params={{ id: p.id }} className="block">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="aspect-square w-full rounded-xl object-cover bg-charcoal"
                        />
                        <p className="mt-2.5 font-display text-sm font-bold text-foreground truncate">
                          {p.name}
                        </p>
                        <p className="text-xs font-bold text-electric">{format(p.price)}</p>
                      </Link>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <button
                          onClick={() => add({ id: p.id, size: 9.5, qty: 1 }, true, true)}
                          className="flex-1 rounded-full bg-foreground py-2 text-center text-[11px] font-bold uppercase tracking-wider text-background hover:scale-102 transition-transform"
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          aria-label="Remove from wishlist"
                          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {tab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Global Shipping Addresses</h2>
                  <p className="text-xs text-muted-foreground">
                    Addresses stored for one-click international checkout.
                  </p>
                </div>
                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background hover:scale-105 transition-transform"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className="glass relative rounded-2xl p-5 border border-border/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {a.label}
                      </span>
                      {a.isDefault && (
                        <span className="rounded-full bg-electric/15 px-2 py-0.5 text-[10px] font-bold text-electric">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-display text-base font-bold text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.street}
                      <br />
                      {a.city}, {a.country} {a.zip}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleRemoveAddress(a.id)}
                        className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Payment Methods */}
          {tab === "payments" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Saved Payment Methods</h2>
              <div className="space-y-3">
                <div className="glass flex items-center justify-between rounded-2xl p-5 border border-border/80">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-electric/15 text-electric">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">
                        Visa ending in •••• 4242
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires 08/28 · International Enabled
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-electric/15 px-3 py-1 text-xs font-semibold text-electric">
                    Primary
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Notifications & Drops */}
          {tab === "notifs" && (
            <div className="glass rounded-2xl p-6 border border-border/80 text-xs text-muted-foreground space-y-3">
              <h2 className="font-display text-base font-bold text-foreground">
                Release Notifications & Drops
              </h2>
              <div className="space-y-2">
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 flex items-start gap-3">
                  <Bell className="h-4 w-4 text-electric mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Aero Pulse Carbon Drop Announced
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      The limited carbon silhouette drops Friday 10:00 AM EST. Your priority VIP
                      queue is reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Recently Viewed */}
          {tab === "viewed" && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">Recently Viewed Silhouettes</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.slice(0, 4).map((p) => (
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    key={p.id}
                    className="glass block rounded-2xl p-3 border border-border/80 hover:border-electric transition-colors"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="aspect-square w-full rounded-xl object-cover bg-charcoal"
                    />
                    <p className="mt-2.5 font-display text-xs font-bold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-electric font-semibold">{format(p.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Profile Settings */}
          {tab === "profile" && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border/80">
              <h2 className="font-display text-lg font-bold">
                Personal Profile & Global Sizing Preferences
              </h2>
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Preferred Shoe Sizing
                    </label>
                    <input
                      type="text"
                      value={profile.shoeSize}
                      onChange={(e) => setProfile({ ...profile, shoeSize: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-electric/40 text-foreground"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-background shadow-md hover:scale-105 transition-transform"
                >
                  Save Profile Preferences
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Live Order Tracking Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-xl border-border bg-card/95 backdrop-blur-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-electric">
                <Truck className="h-5 w-5" />
                <DialogTitle className="font-display text-lg font-bold">
                  Live Dispatch Tracking · {selectedOrder.id}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedOrder.courier} · Tracking Code:{" "}
                <strong className="font-mono text-foreground">
                  {selectedOrder.trackingNumber}
                </strong>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-6">
              {/* Status Header */}
              <div className="rounded-2xl border border-border/80 bg-background/50 p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Current Status
                  </span>
                  <p className="font-display text-sm font-bold text-electric">
                    {selectedOrder.status}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {selectedOrder.estimatedDelivery}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Route
                  </span>
                  <p className="font-semibold text-foreground text-[11px]">
                    {selectedOrder.origin} → {selectedOrder.destination}
                  </p>
                </div>
              </div>

              {/* Milestones Stepper */}
              <div className="space-y-4 pl-2">
                {[
                  {
                    title: "Order Confirmed & Payment Verified",
                    desc: "Order authenticated by SoleVerse security",
                  },
                  {
                    title: "Custom Inspection & Box Packaged",
                    desc: "Sealed with climate shield and serialized barcode",
                  },
                  {
                    title: "Handed over to International Courier",
                    desc: `Departed ${selectedOrder.origin}`,
                  },
                  {
                    title: "Customs Clearance & Air Transit",
                    desc: "Pre-cleared with zero duties outstanding",
                  },
                  {
                    title: "Delivered to Customer Doorstep",
                    desc: `Final handover at ${selectedOrder.destination}`,
                  },
                ].map((step, idx) => {
                  const isDone = idx <= selectedOrder.currentStep;
                  const isCurrent = idx === selectedOrder.currentStep;
                  return (
                    <div key={step.title} className="flex items-start gap-3 relative">
                      <div
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                          isDone
                            ? "bg-electric text-background shadow-md"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <div className="text-xs">
                        <p
                          className={`font-semibold ${isDone ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {step.title}{" "}
                          {isCurrent && (
                            <span className="ml-2 rounded bg-electric/20 px-1.5 py-0.2 text-[9px] text-electric">
                              ACTIVE
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Address Modal */}
      <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
        <DialogContent className="max-w-md border-border bg-card/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Add International Address
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAddress} className="space-y-3 mt-2 text-xs">
            <div>
              <label className="block mb-1 font-semibold text-muted-foreground">Label</label>
              <input
                value={newAddr.label}
                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                className="w-full rounded-xl border border-border bg-background/60 p-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-muted-foreground">
                Street Address
              </label>
              <input
                required
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="w-full rounded-xl border border-border bg-background/60 p-2.5 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-semibold text-muted-foreground">City</label>
                <input
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background/60 p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-muted-foreground">
                  Postal / ZIP
                </label>
                <input
                  required
                  value={newAddr.zip}
                  onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background/60 p-2.5 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-electric to-neon py-3 text-xs font-bold uppercase tracking-wider text-background shadow-md hover:scale-102 transition-transform"
            >
              Save Address
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
