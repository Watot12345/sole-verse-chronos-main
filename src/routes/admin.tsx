import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, type UserProfile } from "@/lib/auth-store";
import { products as fallbackProducts, type Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin CMS — SoleVerse" }],
  }),
  component: AdminPage,
});

interface AdminOrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  status: "Processing" | "In Transit" | "Delivered";
  tracking_number: string;
  courier: string;
  total_usd: number;
  destination: string;
  created_at: string;
}

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isHydrated } = useAuth();
  const { format } = useCurrency();

  const [tab, setTab] = useState<"overview" | "products" | "orders" | "customers">("overview");
  const [cmsProducts, setCmsProducts] = useState<Product[]>(fallbackProducts);
  const [adminOrders, setAdminOrders] = useState<AdminOrderRow[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Add product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "Nike",
    category: "Running" as Product["category"],
    price: "160",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    badge: "New",
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      void navigate({ to: "/login", search: { redirect: "/admin" } });
    }
  }, [isHydrated, isAuthenticated, navigate]);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [prodRes, orderRes, profRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);

      if (!prodRes.error && prodRes.data && prodRes.data.length > 0) {
        setCmsProducts(
          prodRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category as Product["category"],
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            rating: Number(p.rating ?? 4.8),
            reviews: Number(p.reviews ?? 0),
            image: p.image,
            altImage: p.alt_image,
            colors: p.colors ?? ["#0a0a0a"],
            badge: p.badge ?? undefined,
            inStock: Boolean(p.in_stock),
          })),
        );
      }

      if (!orderRes.error && orderRes.data) {
        setAdminOrders(orderRes.data as AdminOrderRow[]);
      }

      if (!profRes.error && profRes.data) {
        setCustomers(
          profRes.data.map((c) => ({
            id: c.id,
            fullName: c.full_name,
            email: c.email,
            phone: c.phone,
            country: c.country,
            address: c.address,
            apartment: c.apartment,
            city: c.city,
            state: c.state,
            zip: c.zip,
            role: c.role,
            createdAt: c.created_at,
          })),
        );
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isHydrated && isAdmin) {
      void loadAdminData();
    }
  }, [isHydrated, isAdmin]);

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Checking admin credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="glass rounded-3xl border border-border/80 p-8">
          <ShieldCheck className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin Access Required</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Your account ({user.email}) is currently a <strong>customer</strong>. To grant admin
            CMS access in Supabase, run this in the SQL Editor:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-background/80 p-3 text-left text-[11px] text-electric border border-border/60">
            {`update public.profiles set role = 'admin' where email = '${user.email}';`}
          </pre>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-bold text-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    const id = `${newProduct.brand.toLowerCase()}-${Date.now()}`;
    const price = Number(newProduct.price) || 150;
    const record: Product = {
      id,
      name: newProduct.name.trim(),
      brand: newProduct.brand.trim(),
      category: newProduct.category,
      price,
      rating: 4.9,
      reviews: 1,
      image: newProduct.image.trim(),
      altImage: newProduct.image.trim(),
      colors: ["#0a0a0a", "#ffffff"],
      badge: newProduct.badge.trim() || undefined,
      inStock: true,
    };

    const { error } = await supabase.from("products").insert({
      id: record.id,
      name: record.name,
      brand: record.brand,
      category: record.category,
      price: record.price,
      rating: record.rating,
      reviews: record.reviews,
      image: record.image,
      alt_image: record.altImage,
      colors: record.colors,
      badge: record.badge ?? null,
      in_stock: true,
    });

    if (error) {
      toast.error(`Supabase error: ${error.message}`);
      return;
    }

    setCmsProducts((prev) => [record, ...prev]);
    setNewProduct((prev) => ({ ...prev, name: "" }));
    toast.success(`Added ${record.name} to Supabase catalog`);
  };

  const handleToggleStock = async (prod: Product) => {
    const next = !prod.inStock;
    const { error } = await supabase.from("products").update({ in_stock: next }).eq("id", prod.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCmsProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, inStock: next } : p)));
    toast.success(`${prod.name} marked as ${next ? "In Stock" : "Sold Out"}`);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCmsProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info(`Removed ${name}`);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: "Processing" | "In Transit" | "Delivered",
  ) => {
    const currentStep = status === "Delivered" ? 4 : status === "In Transit" ? 2 : 1;
    const { error } = await supabase
      .from("orders")
      .update({ status, current_step: currentStep })
      .eq("id", orderId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    toast.success(`Order ${orderId} updated to ${status}`);
  };

  const totalRevenue = adminOrders.reduce((s, o) => s + Number(o.total_usd || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-electric font-semibold">
            Supabase CMS & Store Operations
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Admin Console</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "overview", label: "Overview", Icon: BarChart3 },
              { id: "products", label: "Products CMS", Icon: ShoppingBag },
              { id: "orders", label: "Orders", Icon: Package },
              { id: "customers", label: "Customers", Icon: Users },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "glass border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loadingData && (
        <p className="mt-4 text-xs text-muted-foreground">Syncing live data from Supabase...</p>
      )}

      {tab === "overview" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Catalog Sneakers", value: String(cmsProducts.length) },
            {
              label: "In-Stock Models",
              value: String(cmsProducts.filter((p) => p.inStock).length),
            },
            { label: "Supabase Orders", value: String(adminOrders.length) },
            { label: "Total Revenue", value: format(totalRevenue) },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 border border-border/80">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="mt-8 space-y-6">
          <form
            onSubmit={handleAddProduct}
            className="glass rounded-2xl p-6 border border-border/80 space-y-4"
          >
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-electric" />
              Add Sneaker to Supabase Catalog
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Model name (e.g. Nike Air Max 90)"
                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40 lg:col-span-2"
              />
              <input
                required
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                placeholder="Brand (Nike, Jordan...)"
                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40"
              />
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value as Product["category"],
                  })
                }
                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none"
              >
                <option value="Running">Running</option>
                <option value="Basketball">Basketball</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Training">Training</option>
                <option value="Casual">Casual</option>
                <option value="Limited Edition">Limited Edition</option>
              </select>
              <input
                type="number"
                required
                min={1}
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Price USD"
                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <input
                required
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="Image URL"
                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40"
              />
              <input
                value={newProduct.badge}
                onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                placeholder="Badge (New, Limited...)"
                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-electric to-neon px-6 py-2 text-xs font-bold text-background"
              >
                Publish Product
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {cmsProducts.map((p) => (
              <div
                key={p.id}
                className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 border border-border/80"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-14 w-14 rounded-xl object-cover bg-charcoal"
                  />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {p.brand} · {p.category}
                    </p>
                    <h3 className="font-display text-sm font-bold">{p.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold">{format(p.price)}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleStock(p)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      p.inStock
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {p.inStock ? "In Stock" : "Sold Out"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    aria-label={`Delete ${p.name}`}
                    className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 space-y-3">
          {adminOrders.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center border border-border/80">
              <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No orders in Supabase yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Run <code>supabase/schema.sql</code> in Supabase SQL Editor and place an order to
                manage it here.
              </p>
            </div>
          ) : (
            adminOrders.map((o) => (
              <div
                key={o.id}
                className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5 border border-border/80"
              >
                <div>
                  <p className="font-mono text-xs font-bold">{o.id}</p>
                  <p className="mt-1 text-sm font-semibold">
                    {o.customer_name || o.customer_email} · {o.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.tracking_number} · {o.courier}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold">
                    {format(Number(o.total_usd))}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) =>
                      handleUpdateOrderStatus(o.id, e.target.value as AdminOrderRow["status"])
                    }
                    className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold outline-none"
                  >
                    <option value="Processing">Processing</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "customers" && (
        <div className="mt-8 space-y-3">
          {customers.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center border border-border/80">
              <p className="text-sm text-muted-foreground">
                No customer profiles found in Supabase yet.
              </p>
            </div>
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 border border-border/80"
              >
                <div>
                  <p className="font-display text-sm font-bold">{c.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.email} · {c.phone || "No phone"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {[c.address, c.city, c.country].filter(Boolean).join(", ")}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    c.role === "admin"
                      ? "bg-electric/15 text-electric"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {c.role}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
