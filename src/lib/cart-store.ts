import { useEffect, useState } from "react";

export type CartItem = { id: string; size: number; qty: number };

const KEY = "soleverse-cart";
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const cb = () => setItems(read());
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return {
    items,
    add: (item: CartItem) => {
      const cur = read();
      const i = cur.findIndex((x) => x.id === item.id && x.size === item.size);
      if (i >= 0) cur[i].qty += item.qty;
      else cur.push(item);
      write(cur);
    },
    remove: (id: string, size: number) => {
      write(read().filter((x) => !(x.id === id && x.size === size)));
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
