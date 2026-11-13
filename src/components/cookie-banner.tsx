import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("soleverse-cookie-consent");
      if (!consent) {
        // Small delay so it animates in smoothly
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const accept = () => {
    localStorage.setItem("soleverse-cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("soleverse-cookie-consent", "essential-only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="glass flex flex-col gap-3 rounded-2xl p-4 shadow-2xl border border-border/80 bg-card/90 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-electric/15 text-electric">
            <Cookie className="h-4 w-4" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use essential cookies to deliver global currency switching, cart persistence, and
            secure checkout. By browsing SoleVerse, you agree to our{" "}
            <span className="text-foreground underline underline-offset-2">
              Privacy & Cookie Policy
            </span>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            onClick={decline}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-gradient-to-r from-electric to-neon px-4 py-1.5 text-xs font-bold text-background shadow-md transition-transform hover:scale-105"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
