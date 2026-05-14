"use client";

import { useCart, Product } from "@/context/CartContext";

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <button 
      className="btn btn-primary"
      style={{ width: "100%", padding: "1rem", fontSize: "1.125rem" }}
      onClick={() => addToCart(product)}
    >
      Add to Cart - ₹{product.price.toLocaleString()}
    </button>
  );
}
