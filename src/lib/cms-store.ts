import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "./supabase";

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

/** Row id in `public.site_content` holding the storefront copy. */
const CONTENT_ROW_ID = "storefront";

let cachedContent: StorefrontContent = DEFAULT_CMS_CONTENT;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setCached(next: StorefrontContent) {
  cachedContent = next;
  listeners.forEach((l) => l());
}

function loadContent(force = false): Promise<void> {
  if (loadPromise && !force) return loadPromise;
  loadPromise = (async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", CONTENT_ROW_ID)
      .maybeSingle();
    if (!error && data?.content) {
      setCached({ ...DEFAULT_CMS_CONTENT, ...(data.content as Partial<StorefrontContent>) });
    }
  })().catch(() => {
    // keep defaults on network errors
  });
  return loadPromise;
}

async function saveContent(next: StorefrontContent): Promise<boolean> {
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: CONTENT_ROW_ID, content: next, updated_at: new Date().toISOString() });
  if (error) {
    const missingTable = /site_content/.test(error.message) && /(does not exist|schema cache)/.test(error.message);
    toast.error(
      missingTable
        ? "The site_content table is missing — run supabase/migrations/002_live_catalog_and_cms.sql in the Supabase SQL editor."
        : `Could not publish content: ${error.message}`,
    );
    return false;
  }
  setCached(next);
  return true;
}

/**
 * Storefront copy shared by every visitor. Read by anyone; only admins can
 * write (enforced by RLS on `public.site_content`).
 */
export function useCmsContent() {
  const [content, setContent] = useState<StorefrontContent>(cachedContent);

  useEffect(() => {
    const sync = () => setContent(cachedContent);
    listeners.add(sync);
    sync();
    void loadContent();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const updateContent = async (patch: Partial<StorefrontContent>) => {
    const ok = await saveContent({ ...cachedContent, ...patch });
    if (ok) toast.success("Storefront content published for all visitors!");
  };

  const resetContent = async () => {
    const ok = await saveContent(DEFAULT_CMS_CONTENT);
    if (ok) toast.info("Storefront content reset to defaults");
  };

  return {
    content,
    updateContent,
    resetContent,
  };
}
