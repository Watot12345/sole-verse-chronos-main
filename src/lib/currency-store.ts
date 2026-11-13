import { useEffect, useState } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "SGD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // exchange rate relative to USD
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rate: 1.0, decimals: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.92, decimals: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rate: 0.79, decimals: 2 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", rate: 155.0, decimals: 0 },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    rate: 1.52,
    decimals: 2,
  },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.38, decimals: 2 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", rate: 1.34, decimals: 2 },
};

const STORAGE_KEY = "soleverse-currency";
const listeners = new Set<() => void>();

function readCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    return saved && CURRENCIES[saved] ? saved : "USD";
  } catch {
    return "USD";
  }
}

function writeCurrency(currency: CurrencyCode) {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn());
}

export function formatCurrencyPrice(
  amountInUSD: number,
  currencyCode: CurrencyCode = "USD",
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = amountInUSD * config.rate;
  if (config.decimals === 0) {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${config.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    setCurrencyState(readCurrency());
    const listener = () => setCurrencyState(readCurrency());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    writeCurrency(code);
  };

  const currentConfig = CURRENCIES[currency] || CURRENCIES.USD;

  const format = (amountInUSD: number) => formatCurrencyPrice(amountInUSD, currency);

  const convert = (amountInUSD: number) => {
    return +(amountInUSD * currentConfig.rate).toFixed(currentConfig.decimals);
  };

  return {
    currency,
    currentConfig,
    setCurrency,
    format,
    convert,
    currencies: Object.values(CURRENCIES),
  };
}
