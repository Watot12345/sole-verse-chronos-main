import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Ruler,
  Globe,
  Clock,
  CheckCircle2,
  MessageSquarePlus,
} from "lucide-react";
import { getProduct, products, type Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart-store";
import { useCurrency } from "@/lib/currency-store";
import { useWishlist } from "@/lib/wishlist-store";
import { SIZING_CHART, type SizeSystem, formatShoeSize } from "@/lib/sizing";
import { SizeGuideModal } from "@/components/size-guide-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — SoleVerse` },
          {
            name: "description",
            content: `${loaderData.product.name} by SoleVerse. ${loaderData.product.category}. High performance athletic footwear with worldwide delivery.`,
          },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-electric hover:underline">
        Back to collection
      </Link>
    </div>
  ),
  component: ProductPage,
});

interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  sizePurchased: string;
  fit: "True to size" | "Runs slightly small" | "Runs slightly large";
  comment: string;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "r1",
    author: "Marcus Vance",
    location: "London, UK",
    rating: 5,
    date: "2 weeks ago",
    sizePurchased: "US 10 / UK 9.5",
    fit: "True to size",
    comment:
      "Exceptional responsiveness during long-distance track runs. The carbon plate transition feels smooth and effortless. Materials are ultra-premium.",
  },
  {
    id: "r2",
    author: "Kenji Sato",
    location: "Tokyo, JP",
    rating: 5,
    date: "1 month ago",
    sizePurchased: "US 9 / 27.0 cm",
    fit: "True to size",
    comment:
      "Arrived in Tokyo via DHL in 3 days! The cushioning is bouncy and supportive for street style and sprinting alike. Best silhouette of the year.",
  },
  {
    id: "r3",
    author: "Elena Rostova",
    location: "Berlin, DE",
    rating: 4,
    date: "1 month ago",
    sizePurchased: "US 8 / EU 41",
    fit: "Runs slightly small",
    comment:
      "Great stability and sleek look. If you wear thick athletic socks, recommend sizing up by half a size. Very comfortable overall.",
  },
];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { format, convert } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { add } = useCart();

  const [selectedUSSize, setSelectedUSSize] = useState<number | null>(9.5);
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>("US");
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [tab, setTab] = useState<"desc" | "spec" | "ship" | "reviews">("desc");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Review submission state
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewFit, setNewReviewFit] = useState<CustomerReview["fit"]>("True to size");
  const [newReviewComment, setNewReviewComment] = useState("");

  const wishlisted = isWishlisted(product.id);
  const gallery = [product.image, product.altImage, product.image, product.altImage];

  const handleAddToCart = () => {
    if (!selectedUSSize) {
      toast.error("Please select a shoe size before adding to bag");
      return;
    }
    add({ id: product.id, size: selectedUSSize, qty }, true, true);
  };

  const handleBuyNow = () => {
    if (!selectedUSSize) {
      toast.error("Please select a shoe size before checking out");
      return;
    }
    add({ id: product.id, size: selectedUSSize, qty }, false, false);
    window.location.href = "/checkout";
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      toast.error("Please fill in your name and review details");
      return;
    }
    const newEntry: CustomerReview = {
      id: `r-${Date.now()}`,
      author: newReviewAuthor,
      location: "Verified Global Customer",
      rating: newReviewRating,
      date: "Just now",
      sizePurchased: selectedUSSize ? `US ${selectedUSSize}` : "US 9.5",
      fit: newReviewFit,
      comment: newReviewComment,
    };
    setReviewsList([newEntry, ...reviewsList]);
    setReviewModalOpen(false);
    setNewReviewAuthor("");
    setNewReviewComment("");
    toast.success("Thank you! Your review has been published.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      {/* Breadcrumb Navigation */}
      <div className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span>/</span>
        <Link to="/shop" search={{ category: product.category }} className="hover:text-foreground">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Gallery & Visuals */}
        <div className="space-y-4">
          <motion.div
            key={activeImageIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-charcoal via-background to-charcoal shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.27_305/0.2),transparent_60%)]" />
            <img
              src={gallery[activeImageIndex]}
              alt={product.name}
              width={1200}
              height={1200}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ animation: "float 8s ease-in-out infinite" }}
            />
            <span className="glass absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-border/60">
              360° Studio View
            </span>
          </motion.div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`relative aspect-square overflow-hidden rounded-2xl border transition-all ${
                  activeImageIndex === i
                    ? "border-electric glow-blue ring-2 ring-electric/50"
                    : "border-border/70 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={g} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Global Dispatch Countdown */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 text-xs flex items-center gap-3">
            <Clock className="h-4 w-4 text-electric shrink-0" />
            <p className="text-muted-foreground">
              ⚡ Order within <strong className="text-foreground">3 hrs 42 mins</strong> for
              same-day express global dispatch to your doorstep.
            </p>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
              {product.brand} · {product.category}
            </p>
            {product.badge && (
              <span className="rounded-full bg-gradient-to-r from-electric to-neon px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background shadow-md">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {product.name}
          </h1>

          {/* Rating & Stock */}
          <div className="mt-3 flex items-center gap-4 text-xs sm:text-sm">
            <button
              onClick={() => setTab("reviews")}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Star className="h-4 w-4 fill-electric text-electric" />
              <span className="font-bold text-foreground">{product.rating}</span>
              <span className="text-muted-foreground underline decoration-border ml-1">
                ({reviewsList.length + product.reviews} verified reviews)
              </span>
            </button>
            <span className="text-muted-foreground">•</span>
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> In Stock & Ready to Ship
              </span>
            ) : (
              <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                Sold Out Worldwide
              </span>
            )}
          </div>

          {/* Price with Live Currency */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              {format(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-base sm:text-lg text-muted-foreground line-through">
                  {format(product.originalPrice)}
                </span>
                <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-xs font-bold text-neon">
                  Save {format(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Color Switcher */}
          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Color Silhouettes
            </p>
            <div className="flex gap-2.5">
              {product.colors.map((c: string, i: number) => (
                <button
                  key={c}
                  onClick={() => setActiveImageIndex(i % gallery.length)}
                  style={{ backgroundColor: c }}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                    activeImageIndex % product.colors.length === i
                      ? "border-electric ring-2 ring-electric/50 scale-110"
                      : "border-border/80"
                  }`}
                  aria-label={`Select color ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Sizing & International System Toggle */}
          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Select Size:
                </span>
                {/* Size System Selector (US / UK / EU / CM) */}
                <div className="flex rounded-lg border border-border/80 bg-background/50 p-0.5 text-[11px] font-semibold">
                  {(["US", "UK", "EU", "CM"] as SizeSystem[]).map((sys) => (
                    <button
                      key={sys}
                      onClick={() => setSizeSystem(sys)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        sizeSystem === sys
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sys}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizing Guide Modal Button */}
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-electric hover:underline"
              >
                <Ruler className="h-3.5 w-3.5" /> Size Guide & Chart
              </button>
            </div>

            {/* Sizes Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {SIZING_CHART.map((s) => {
                const isSelected = selectedUSSize === s.us;
                const label =
                  sizeSystem === "US"
                    ? `${s.us}`
                    : sizeSystem === "UK"
                      ? `${s.uk}`
                      : sizeSystem === "EU"
                        ? `${s.eu}`
                        : `${s.cm}`;

                return (
                  <button
                    key={s.us}
                    onClick={() => s.inStock && setSelectedUSSize(s.us)}
                    disabled={!s.inStock}
                    className={`relative rounded-xl border p-2.5 text-center transition-all ${
                      isSelected
                        ? "border-electric bg-electric/15 text-electric font-bold shadow-md ring-1 ring-electric"
                        : s.inStock
                          ? "border-border/80 text-foreground hover:border-foreground/50 hover:bg-secondary/40"
                          : "border-border/40 text-muted-foreground opacity-40 cursor-not-allowed line-through"
                    }`}
                  >
                    <span className="block text-xs font-semibold">{label}</span>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">
                      {sizeSystem}
                    </span>
                    {s.inStock && s.stockCount <= 3 && (
                      <span className="absolute -top-1.5 -right-1 rounded-full bg-amber-500 px-1 text-[8px] font-black text-black">
                        {s.stockCount} left
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center justify-between rounded-full border border-border/80 bg-background/50 p-1 px-2">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-background shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              Add to Bag · {format(product.price * qty)}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`grid h-12 w-12 place-items-center rounded-full border transition-colors ${
                wishlisted
                  ? "border-neon bg-neon text-background shadow-md"
                  : "border-border/80 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            className="mt-3 block w-full rounded-full bg-gradient-to-r from-electric to-neon py-3.5 text-center text-xs font-bold uppercase tracking-wider text-background shadow-xl transition-transform hover:scale-[1.02] active:scale-95"
          >
            Instant Worldwide Checkout
          </button>

          {/* Worldwide Value Propositions */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
            <div className="glass flex items-center gap-2.5 rounded-xl p-3 border border-border/80">
              <Globe className="h-4 w-4 text-electric shrink-0" />
              <span>Worldwide Shipping to 180+ Countries</span>
            </div>
            <div className="glass flex items-center gap-2.5 rounded-xl p-3 border border-border/80">
              <ShieldCheck className="h-4 w-4 text-neon shrink-0" />
              <span>100% Verified Authentic Guarantee</span>
            </div>
          </div>

          {/* Tabs: Description, Specs, Shipping, Reviews */}
          <div className="mt-10">
            <div className="flex gap-4 sm:gap-6 border-b border-border/80 overflow-x-auto pb-px">
              {[
                { k: "desc", l: "Description" },
                { k: "spec", l: "Specifications" },
                { k: "ship", l: "Shipping & Customs" },
                { k: "reviews", l: `Reviews (${reviewsList.length})` },
              ].map(({ k, l }) => (
                <button
                  key={k}
                  onClick={() => setTab(k as never)}
                  className={`relative shrink-0 pb-3 text-xs sm:text-sm font-semibold transition-colors ${
                    tab === k ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                  {tab === k && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-electric to-neon" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tab === "desc" && (
                <div className="space-y-3">
                  <p>
                    The <strong>{product.name}</strong> pushes the boundaries of modern sneaker
                    design. Crafted with a multi-density dual-foam midsole and dynamic torsion
                    chassis, it provides uncompromising stability whether navigating city streets or
                    setting marathon personal records.
                  </p>
                  <p>
                    Every pair is individually inspected in our precision lab to ensure stitch
                    density, tensile durability, and breathability meet championship standards.
                  </p>
                </div>
              )}

              {tab === "spec" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/80 bg-background/40 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Upper Material
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      Engineered AeroKnit™ + Full-Grain Nubuck
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/40 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Cushioning Platform
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      ChronoPulse™ Supercritical Nitrogen Foam
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/40 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Traction
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      High-Abrasion Wet-Grip Rubber Outsole
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/40 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Weight & Drop
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      278 grams (US 9.5) · 8mm Heel-to-Toe Drop
                    </p>
                  </div>
                </div>
              )}

              {tab === "ship" && (
                <div className="space-y-3">
                  <p>
                    <strong>Global Dispatch:</strong> Orders are packaged in premium climate-sealed
                    boxes and shipped directly from our primary distribution hubs in Singapore and
                    Frankfurt.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>DHL Express Worldwide:</strong> 2 to 4 business days with end-to-end
                      GPS tracking.
                    </li>
                    <li>
                      <strong>Customs & Duties:</strong> All import duties, VAT, and local customs
                      clearance fees are prepaid at checkout—no surprise door fees.
                    </li>
                    <li>
                      <strong>Global Returns:</strong> Complimentary 30-day return policy for any
                      unworn pair in original packaging.
                    </li>
                  </ul>
                </div>
              )}

              {tab === "reviews" && (
                <div className="space-y-6">
                  {/* Reviews summary & Write review button */}
                  <div className="glass flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-4 border border-border/80">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-electric/15 text-electric font-display text-xl font-bold">
                        {product.rating}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-3.5 w-3.5 fill-electric text-electric" />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Based on {reviewsList.length + product.reviews} international athlete
                          ratings
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5 text-electric" /> Write a Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-2xl border border-border/80 bg-background/40 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs">
                              {rev.author}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({rev.location})
                            </span>
                            <span className="rounded bg-electric/10 px-1.5 py-0.2 text-[9px] font-semibold text-electric">
                              Verified Buyer
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-0.5">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-electric text-electric" />
                            ))}
                          </div>
                          <span className="text-muted-foreground text-[11px]">
                            • Size: {rev.sizePurchased}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            • Fit: {rev.fit}
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Silhouettes */}
      <section className="mt-20 md:mt-28">
        <h2 className="mb-8 font-display text-2xl sm:text-3xl font-bold">You might also like</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
        </div>
      </section>

      {/* Sizing Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        selectedSystem={sizeSystem}
      />

      {/* Write a Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md border-border bg-card/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Write a Customer Review
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share your feedback for {product.name} with athletes worldwide.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 mt-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewReviewRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        s <= newReviewRating
                          ? "fill-electric text-electric"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newReviewAuthor}
                onChange={(e) => setNewReviewAuthor(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-electric/40"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Fit Evaluation
              </label>
              <select
                value={newReviewFit}
                onChange={(e) => setNewReviewFit(e.target.value as CustomerReview["fit"])}
                className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-electric/40"
              >
                <option value="True to size">True to size</option>
                <option value="Runs slightly small">
                  Runs slightly small (Recommend sizing up)
                </option>
                <option value="Runs slightly large">
                  Runs slightly large (Recommend sizing down)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Your Review
              </label>
              <textarea
                required
                rows={4}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Describe how the shoe feels, comfort, cushioning, and performance..."
                className="w-full rounded-xl border border-border bg-background/60 p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-electric/40 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-electric to-neon py-3 text-xs font-bold uppercase tracking-wider text-background shadow-lg transition-transform hover:scale-[1.02]"
            >
              Submit Review
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
