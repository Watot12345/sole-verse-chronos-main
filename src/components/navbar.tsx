import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, User, Menu, X, Heart, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { CurrencySelector } from "@/components/currency-selector";
import { SearchDialog } from "@/components/search-dialog";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Limited Drops", search: { category: "Limited Edition" } },
  { to: "/dashboard", label: "Account" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { items, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <header className="fixed top-0 z-40 w-full px-4 md:px-6">
        <div className="glass mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 md:px-6 border border-border/80 shadow-lg">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-neon text-background font-black shadow-md">
              S
            </span>
            <span>
              SOLE<span className="text-gradient">VERSE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={n.search}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full bg-electric/15 px-3 py-1 text-xs font-bold text-electric transition-colors hover:bg-electric/25"
              >
                Admin CMS
              </Link>
            )}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Currency / Region Switcher */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            {/* Quick Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search sneakers"
              className="group relative flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-electric hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline text-xs">Search...</span>
              <kbd className="hidden lg:inline rounded bg-secondary px-1 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/dashboard"
              aria-label="Wishlist"
              className="relative hidden sm:grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-neon text-neon" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-1 text-[10px] font-bold text-background">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account / Sign In Link */}
            {user ? (
              <Link
                to="/dashboard"
                aria-label="Account"
                title={user.fullName}
                className="hidden sm:flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-electric"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-electric to-neon text-[10px] font-bold text-background">
                  {user.fullName
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="hidden lg:inline max-w-[90px] truncate">
                  {user.fullName.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-electric"
              >
                <LogIn className="h-3.5 w-3.5 text-electric" />
                Sign In
              </Link>
            )}

            {/* Cart Slide-Over Trigger */}
            <button
              onClick={openCart}
              aria-label="Shopping bag"
              className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-br from-electric to-neon px-1 text-[10px] font-bold text-background shadow-sm">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="glass mx-auto mt-2 max-w-7xl rounded-2xl p-4 md:hidden border border-border shadow-xl">
            <div className="flex flex-col gap-2">
              {nav.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {n.label}
                </Link>
              ))}

              {!user && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-3 py-2.5 text-sm font-bold text-background"
                >
                  <User className="h-4 w-4" />
                  Sign In / Create Account
                </Link>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">Currency & Region:</span>
                <CurrencySelector />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
