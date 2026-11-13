import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCurrentUser, subscribeAuth } from "./auth-store";
import { getProduct } from "./products";

export type CartItem = { id: string; size: number; qty: number };

const KEY_PREFIX = "soleverse-cart:";
const GUEST_KEY = `${KEY_PREFIX}guest`;
const listeners = new Set<() => void>();
let isDrawerOpenGlobal = false;
const drawerListeners = new Set<(open: boolean) => void>();

function getStorageKey(): string {
  const user = getCurrentUser();
  return user ? `${KEY_PREFIX}${user.id}` : GUEST_KEY;
}

function readKey(key: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function mergeGuestCartIntoUser(userKey: string) {
  if (typeof window === "undefined" || userKey === GUEST_KEY) return;
  const guestItems = readKey(GUEST_KEY);
  if (guestItems.length === 0) return;
  const userItems = readKey(userKey);
  const merged = [...userItems];
  for (const item of guestItems) {
    const idx = merged.findIndex((x) => x.id === item.id && x.size === item.size);
    if (idx >= 0) merged[idx].qty += item.qty;
    else merged.push(item);
  }
  try {
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // ignore
  }
}

function read(): CartItem[] {
  const key = getStorageKey();
  if (key !== GUEST_KEY) {
    mergeGuestCartIntoUser(key);
  }
  return readKey(key);
}

function write(items: CartItem[]) {
  const key = getStorageKey();
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function setDrawerOpen(open: boolean) {
  isDrawerOpenGlobal = open;
  drawerListeners.forEach((l) => l(open));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(isDrawerOpenGlobal);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    listeners.add(sync);
    const unsubAuth = subscribeAuth(sync);

    const drawerCb = (open: boolean) => setIsDrawerOpen(open);
    drawerListeners.add(drawerCb);

    return () => {
      listeners.delete(sync);
      unsubAuth();
      drawerListeners.delete(drawerCb);
    };
  }, []);

  return {
    items,
    isDrawerOpen,
    openCart: () => setDrawerOpen(true),
    closeCart: () => setDrawerOpen(false),
    toggleCart: () => setDrawerOpen(!isDrawerOpenGlobal),
    add: (item: CartItem, showToast = true, openDrawer = true) => {
      const cur = read();
      const i = cur.findIndex((x) => x.id === item.id && x.size === item.size);
      if (i >= 0) cur[i].qty += item.qty;
      else cur.push(item);
      write(cur);

      if (showToast) {
        const prod = getProduct(item.id);
        toast.success(`Added to cart: ${prod ? prod.name : "Sneaker"}`, {
          description: `Size: US ${item.size} · Quantity: ${item.qty}`,
        });
      }

      if (openDrawer) {
        setDrawerOpen(true);
      }
      return true;
    },
    remove: (id: string, size: number) => {
      write(read().filter((x) => !(x.id === id && x.size === size)));
      toast.info("Item removed from cart");
    },
    update: (id: string, size: number, qty: number) => {
      const cur = read().map((x) =>
        x.id === id && x.size === size ? { ...x, qty: Math.max(1, qty) } : x,
      );
      write(cur);
    },
    clear: () => write([]),
  };
}
