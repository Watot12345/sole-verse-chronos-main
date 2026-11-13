export type SizeSystem = "US" | "UK" | "EU" | "CM";

export interface ShoeSize {
  us: number;
  uk: number;
  eu: number;
  cm: number;
  inStock: boolean;
  stockCount: number; // For low-stock badges
}

export const SIZING_CHART: ShoeSize[] = [
  { us: 7, uk: 6.5, eu: 40, cm: 25.0, inStock: true, stockCount: 12 },
  { us: 7.5, uk: 7, eu: 40.5, cm: 25.5, inStock: true, stockCount: 8 },
  { us: 8, uk: 7.5, eu: 41, cm: 26.0, inStock: true, stockCount: 15 },
  { us: 8.5, uk: 8, eu: 42, cm: 26.5, inStock: true, stockCount: 2 }, // low stock
  { us: 9, uk: 8.5, eu: 42.5, cm: 27.0, inStock: true, stockCount: 18 },
  { us: 9.5, uk: 9, eu: 43, cm: 27.5, inStock: true, stockCount: 3 }, // low stock
  { us: 10, uk: 9.5, eu: 44, cm: 28.0, inStock: true, stockCount: 10 },
  { us: 10.5, uk: 10, eu: 44.5, cm: 28.5, inStock: true, stockCount: 1 }, // low stock
  { us: 11, uk: 10.5, eu: 45, cm: 29.0, inStock: true, stockCount: 6 },
  { us: 11.5, uk: 11, eu: 45.5, cm: 29.5, inStock: false, stockCount: 0 }, // out of stock
  { us: 12, uk: 11.5, eu: 46, cm: 30.0, inStock: true, stockCount: 4 },
  { us: 13, uk: 12.5, eu: 47.5, cm: 31.0, inStock: false, stockCount: 0 },
];

export function formatShoeSize(size: ShoeSize, system: SizeSystem): string {
  switch (system) {
    case "US":
      return `US ${size.us}`;
    case "UK":
      return `UK ${size.uk}`;
    case "EU":
      return `EU ${size.eu}`;
    case "CM":
      return `${size.cm} cm`;
  }
}

export function getSizeByUS(usSize: number): ShoeSize | undefined {
  return SIZING_CHART.find((s) => s.us === usSize);
}
