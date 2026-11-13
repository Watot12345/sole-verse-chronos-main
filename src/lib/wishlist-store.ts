import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProduct } from "./products";

const STORAGE_KEY = "soleverse-wishlist";
const listeners = new Set<() => void>();

function readWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn());
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(readWishlist());
    const listener = () => setWishlist(readWishlist());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const toggleWishlist = (productId: string) => {
    const current = readWishlist();
    const product = getProduct(productId);
    const title = product ? product.name : "Product";

    if (current.includes(productId)) {
      const next = current.filter((id) => id !== productId);
      writeWishlist(next);
      toast.info(`Removed ${title} from wishlist`);
    } else {
      const next = [...current, productId];
      writeWishlist(next);
      toast.success(`Added ${title} to wishlist`, {
        description: "View saved items in your account dashboard.",
      });
    }
  };

  const clearWishlist = () => {
    writeWishlist([]);
    toast.info("Wishlist cleared");
  };

  return {
    wishlist,
    count: wishlist.length,
    isWishlisted,
    toggleWishlist,
    clearWishlist,
  };
}
