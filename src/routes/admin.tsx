import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  Pencil,
  Search,
  Sparkles,
  Heart,
  DollarSign,
  ExternalLink,
  LogOut,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { useAuth, type UserProfile } from "@/lib/auth-store";
import { useCmsContent } from "@/lib/cms-store";
import { products as fallbackProducts, type Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { useCurrency } from "@/lib/currency-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PrimaryColorWheel } from "@/components/primary-color-wheel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Store CMS — SoleVerse Admin" }],
  }),
  component: AdminPage,
});

interface CmsProduct extends Product {
  likesCount: number;
}

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

const CATEGORIES: Product["category"][] = [
  "Running",
  "Basketball",
  "Lifestyle",
  "Training",
  "Casual",
  "Limited Edition",
];

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isHydrated, signOut } = useAuth();
  const { content, updateContent, resetContent } = useCmsContent();
  const { format } = useCurrency();

  const [tab, setTab] = useState<"overview" | "products" | "content" | "orders" | "customers">(
    "overview",
  );
  const [cmsProducts, setCmsProducts] = useState<CmsProduct[]>(
    fallbackProducts.map((p) => ({ ...p, likesCount: 0 })),
  );
  const [adminOrders, setAdminOrders] = useState<AdminOrderRow[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState<string>("All");
  const [orderFilter, setOrderFilter] = useState<string>("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Add product modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "Nike",
    category: "Running" as Product["category"],
    price: "160",
    originalPrice: "",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    altImage:
      "https://images.unsplash.com/photo-1519861297062-a1eec154f81a?auto=format&fit=crop&w=900&q=80",
    badge: "New",
    primaryColor: "#0a0a0a",
  });

  // Edit product modal
  const [editingProduct, setEditingProduct] = useState<CmsProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    category: "Running" as Product["category"],
    price: "",
    originalPrice: "",
    badge: "",
    image: "",
    primaryColor: "#0a0a0a",
    inStock: true,
  });

  // Storefront content draft
  const [cmsDraft, setCmsDraft] = useState(content);
  useEffect(() => {
    setCmsDraft(content);
  }, [content]);

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
            likesCount: Number(p.likes_count ?? 0),
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

  const categoryChartData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = cmsProducts.filter((p) => p.category === cat);
      return {
        category: cat === "Limited Edition" ? "Limited" : cat,
        products: items.length,
        likes: items.reduce((s, p) => s + p.likesCount, 0),
      };
    });
  }, [cmsProducts]);

  const filteredProducts = useMemo(() => {
    return cmsProducts.filter((p) => {
      if (productCategory !== "All" && p.category !== productCategory) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [cmsProducts, productCategory, productSearch]);

  const filteredOrders = useMemo(() => {
    return adminOrders.filter((o) => {
      if (orderFilter !== "All" && o.status !== orderFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        if (
          !o.id.toLowerCase().includes(q) &&
          !(o.customer_name || "").toLowerCase().includes(q) &&
          !(o.customer_email || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [adminOrders, orderFilter, orderSearch]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    });
  }, [customers, customerSearch]);

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Verifying admin credentials...</p>
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
            The Content Management System is restricted to admin accounts. Your account ({user.email})
            has the <strong>customer</strong> role.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-bold text-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Customer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    const id = `${newProduct.brand.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const price = Number(newProduct.price) || 150;
    const originalPrice = newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined;
    const record: CmsProduct = {
      id,
      name: newProduct.name.trim(),
      brand: newProduct.brand.trim(),
      category: newProduct.category,
      price,
      originalPrice,
      rating: 4.9,
      reviews: 1,
      image: newProduct.image.trim(),
      altImage: newProduct.altImage.trim() || newProduct.image.trim(),
      colors: [newProduct.primaryColor || "#0a0a0a"],
      badge: newProduct.badge.trim() || undefined,
      inStock: true,
      likesCount: 0,
    };

    const { error } = await supabase.from("products").insert({
      id: record.id,
      name: record.name,
      brand: record.brand,
      category: record.category,
      price: record.price,
      original_price: record.originalPrice ?? null,
      rating: record.rating,
      reviews: record.reviews,
      image: record.image,
      alt_image: record.altImage,
      colors: record.colors,
      badge: record.badge ?? null,
      in_stock: true,
      likes_count: 0,
    });

    if (error) {
      toast.error(`Supabase error: ${error.message}`);
      return;
    }

    setCmsProducts((prev) => [record, ...prev]);
    setNewProduct((prev) => ({ ...prev, name: "", originalPrice: "" }));
    setAddModalOpen(false);
    toast.success(`Published ${record.name} to catalog`);
  };

  const openEditModal = (p: CmsProduct) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      badge: p.badge ?? "",
      image: p.image,
      primaryColor: p.colors[0] ?? "#0a0a0a",
      inStock: p.inStock,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const price = Number(editForm.price) || editingProduct.price;
    const originalPrice = editForm.originalPrice ? Number(editForm.originalPrice) : null;
    const primaryColor = editForm.primaryColor || "#0a0a0a";

    const { error } = await supabase
      .from("products")
      .update({
        name: editForm.name.trim(),
        brand: editForm.brand.trim(),
        category: editForm.category,
        price,
        original_price: originalPrice,
        badge: editForm.badge.trim() || null,
        image: editForm.image.trim(),
        colors: [primaryColor],
        in_stock: editForm.inStock,
      })
      .eq("id", editingProduct.id);

    if (error) {
      toast.error(`Update failed: ${error.message}`);
      return;
    }

    setCmsProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: editForm.name.trim(),
              brand: editForm.brand.trim(),
              category: editForm.category,
              price,
              originalPrice: originalPrice ?? undefined,
              badge: editForm.badge.trim() || undefined,
              image: editForm.image.trim(),
              colors: [primaryColor],
              inStock: editForm.inStock,
            }
          : p,
      ),
    );
    setEditingProduct(null);
    toast.success(`Updated ${editForm.name.trim()}`);
  };

  const handleToggleStock = async (prod: CmsProduct) => {
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
    toast.info(`Deleted ${name}`);
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
  const totalLikes = cmsProducts.reduce((s, p) => s + p.likesCount, 0);

  const navItems = [
    { id: "overview", label: "Analytics & Overview", Icon: BarChart3 },
    { id: "products", label: "Products Catalog", Icon: ShoppingBag, badge: cmsProducts.length },
    { id: "content", label: "Storefront CMS", Icon: Sparkles },
    { id: "orders", label: "Orders & Fulfillment", Icon: Package, badge: adminOrders.length },
    { id: "customers", label: "Customers", Icon: Users, badge: customers.length },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12">
      {/* Top CMS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-electric/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-electric">
              Admin CMS
            </span>
            <span className="text-xs text-muted-foreground">
              Signed in as <strong className="text-foreground">{user.email}</strong>
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
            SoleVerse Store Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-semibold hover:border-electric transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live Store
          </Link>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-electric to-neon px-4 py-2 text-xs font-bold text-background shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            New Product
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* CMS Sidebar */}
        <aside className="glass h-fit rounded-2xl p-2.5 lg:sticky lg:top-24 border border-border/80 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                tab === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.Icon className="h-4 w-4" />
                {item.label}
              </span>
              {"badge" in item && typeof item.badge === "number" && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    tab === item.id ? "bg-background text-foreground" : "bg-secondary"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="mt-3 border-t border-border/60 pt-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="space-y-6">
          {loadingData && (
            <p className="text-xs text-muted-foreground">Syncing live store data from Supabase...</p>
          )}

          {/* TAB 1: ANALYTICS & OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="glass rounded-2xl p-5 border border-border/80">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider">Revenue</span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">{format(totalRevenue)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Across {adminOrders.length} order{adminOrders.length !== 1 && "s"}
                  </p>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/80">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider">Catalog</span>
                    <ShoppingBag className="h-4 w-4 text-electric" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">{cmsProducts.length}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {cmsProducts.filter((p) => p.inStock).length} in stock
                  </p>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/80">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider">Total Likes</span>
                    <Heart className="h-4 w-4 text-neon" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">
                    {totalLikes.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Catalog engagement</p>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/80">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider">Customers</span>
                    <Users className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">{customers.length}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Registered profiles</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass rounded-2xl p-6 border border-border/80">
                  <h2 className="font-display text-base font-bold">Likes by Category</h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Customer engagement across sneaker categories
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="category" stroke="#888" fontSize={11} />
                        <YAxis stroke="#888" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            borderColor: "#333",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="likes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-border/80">
                  <h2 className="font-display text-base font-bold">Most Liked Sneakers</h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Top performing models in your catalog
                  </p>
                  <div className="space-y-3">
                    {[...cmsProducts]
                      .sort((a, b) => b.likesCount - a.likesCount)
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl bg-background/40 p-2.5 border border-border/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {p.brand} · {format(p.price)}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-neon/15 px-2.5 py-1 text-[11px] font-bold text-neon">
                            <Heart className="h-3 w-3 fill-current" />
                            {p.likesCount}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CMS */}
          {tab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search catalog by model or brand..."
                    className="w-full rounded-full border border-border bg-background/60 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-semibold outline-none"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 border border-border/80"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-16 w-16 rounded-xl object-cover bg-charcoal"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {p.brand} · {p.category}
                          </span>
                          {p.badge && (
                            <span className="rounded-full bg-electric/15 px-2 py-0.5 text-[10px] font-bold text-electric">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-sm font-bold">{p.name}</h3>
                        <p className="text-[11px] text-muted-foreground">
                          {p.likesCount} likes · {p.reviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-display text-sm font-bold mr-2">{format(p.price)}</span>
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
                        onClick={() => openEditModal(p)}
                        aria-label={`Edit ${p.name}`}
                        className="rounded-full border border-border p-2 text-muted-foreground hover:border-electric hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        aria-label={`Delete ${p.name}`}
                        className="rounded-full border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STOREFRONT CONTENT CMS */}
          {tab === "content" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateContent(cmsDraft);
              }}
              className="glass rounded-2xl p-6 border border-border/80 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Homepage & Storefront Content</h2>
                  <p className="text-xs text-muted-foreground">
                    Edit live hero copy and promotional messaging shown on the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetContent}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hero Drop Badge
                  </label>
                  <input
                    value={cmsDraft.heroBadge}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, heroBadge: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Free Shipping Threshold (USD)
                  </label>
                  <input
                    type="number"
                    value={cmsDraft.freeShippingThresholdUSD}
                    onChange={(e) =>
                      setCmsDraft({
                        ...cmsDraft,
                        freeShippingThresholdUSD: Number(e.target.value) || 150,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hero Headline (Line 1)
                  </label>
                  <input
                    value={cmsDraft.heroTitleLine1}
                    onChange={(e) => setCmsDraft({ ...cmsDraft, heroTitleLine1: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hero Highlight (Gradient)
                  </label>
                  <input
                    value={cmsDraft.heroTitleHighlight}
                    onChange={(e) =>
                      setCmsDraft({ ...cmsDraft, heroTitleHighlight: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={cmsDraft.heroSubtitle}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, heroSubtitle: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Promo Banner Copy
                </label>
                <input
                  value={cmsDraft.promoBannerText}
                  onChange={(e) => setCmsDraft({ ...cmsDraft, promoBannerText: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-electric to-neon px-6 py-2.5 text-xs font-bold text-background shadow-md"
              >
                Publish Storefront Changes
              </button>
            </form>
          )}

          {/* TAB 4: ORDERS & FULFILLMENT */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search orders by ID or customer email..."
                    className="w-full rounded-full border border-border bg-background/60 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-semibold outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center border border-border/80">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">No matching orders</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Customer orders placed through checkout will appear here for fulfillment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((o) => (
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
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {tab === "customers" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name, email, or country..."
                  className="w-full rounded-full border border-border bg-background/60 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center border border-border/80">
                  <p className="text-sm text-muted-foreground">No matching customer profiles.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.map((c) => (
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Sneaker</DialogTitle>
            <DialogDescription>
              Publish a new product directly to your Supabase store catalog.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-3 mt-2">
            <input
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Model name (e.g. Nike Air Max 90)"
              className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                placeholder="Brand"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value as Product["category"],
                  })
                }
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                required
                min={1}
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Price USD"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
              <input
                type="number"
                min={1}
                value={newProduct.originalPrice}
                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                placeholder="Compare at $"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
              <input
                value={newProduct.badge}
                onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                placeholder="Badge"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
            </div>
            <input
              required
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              placeholder="Primary Image URL"
              className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
            />
            <PrimaryColorWheel
              value={newProduct.primaryColor}
              onChange={(primaryColor) => setNewProduct({ ...newProduct, primaryColor })}
            />
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-electric to-neon py-2.5 text-xs font-bold text-background"
            >
              Publish Product
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={Boolean(editingProduct)} onOpenChange={(o) => !o && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Sneaker</DialogTitle>
            <DialogDescription>
              Update pricing, stock, or catalog details in Supabase.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3 mt-2">
            <input
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Model name"
              className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={editForm.brand}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                placeholder="Brand"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value as Product["category"] })
                }
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                required
                min={1}
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                placeholder="Price USD"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
              <input
                type="number"
                min={1}
                value={editForm.originalPrice}
                onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                placeholder="Compare at $"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
              <input
                value={editForm.badge}
                onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                placeholder="Badge"
                className="rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
              />
            </div>
            <input
              required
              value={editForm.image}
              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
              placeholder="Image URL"
              className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm outline-none"
            />
            <PrimaryColorWheel
              value={editForm.primaryColor}
              onChange={(primaryColor) => setEditForm({ ...editForm, primaryColor })}
            />
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={editForm.inStock}
                onChange={(e) => setEditForm({ ...editForm, inStock: e.target.checked })}
              />
              Available in stock
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-electric to-neon py-2.5 text-xs font-bold text-background"
            >
              Save Changes
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
