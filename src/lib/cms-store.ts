import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface StorefrontContent {
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  freeShippingThresholdUSD: number;
  promoBannerText: string;
}

export const DEFAULT_CMS_CONTENT: StorefrontContent = {
  heroBadge: "New Drop · Nike Air Max 270 React",
  heroTitleLine1: "Step Into",
  heroTitleHighlight: "The Future",
  heroSubtitle: "Premium sneakers engineered for performance, comfort, and modern lifestyle.",
  freeShippingThresholdUSD: 150,
  promoBannerText: "Free Express Worldwide Shipping on orders over $150 · Use code VERSE10 for 10% off",
};

const STORAGE_KEY = "soleverse-cms-content";
const listeners = new Set<() => void>();

function readContent(): StorefrontContent {
  if (typeof window === "undefined") return DEFAULT_CMS_CONTENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CMS_CONTENT;
    return { ...DEFAULT_CMS_CONTENT, ...(JSON.parse(raw) as Partial<StorefrontContent>) };
  } catch {
    return DEFAULT_CMS_CONTENT;
  }
}

function writeContent(next: StorefrontContent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function useCmsContent() {
  const [content, setContent] = useState<StorefrontContent>(DEFAULT_CMS_CONTENT);

  useEffect(() => {
    const sync = () => setContent(readContent());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const updateContent = (patch: Partial<StorefrontContent>) => {
    const next = { ...readContent(), ...patch };
    writeContent(next);
    toast.success("Storefront content published!");
  };

  const resetContent = () => {
    writeContent(DEFAULT_CMS_CONTENT);
    toast.info("Storefront content reset to defaults");
  };

  return {
    content,
    updateContent,
    resetContent,
  };
}
