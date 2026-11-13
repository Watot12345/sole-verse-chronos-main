import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Sparkles,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import heroSneaker from "@/assets/hero-sneaker.jpg";
import { products, categories } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SoleVerse — Step Into The Future" },
      {
        name: "description",
        content: "Premium sneakers engineered for performance, comfort, and modern lifestyle.",
      },
      { property: "og:title", content: "SoleVerse — Step Into The Future" },
      {
        property: "og:description",
        content: "Premium sneakers engineered for performance, comfort, and modern lifestyle.",
      },
    ],
  }),
  component: Index,
});

function Particles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => {
        const left = (i * 37) % 100;
        const dur = 18 + (i % 8) * 3;
        const delay = (i % 10) * 1.4;
        const size = 1 + (i % 4);
        return (
          <span
            key={i}
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              animation: `particle ${dur}s linear ${delay}s infinite`,
            }}
            className="absolute bottom-0 rounded-full bg-electric/80 shadow-[0_0_8px_oklch(0.68_0.2_255)]"
          />
        );
      })}
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative -mt-24 h-screen min-h-[760px] w-full overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <Particles />

      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/20 blur-3xl" />

      <motion.div
        style={{ y, opacity, scale }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.img
          src={heroSneaker}
          alt="Hero sneaker"
          width={1920}
          height={1280}
          className="relative z-10 w-[90%] max-w-5xl object-contain drop-shadow-[0_40px_60px_oklch(0.62_0.27_305/0.5)]"
          initial={{ opacity: 0, y: 80, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ animation: "float 6s ease-in-out infinite" }}
        />
      </motion.div>

      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pb-16 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-widest">
            <Sparkles className="h-3 w-3 text-electric" />
            New Drop · Aero Pulse 01
          </span>
          <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
            Step Into <br />
            <span className="text-gradient">The Future</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"
        >
          <p className="max-w-md text-base text-muted-foreground md:text-lg">
            Premium sneakers engineered for performance, comfort, and modern lifestyle.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background transition-all hover:scale-105 hover:shadow-[0_0_40px_oklch(1_0_0/0.3)]"
            >
              Shop Now{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop"
              className="glass inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition-all hover:bg-white/10"
            >
              Explore Collection <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}

function Featured() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Featured Collection
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Engineered icons.</h2>
        </div>
        <Link
          to="/shop"
          className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function Trending() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.27_305/0.15),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Trending Now</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            What the world is wearing.
          </h2>
        </div>
        <div className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.slice(2, 8).map((p, i) => (
            <div key={p.id} className="w-[78%] shrink-0 snap-start sm:w-[42%] lg:w-[28%]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop By Category</p>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Find your terrain.</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {categories.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <Link
              to="/shop"
              search={{ category: c.name }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-card"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={800}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-electric">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const features = [
  { Icon: Truck, t: "Free Shipping", d: "On orders over $150 worldwide." },
  { Icon: ShieldCheck, t: "Authentic Products", d: "100% verified directly from the source." },
  { Icon: RotateCcw, t: "Easy Returns", d: "30-day no-questions returns." },
  { Icon: CreditCard, t: "Secure Payments", d: "Encrypted, tokenized checkout." },
  { Icon: Sparkles, t: "AI Size Recommendation", d: "Get your perfect fit in seconds." },
  { Icon: Zap, t: "Fast Delivery", d: "Express dispatch in 24 hours." },
];

function Why() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Why SoleVerse</p>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Built for the obsessed.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass hover-lift group rounded-2xl p-6"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-electric/20 to-neon/20 text-electric transition-colors group-hover:text-neon">
              <f.Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const reviews = [
  {
    name: "Alex Chen",
    role: "Runner",
    avatar: "AC",
    text: "The Aero Pulse changed how I run. Light, responsive, and the design is unmatched.",
  },
  {
    name: "Maya Rodriguez",
    role: "Designer",
    avatar: "MR",
    text: "Wore the Chrome Lo to a launch event. Got compliments all night. Feels like wearing art.",
  },
  {
    name: "Jordan Park",
    role: "Athlete",
    avatar: "JP",
    text: "Court Reign X is the most comfortable basketball shoe I've ever owned. Period.",
  },
];

function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.68_0.2_255/0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Voices</p>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Loved by the few. Worn by the bold.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-electric text-electric" />
                ))}
              </div>
              <p className="font-display text-lg leading-relaxed">"{r.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-electric to-neon text-sm font-bold text-background">
                  {r.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Welcome to SoleVerse Priority Access!", {
      description: `We'll notify ${email} before our next limited worldwide drop.`,
    });
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass relative overflow-hidden rounded-3xl p-10 text-center md:p-16 border border-border/80"
      >
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-electric/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-neon/30 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            Join the Verse
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
            Drops, in your inbox.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-muted-foreground">
            Be first to know when new editions release worldwide. No spam — only signals.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@future.com"
              className="flex-1 rounded-full border border-border bg-background/60 px-5 py-3 text-sm outline-none ring-electric/40 focus:ring-2 text-foreground"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wider text-background transition-transform hover:scale-105 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}

function Index() {
  return (
    <>
      <Hero />
      <Featured />
      <Trending />
      <Categories />
      <Why />
      <Testimonials />
      <Newsletter />
    </>
  );
}
