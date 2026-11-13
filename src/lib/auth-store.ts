import { useEffect, useState } from "react";
import { toast } from "sonner";
import { products } from "./products";

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
  createdAt: string;
}

interface StoredUser extends UserProfile {
  password: string;
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

const USERS_KEY = "soleverse-users";
const SESSION_KEY = "soleverse-session";
const ORDERS_PREFIX = "soleverse-orders:";

const DEMO_USER: StoredUser = {
  id: "usr-demo-alex",
  fullName: "Alex Chen",
  email: "alex.chen@example.com",
  password: "soleverse123",
  phone: "+1 (555) 019-2834",
  country: "United States",
  address: "742 Evergreen Terrace",
  apartment: "Apt 4B",
  city: "Springfield",
  state: "OR",
  zip: "97477",
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

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [DEMO_USER];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEMO_USER]));
      return [DEMO_USER];
    }
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_USER];
  } catch {
    return [DEMO_USER];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function stripPassword(user: StoredUser): UserProfile {
  const { password: _password, ...profile } = user;
  return profile;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const found = readUsers().find((u) => u.id === userId);
    return found ? stripPassword(found) : null;
  } catch {
    return null;
  }
}

function readOrders(userId: string): OrderRecord[] {
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

function writeOrders(userId: string, orders: OrderRecord[]) {
  try {
    localStorage.setItem(`${ORDERS_PREFIX}${userId}`, JSON.stringify(orders));
  } catch {
    // ignore
  }
  notify();
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

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      const current = getCurrentUser();
      setUser(current);
      setOrders(current ? readOrders(current.id) : []);
      setIsHydrated(true);
    };
    sync();
    return subscribeAuth(sync);
  }, []);

  const signIn = (email: string, password: string): { ok: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    const match = users.find((u) => u.email.toLowerCase() === normalized);
    if (!match || match.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    try {
      localStorage.setItem(SESSION_KEY, match.id);
    } catch {
      // ignore
    }
    notify();
    toast.success(`Welcome back, ${match.fullName}!`);
    return { ok: true };
  };

  const signUp = (input: SignUpInput): { ok: boolean; error?: string } => {
    const normalized = input.email.trim().toLowerCase();
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === normalized)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      fullName: input.fullName.trim(),
      email: normalized,
      password: input.password,
      phone: input.phone.trim(),
      country: input.country.trim() || "United States",
      address: input.address.trim(),
      apartment: input.apartment?.trim() ?? "",
      city: input.city.trim(),
      state: input.state.trim(),
      zip: input.zip.trim(),
      createdAt: new Date().toISOString(),
    };
    writeUsers([...users, newUser]);
    try {
      localStorage.setItem(SESSION_KEY, newUser.id);
    } catch {
      // ignore
    }
    notify();
    toast.success(`Account created! Welcome to SoleVerse, ${newUser.fullName}.`);
    return { ok: true };
  };

  const signOut = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    notify();
    toast.info("You have been signed out.");
  };

  const updateProfile = (patch: Partial<Omit<UserProfile, "id" | "createdAt">>) => {
    const current = getCurrentUser();
    if (!current) return;
    const users = readUsers().map((u) => (u.id === current.id ? { ...u, ...patch } : u));
    writeUsers(users);
    notify();
  };

  const addOrder = (order: OrderRecord) => {
    const current = getCurrentUser();
    if (!current) return;
    const existing = readOrders(current.id);
    writeOrders(current.id, [order, ...existing]);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isHydrated,
    orders,
    signIn,
    signUp,
    signOut,
    updateProfile,
    addOrder,
  };
}
