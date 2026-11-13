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

const IMG_NIKE_RUNNING =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";
const IMG_NIKE_AF1 =
  "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80";
const IMG_JORDAN_1 =
  "https://images.unsplash.com/photo-1542219550-37153d387c27?auto=format&fit=crop&w=900&q=80";
const IMG_JORDAN_BOX =
  "https://images.unsplash.com/photo-1751624310837-32ecd6bc6d94?auto=format&fit=crop&w=900&q=80";
const IMG_ADIDAS_BOOST =
  "https://images.unsplash.com/photo-1519861297062-a1eec154f81a?auto=format&fit=crop&w=900&q=80";
const IMG_NB_574 =
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80";
const IMG_NB_550 =
  "https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?auto=format&fit=crop&w=900&q=80";
const IMG_NB_990 =
  "https://images.unsplash.com/photo-1643541323850-14dc38b00c12?auto=format&fit=crop&w=900&q=80";
const IMG_DUNK_PANDA =
  "https://images.unsplash.com/photo-1623684225794-a8f1f5037f5c?auto=format&fit=crop&w=900&q=80";
const IMG_JORDAN_CHICAGO =
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80";
const IMG_JORDAN_SHADOW =
  "https://images.unsplash.com/photo-1567294999233-9cc7febb83b9?auto=format&fit=crop&w=900&q=80";
const IMG_DUNK_RED =
  "https://images.unsplash.com/photo-1600181516264-3ea807ff44b9?auto=format&fit=crop&w=900&q=80";
const IMG_NIKE_PEGASUS =
  "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=900&q=80";
const IMG_ADIDAS_GAZELLE =
  "https://images.unsplash.com/photo-1700853012811-ce0a42d2b6d3?auto=format&fit=crop&w=900&q=80";
const IMG_PUMA_SUEDE =
  "https://images.unsplash.com/photo-1509442233604-131901ff8d40?auto=format&fit=crop&w=900&q=80";
const IMG_PUMA_RSX =
  "https://images.unsplash.com/photo-1750270438660-f57de76532cc?auto=format&fit=crop&w=900&q=80";

export const products: Product[] = [
  {
    id: "nike-air-max-270",
    name: "Nike Air Max 270 React",
    brand: "Nike",
    category: "Running",
    price: 170,
    originalPrice: 195,
    rating: 4.8,
    reviews: 324,
    image: IMG_NIKE_RUNNING,
    altImage: IMG_ADIDAS_BOOST,
    colors: ["#ef4444", "#ffffff", "#0a0a0a"],
    badge: "New",
    inStock: true,
  },
  {
    id: "jordan-1-retro-og",
    name: "Air Jordan 1 Retro High OG",
    brand: "Jordan",
    category: "Basketball",
    price: 185,
    rating: 4.9,
    reviews: 512,
    image: IMG_JORDAN_1,
    altImage: IMG_JORDAN_BOX,
    colors: ["#0a0a0a", "#c0c0c0", "#ffffff"],
    badge: "Bestseller",
    inStock: true,
  },
  {
    id: "nb-574-classic",
    name: "New Balance 574 Classic",
    brand: "New Balance",
    category: "Lifestyle",
    price: 110,
    rating: 4.7,
    reviews: 198,
    image: IMG_NB_574,
    altImage: IMG_NB_550,
    colors: ["#c0c0c0", "#ffffff"],
    inStock: true,
  },
  {
    id: "jordan-1-collectors",
    name: "Air Jordan 1 Collector's Pack",
    brand: "Jordan",
    category: "Limited Edition",
    price: 320,
    originalPrice: 380,
    rating: 5.0,
    reviews: 87,
    image: IMG_JORDAN_BOX,
    altImage: IMG_JORDAN_1,
    colors: ["#0a0a0a", "#ef4444", "#ffffff"],
    badge: "Limited",
    inStock: true,
  },
  {
    id: "adidas-ultraboost-light",
    name: "Adidas Ultraboost Light",
    brand: "Adidas",
    category: "Training",
    price: 190,
    rating: 4.8,
    reviews: 241,
    image: IMG_ADIDAS_BOOST,
    altImage: IMG_NIKE_RUNNING,
    colors: ["#0a0a0a", "#ffffff"],
    inStock: true,
  },
  {
    id: "nike-air-force-1-07",
    name: "Nike Air Force 1 '07",
    brand: "Nike",
    category: "Casual",
    price: 115,
    rating: 4.9,
    reviews: 612,
    image: IMG_NIKE_AF1,
    altImage: IMG_NB_550,
    colors: ["#ffffff"],
    badge: "Icon",
    inStock: true,
  },
  {
    id: "nb-990v6-usa",
    name: "New Balance 990v6 Made in USA",
    brand: "New Balance",
    category: "Running",
    price: 200,
    rating: 4.8,
    reviews: 156,
    image: IMG_NB_990,
    altImage: IMG_NB_574,
    colors: ["#0a0a0a", "#c0c0c0"],
    badge: "New",
    inStock: true,
  },
  {
    id: "nb-550-vintage",
    name: "New Balance 550 Vintage",
    brand: "New Balance",
    category: "Basketball",
    price: 120,
    rating: 4.7,
    reviews: 92,
    image: IMG_NB_550,
    altImage: IMG_NIKE_AF1,
    colors: ["#ffffff", "#0a0a0a"],
    inStock: false,
  },
  {
    id: "nike-dunk-low-panda",
    name: "Nike Dunk Low Retro 'Panda'",
    brand: "Nike",
    category: "Casual",
    price: 115,
    rating: 4.9,
    reviews: 845,
    image: IMG_DUNK_PANDA,
    altImage: IMG_NIKE_AF1,
    colors: ["#0a0a0a", "#ffffff"],
    badge: "Bestseller",
    inStock: true,
  },
  {
    id: "jordan-1-mid-chicago",
    name: "Air Jordan 1 Mid 'Chicago'",
    brand: "Jordan",
    category: "Basketball",
    price: 135,
    rating: 4.8,
    reviews: 418,
    image: IMG_JORDAN_CHICAGO,
    altImage: IMG_JORDAN_1,
    colors: ["#ef4444", "#ffffff", "#0a0a0a"],
    badge: "Hot",
    inStock: true,
  },
  {
    id: "nike-pegasus-41",
    name: "Nike Air Zoom Pegasus 41",
    brand: "Nike",
    category: "Running",
    price: 140,
    originalPrice: 160,
    rating: 4.7,
    reviews: 276,
    image: IMG_NIKE_PEGASUS,
    altImage: IMG_NIKE_RUNNING,
    colors: ["#0a0a0a", "#3b82f6"],
    badge: "New",
    inStock: true,
  },
  {
    id: "adidas-gazelle-bold",
    name: "Adidas Gazelle Bold",
    brand: "Adidas",
    category: "Lifestyle",
    price: 120,
    rating: 4.8,
    reviews: 304,
    image: IMG_ADIDAS_GAZELLE,
    altImage: IMG_NB_574,
    colors: ["#ffffff", "#10b981"],
    inStock: true,
  },
  {
    id: "puma-rs-x-efekt",
    name: "Puma RS-X Efekt",
    brand: "Puma",
    category: "Training",
    price: 115,
    originalPrice: 135,
    rating: 4.6,
    reviews: 163,
    image: IMG_PUMA_RSX,
    altImage: IMG_ADIDAS_BOOST,
    colors: ["#3b82f6", "#ffffff", "#f97316"],
    inStock: true,
  },
  {
    id: "puma-suede-classic",
    name: "Puma Suede Classic XXI",
    brand: "Puma",
    category: "Casual",
    price: 75,
    rating: 4.7,
    reviews: 389,
    image: IMG_PUMA_SUEDE,
    altImage: IMG_DUNK_PANDA,
    colors: ["#0a0a0a", "#ffffff"],
    inStock: true,
  },
  {
    id: "nike-dunk-university-red",
    name: "Nike Dunk Low 'University Red'",
    brand: "Nike",
    category: "Limited Edition",
    price: 155,
    originalPrice: 180,
    rating: 4.9,
    reviews: 214,
    image: IMG_DUNK_RED,
    altImage: IMG_JORDAN_CHICAGO,
    colors: ["#ef4444", "#ffffff"],
    badge: "Limited",
    inStock: true,
  },
  {
    id: "jordan-1-shadow-2",
    name: "Air Jordan 1 High 'Shadow 2.0'",
    brand: "Jordan",
    category: "Limited Edition",
    price: 240,
    rating: 4.9,
    reviews: 195,
    image: IMG_JORDAN_SHADOW,
    altImage: IMG_JORDAN_1,
    colors: ["#0a0a0a", "#c0c0c0"],
    badge: "Limited",
    inStock: true,
  },
  {
    id: "adidas-samba-og",
    name: "Adidas Samba OG",
    brand: "Adidas",
    category: "Casual",
    price: 100,
    rating: 4.8,
    reviews: 612,
    image: IMG_ADIDAS_GAZELLE,
    altImage: IMG_PUMA_SUEDE,
    colors: ["#0a0a0a"],
    badge: "Trending",
    inStock: true,
  },
  {
    id: "nike-vomero-5",
    name: "Nike Zoom Vomero 5",
    brand: "Nike",
    category: "Running",
    price: 160,
    rating: 4.9,
    reviews: 284,
    image: IMG_NIKE_PEGASUS,
    altImage: IMG_NIKE_RUNNING,
    colors: ["#cbd5e1"],
    badge: "New",
    inStock: true,
  },
  {
    id: "jordan-4-bred",
    name: "Air Jordan 4 Retro 'Bred'",
    brand: "Jordan",
    category: "Basketball",
    price: 215,
    originalPrice: 245,
    rating: 4.9,
    reviews: 438,
    image: IMG_JORDAN_1,
    altImage: IMG_JORDAN_CHICAGO,
    colors: ["#dc2626"],
    badge: "Hot",
    inStock: true,
  },
  {
    id: "nb-2002r-protection",
    name: "New Balance 2002R 'Protection Pack'",
    brand: "New Balance",
    category: "Lifestyle",
    price: 165,
    rating: 4.8,
    reviews: 319,
    image: IMG_NB_990,
    altImage: IMG_NB_574,
    colors: ["#64748b"],
    inStock: true,
  },
  {
    id: "adidas-supernova-rise",
    name: "Adidas Supernova Rise",
    brand: "Adidas",
    category: "Training",
    price: 140,
    originalPrice: 160,
    rating: 4.7,
    reviews: 175,
    image: IMG_ADIDAS_BOOST,
    altImage: IMG_PUMA_RSX,
    colors: ["#2563eb"],
    inStock: true,
  },
  {
    id: "nike-metcon-9",
    name: "Nike Metcon 9 AMP",
    brand: "Nike",
    category: "Training",
    price: 150,
    rating: 4.8,
    reviews: 241,
    image: IMG_PUMA_RSX,
    altImage: IMG_NIKE_RUNNING,
    colors: ["#f97316"],
    badge: "Pro",
    inStock: true,
  },
  {
    id: "puma-palermo-og",
    name: "Puma Palermo OG",
    brand: "Puma",
    category: "Lifestyle",
    price: 95,
    rating: 4.7,
    reviews: 149,
    image: IMG_PUMA_SUEDE,
    altImage: IMG_ADIDAS_GAZELLE,
    colors: ["#16a34a"],
    badge: "New",
    inStock: true,
  },
  {
    id: "jordan-3-white-cement",
    name: "Air Jordan 3 Retro 'White Cement'",
    brand: "Jordan",
    category: "Limited Edition",
    price: 210,
    rating: 5.0,
    reviews: 387,
    image: IMG_JORDAN_BOX,
    altImage: IMG_JORDAN_SHADOW,
    colors: ["#e2e8f0"],
    badge: "Limited",
    inStock: true,
  },
];

export const categories = [
  { name: "Running", image: IMG_NIKE_RUNNING },
  { name: "Basketball", image: IMG_JORDAN_1 },
  { name: "Casual", image: IMG_NIKE_AF1 },
  { name: "Training", image: IMG_ADIDAS_BOOST },
  { name: "Lifestyle", image: IMG_NB_574 },
  { name: "Limited Edition", image: IMG_JORDAN_BOX },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
