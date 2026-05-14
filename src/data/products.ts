import { Product } from "@/context/CartContext";

export const products: Product[] = [
  {
    id: "phone-1",
    name: "Aether Pro Max",
    price: 1199,
    description: "The ultimate flagship experience with a revolutionary titanium frame and next-gen camera system.",
    image: "/images/phone1.png",
    screen: "6.8\" OLED 120Hz",
    processor: "Aether Silicon M2",
    ram: "16GB",
    storage: "512GB",
  },
  {
    id: "phone-2",
    name: "Aether Ultra 5G",
    price: 999,
    description: "Incredible performance wrapped in a sleek metallic silver finish. Built for the modern creator.",
    image: "/images/phone2.png",
    screen: "6.7\" AMOLED",
    processor: "Aether Silicon M1",
    ram: "12GB",
    storage: "256GB",
  },
];
