import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency, type CurrencyCode } from "@/lib/currency-store";

export function CurrencySelector() {
  const { currency, setCurrency, currentConfig, currencies } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-electric hover:text-foreground outline-none">
        <span className="text-sm">{currentConfig.flag}</span>
        <span>{currentConfig.code}</span>
        <span className="text-[10px] text-muted-foreground">({currentConfig.symbol})</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-border bg-card/95 backdrop-blur-xl p-1.5"
      >
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Select Currency
        </div>
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code as CurrencyCode)}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs cursor-pointer hover:bg-secondary focus:bg-secondary"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{c.flag}</span>
              <span className="font-medium text-foreground">{c.code}</span>
              <span className="text-muted-foreground text-[11px]">{c.name}</span>
            </div>
            {currency === c.code && <Check className="h-3.5 w-3.5 text-electric" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
