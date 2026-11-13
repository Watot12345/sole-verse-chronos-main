import { Ruler, Check, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SIZING_CHART, type SizeSystem } from "@/lib/sizing";
import { useState } from "react";

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSystem: SizeSystem;
}

export function SizeGuideModal({ open, onOpenChange, selectedSystem }: SizeGuideModalProps) {
  const [highlightSystem, setHighlightSystem] = useState<SizeSystem>(selectedSystem);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-electric">
            <Ruler className="h-5 w-5" />
            <DialogTitle className="font-display text-xl font-bold">
              International Sizing Guide
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Compare conversions between US, UK, European (EU), and Japanese/CM metrics.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Fit Recommendation Notice */}
          <div className="flex items-start gap-3 rounded-xl border border-electric/30 bg-electric/10 p-3.5 text-xs text-foreground">
            <Info className="h-4 w-4 shrink-0 text-electric mt-0.5" />
            <div>
              <span className="font-semibold text-electric">SoleVerse Precision Fit:</span>
              <p className="mt-0.5 text-muted-foreground">
                94% of athletes report our silhouettes run <strong>true to size</strong>. If you
                have wide feet or prefer extra toe-box volume, we recommend sizing up by half a size
                (+0.5 US).
              </p>
            </div>
          </div>

          {/* Sizing Chart Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-background/40">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/40 font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                <tr>
                  <th className="p-3">US Men</th>
                  <th className="p-3">UK</th>
                  <th className="p-3">EU</th>
                  <th className="p-3">Foot Length (CM)</th>
                  <th className="p-3 text-right">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {SIZING_CHART.map((s) => (
                  <tr key={s.us} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">US {s.us}</td>
                    <td className="p-3 text-muted-foreground">UK {s.uk}</td>
                    <td className="p-3 text-muted-foreground">EU {s.eu}</td>
                    <td className="p-3 font-mono text-muted-foreground">{s.cm} cm</td>
                    <td className="p-3 text-right">
                      {s.inStock ? (
                        s.stockCount <= 3 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                            Low ({s.stockCount} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <Check className="h-3 w-3" /> In Stock
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-muted-foreground line-through">
                          Sold Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measurement tips */}
          <div className="rounded-xl border border-border bg-background/30 p-3 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">How to measure your foot:</p>
            <p>1. Stand on a level floor with your heels against a flat wall.</p>
            <p>
              2. Measure from the base of your heel to the tip of your longest toe in centimeters.
            </p>
            <p>3. Match your measurement to the CM column in the chart above.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
