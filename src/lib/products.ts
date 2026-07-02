import running from "@/assets/shoe-running.jpg";
import basketball from "@/assets/shoe-basketball.jpg";
import lifestyle from "@/assets/shoe-lifestyle.jpg";
import limited from "@/assets/shoe-limited.jpg";
import training from "@/assets/shoe-training.jpg";
import casual from "@/assets/shoe-casual.jpg";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Running" | "Basketball" | "Lifestyle" | "Training" | "Limited Edition" | "Casual";
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  altImage: string;
  colors: string[];
  badge?: string;
  inStock: boolean;
};

export const products: Product[] = [
  {
    id: "sv-aero-01",
    name: "Aero Pulse 01",
    brand: "SoleVerse",
    category: "Running",
    price: 189,
    originalPrice: 220,
    rating: 4.8,
    reviews: 324,
    image: running,
    altImage: training,
    colors: ["#3b82f6", "#ffffff", "#0a0a0a"],
    badge: "New",
    inStock: true,
  },
  {
    id: "sv-court-x",
    name: "Court Reign X",
    brand: "SoleVerse",
    category: "Basketball",
    price: 245,
    rating: 4.9,
    reviews: 512,
    image: basketball,
    altImage: limited,
    colors: ["#0a0a0a", "#a855f7", "#ffffff"],
    badge: "Bestseller",
    inStock: true,
  },
  {
    id: "sv-chrome-lo",
    name: "Chrome Lo Metallic",
    brand: "SoleVerse",
    category: "Lifestyle",
    price: 165,
    rating: 4.7,
    reviews: 198,
    image: lifestyle,
    altImage: casual,
    colors: ["#c0c0c0", "#ffffff"],
    inStock: true,
  },
  {
    id: "sv-eclipse",
    name: "Eclipse Prism",
    brand: "SoleVerse",
    category: "Limited Edition",
    price: 420,
    originalPrice: 480,
    rating: 5.0,
    reviews: 87,
    image: limited,
    altImage: basketball,
    colors: ["#0a0a0a", "#a855f7"],
    badge: "Limited",
    inStock: true,
  },
  {
    id: "sv-forge",
    name: "Forge Trainer Pro",
    brand: "SoleVerse",
    category: "Training",
    price: 159,
    rating: 4.6,
    reviews: 241,
    image: training,
    altImage: running,
    colors: ["#1f2937", "#3b82f6"],
    inStock: true,
  },
  {
    id: "sv-blanco",
    name: "Blanco Minima",
    brand: "SoleVerse",
    category: "Casual",
    price: 119,
    rating: 4.5,
    reviews: 612,
    image: casual,
    altImage: lifestyle,
    colors: ["#ffffff"],
    inStock: true,
  },
  {
    id: "sv-aero-02",
    name: "Aero Pulse Carbon",
    brand: "SoleVerse",
    category: "Running",
    price: 210,
    rating: 4.7,
    reviews: 156,
    image: training,
    altImage: running,
    colors: ["#0a0a0a", "#3b82f6"],
    badge: "New",
    inStock: true,
  },
  {
    id: "sv-court-violet",
    name: "Court Reign Violet",
    brand: "SoleVerse",
    category: "Basketball",
    price: 260,
    rating: 4.8,
    reviews: 92,
    image: limited,
    altImage: basketball,
    colors: ["#0a0a0a", "#a855f7"],
    inStock: false,
  },
];

export const categories = [
  { name: "Running", image: running },
  { name: "Basketball", image: basketball },
  { name: "Casual", image: casual },
  { name: "Training", image: training },
  { name: "Lifestyle", image: lifestyle },
  { name: "Limited Edition", image: limited },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
