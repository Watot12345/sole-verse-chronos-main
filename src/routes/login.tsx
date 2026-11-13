import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Lock, Mail, User, Phone, MapPin, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — SoleVerse" },
      {
        name: "description",
        content: "Sign in to save your sneaker bag, personal details, and track worldwide orders.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isHydrated, signIn, signUp } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("United States");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const redirectTarget =
    search.redirect && search.redirect.startsWith("/") ? search.redirect : "/shop";

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      void navigate({ to: redirectTarget as "/shop" });
    }
  }, [isHydrated, isAuthenticated, navigate, redirectTarget]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await signIn(loginEmail, loginPassword);
      if (!res.ok) {
        setError(res.error ?? "Unable to sign in.");
        return;
      }
      void navigate({ to: redirectTarget as "/shop" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await signUp({
        fullName,
        email,
        password,
        phone,
        country,
        address,
        apartment,
        city,
        state,
        zip,
      });
      if (!res.ok) {
        setError(res.error ?? "Unable to create account.");
        return;
      }
      void navigate({ to: redirectTarget as "/shop" });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setTab("signin");
    setError("");
    setLoginEmail("alex.chen@example.com");
    setLoginPassword("soleverse123");
  };

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 md:py-20">
      <div className="mb-8 text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-widest border border-border/80">
          <Sparkles className="h-3.5 w-3.5 text-electric" />
          Member Access Required
        </span>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold">
          {tab === "signin" ? "Sign in to SoleVerse" : "Create your profile"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save your sneaker bag, personal shipping details, and track every drop.
        </p>
      </div>

      <div className="glass rounded-3xl border border-border/80 p-6 sm:p-8 shadow-2xl">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary/70 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError("");
            }}
            className={`rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "signin"
                ? "bg-foreground text-background shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError("");
            }}
            className={`rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "signup"
                ? "bg-foreground text-background shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric to-neon py-3.5 text-sm font-bold text-background shadow-lg transition-transform hover:scale-[1.01]"
            >
              Sign In & Continue
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">Demo Account</p>
                  <p className="mt-0.5 text-muted-foreground">
                    alex.chen@example.com · soleverse123
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold hover:border-electric transition-colors"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-electric" />
                Shipping Details
              </p>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address *"
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="Apt / Suite (Optional)"
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City *"
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State / Region *"
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Postal Code *"
                    className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country *"
                  className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-electric/40"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric to-neon py-3.5 text-sm font-bold text-background shadow-lg transition-transform hover:scale-[1.01]"
            >
              Create Account & Save Profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Your saved bag and shipping details are synced to your account.
        </div>
      </div>
    </div>
  );
}
