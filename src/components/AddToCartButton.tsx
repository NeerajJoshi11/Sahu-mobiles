"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, Product } from "@/context/CartContext";

export function AddToCartButton({ product, className }: { product: Product, className?: string }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.button 
      className={className || `btn ${isAdded ? 'btn-success' : 'btn-primary'}`}
      style={{ 
        width: "100%", 
        padding: "1rem", 
        fontSize: "1.125rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem"
      }}
      onClick={handleAddToCart}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isAdded ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Added to Cart
          </motion.span>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Add to Cart - ₹{product.price.toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
