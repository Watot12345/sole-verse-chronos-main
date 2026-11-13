import { useEffect, useState } from "react";
import { toast } from "sonner";
import { products } from "./products";
import { supabase } from "./supabase";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  role: UserRole;
  createdAt: string;
}

export interface OrderProductItem {
  id: string;
  name: string;
  category: string;
  image: string;
  size: number;
  qty: number;
  price: number;
}

export interface OrderRecord {
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
  items?: OrderProductItem[];
}

const SESSION_CACHE_KEY = "soleverse-active-profile";
const ORDERS_PREFIX = "soleverse-orders:";

const DEMO_USER: UserProfile = {
  id: "usr-demo-alex",
  fullName: "Alex Chen",
  email: "alex.chen@example.com",
  phone: "+1 (555) 019-2834",
  country: "United States",
  address: "742 Evergreen Terrace",
  apartment: "Apt 4B",
  city: "Springfield",
  state: "OR",
  zip: "97477",
  role: "admin",
  createdAt: "2026-06-01T00:00:00.000Z",
};

const DEMO_ORDERS: OrderRecord[] = [
  {
    id: "SV-10248-INTL",
    trackingNumber: "DHL-EXP-8849201",
    courier: "DHL Express Worldwide",
    status: "Delivered",
    currentStep: 4,
    date: "Jun 18, 2026",
    estimatedDelivery: "Delivered on Jun 21, 2026",
    totalUSD: 185,
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
    totalUSD: 170,
    origin: "Singapore Regional Facility, SG",
    destination: "Tokyo, JP",
    item: products[0],
  },
];

let cachedUser: UserProfile | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setCachedUser(user: UserProfile | null) {
  cachedUser = user;
  if (typeof window !== "undefined") {
    try {
      if (user) localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(user));
      else localStorage.removeItem(SESSION_CACHE_KEY);
    } catch {
      // ignore
    }
  }
  notify();
}

export function getCurrentUser(): UserProfile | null {
  if (cachedUser) return cachedUser;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    cachedUser = JSON.parse(raw) as UserProfile;
    return cachedUser;
  } catch {
    return null;
  }
}

function readLocalOrders(userId: string): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${ORDERS_PREFIX}${userId}`);
    if (!raw) {
      if (userId === DEMO_USER.id) {
        localStorage.setItem(`${ORDERS_PREFIX}${userId}`, JSON.stringify(DEMO_ORDERS));
        return DEMO_ORDERS;
      }
      return [];
    }
    return JSON.parse(raw) as OrderRecord[];
  } catch {
    return [];
  }
}

function writeLocalOrders(userId: string, orders: OrderRecord[]) {
  try {
    localStorage.setItem(`${ORDERS_PREFIX}${userId}`, JSON.stringify(orders));
  } catch {
    // ignore
  }
  notify();
}

async function fetchOrCreateSupabaseProfile(
  userId: string,
  email: string,
  meta?: Record<string, string>,
): Promise<UserProfile> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (data) {
    return {
      id: data.id,
      fullName: data.full_name || meta?.full_name || email.split("@")[0],
      email: data.email || email,
      phone: data.phone || meta?.phone || "",
      country: data.country || meta?.country || "United States",
      address: data.address || meta?.address || "",
      apartment: data.apartment || meta?.apartment || "",
      city: data.city || meta?.city || "",
      state: data.state || meta?.state || "",
      zip: data.zip || meta?.zip || "",
      role: (data.role as UserRole) || "customer",
      createdAt: data.created_at || new Date().toISOString(),
    };
  }

  const fallbackProfile: UserProfile = {
    id: userId,
    fullName: meta?.full_name || email.split("@")[0],
    email,
    phone: meta?.phone || "",
    country: meta?.country || "United States",
    address: meta?.address || "",
    apartment: meta?.apartment || "",
    city: meta?.city || "",
    state: meta?.state || "",
    zip: meta?.zip || "",
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  await supabase.from("profiles").upsert({
    id: userId,
    full_name: fallbackProfile.fullName,
    email: fallbackProfile.email,
    phone: fallbackProfile.phone,
    country: fallbackProfile.country,
    address: fallbackProfile.address,
    apartment: fallbackProfile.apartment,
    city: fallbackProfile.city,
    state: fallbackProfile.state,
    zip: fallbackProfile.zip,
    role: fallbackProfile.role,
  });

  return fallbackProfile;
}

async function fetchOrdersForUser(userId: string): Promise<OrderRecord[]> {
  if (userId === DEMO_USER.id) {
    return readLocalOrders(userId);
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return readLocalOrders(userId);
  }

  return data.map((row) => {
    const items = (row.items as OrderProductItem[]) ?? [];
    const matched = products.find((p) => p.id === items[0]?.id) ?? products[0];
    return {
      id: row.id,
      trackingNumber: row.tracking_number,
      courier: row.courier,
      status: row.status as OrderRecord["status"],
      currentStep: row.current_step,
      date: new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      estimatedDelivery: row.estimated_delivery,
      totalUSD: Number(row.total_usd),
      origin: row.origin,
      destination: row.destination,
      item: matched,
      items,
    };
  });
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
}

let authInitialized = false;

function ensureAuthListener() {
  if (authInitialized || typeof window === "undefined") return;
  authInitialized = true;

  void supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const profile = await fetchOrCreateSupabaseProfile(
        session.user.id,
        session.user.email ?? "",
        session.user.user_metadata as Record<string, string>,
      );
      setCachedUser(profile);
    }
  });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await fetchOrCreateSupabaseProfile(
        session.user.id,
        session.user.email ?? "",
        session.user.user_metadata as Record<string, string>,
      );
      setCachedUser(profile);
    } else if (cachedUser && cachedUser.id !== DEMO_USER.id) {
      setCachedUser(null);
    }
  });
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    ensureAuthListener();
    let active = true;

    const sync = async () => {
      const current = getCurrentUser();
      if (!active) return;
      setUser(current);
      setIsHydrated(true);
      if (current) {
        const list = await fetchOrdersForUser(current.id);
        if (active) setOrders(list);
      } else {
        setOrders([]);
      }
    };

    void sync();
    const unsub = subscribeAuth(() => {
      void sync();
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const normalized = email.trim().toLowerCase();

    if (normalized === DEMO_USER.email && password === "soleverse123") {
      setCachedUser(DEMO_USER);
      toast.success(`Welcome back, ${DEMO_USER.fullName}!`);
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });

    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Invalid email or password." };
    }

    const profile = await fetchOrCreateSupabaseProfile(
      data.user.id,
      data.user.email ?? normalized,
      data.user.user_metadata as Record<string, string>,
    );
    setCachedUser(profile);
    toast.success(`Welcome back, ${profile.fullName}!`);
    return { ok: true };
  };

  const signUp = async (input: SignUpInput): Promise<{ ok: boolean; error?: string }> => {
    const normalized = input.email.trim().toLowerCase();
    const meta = {
      full_name: input.fullName.trim(),
      phone: input.phone.trim(),
      country: input.country.trim() || "United States",
      address: input.address.trim(),
      apartment: input.apartment?.trim() ?? "",
      city: input.city.trim(),
      state: input.state.trim(),
      zip: input.zip.trim(),
    };

    const { data, error } = await supabase.auth.signUp({
      email: normalized,
      password: input.password,
      options: { data: meta },
    });

    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Unable to create account." };
    }

    if (!data.session) {
      toast.success("Account created! Check your email to confirm, then sign in.");
      return { ok: true };
    }

    const profile = await fetchOrCreateSupabaseProfile(data.user.id, normalized, meta);
    setCachedUser(profile);
    toast.success(`Account created! Welcome to SoleVerse, ${profile.fullName}.`);
    return { ok: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCachedUser(null);
    toast.info("You have been signed out.");
  };

  const updateProfile = async (patch: Partial<Omit<UserProfile, "id" | "createdAt">>) => {
    const current = getCurrentUser();
    if (!current) return;
    const updated = { ...current, ...patch };
    setCachedUser(updated);

    if (current.id !== DEMO_USER.id) {
      await supabase
        .from("profiles")
        .update({
          full_name: updated.fullName,
          phone: updated.phone,
          country: updated.country,
          address: updated.address,
          apartment: updated.apartment,
          city: updated.city,
          state: updated.state,
          zip: updated.zip,
        })
        .eq("id", current.id);
    }
  };

  const addOrder = async (order: OrderRecord) => {
    const current = getCurrentUser();
    if (!current) return;

    const existing = readLocalOrders(current.id);
    writeLocalOrders(current.id, [order, ...existing]);

    if (current.id !== DEMO_USER.id) {
      await supabase.from("orders").insert({
        id: order.id,
        user_id: current.id,
        tracking_number: order.trackingNumber,
        courier: order.courier,
        status: order.status,
        current_step: order.currentStep,
        estimated_delivery: order.estimatedDelivery,
        total_usd: order.totalUSD,
        origin: order.origin,
        destination: order.destination,
        customer_name: current.fullName,
        customer_email: current.email,
        items: order.items ?? [],
      });
      notify();
    }
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    isHydrated,
    orders,
    signIn,
    signUp,
    signOut,
    updateProfile,
    addOrder,
  };
}
