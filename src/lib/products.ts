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
