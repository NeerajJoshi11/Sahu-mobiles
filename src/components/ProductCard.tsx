"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { QuickSelectModal } from "./QuickSelectModal";

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);
  const { addToCart } = useCart();

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      } 
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent touch events from bubbling up and getting swallowed
    
    if (product.hasVariants) {
      setIsQuickSelectOpen(true);
    } else {
      addToCart(product); // Add directly to cart if no variants
    }
  };

  return (
    <motion.div 
      className={styles.card}
      variants={itemVariants}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.25)" 
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/product/${product.id}`} className={styles.imageContainer}>
        {product.mrp && product.mrp > product.price && (
          <div className={styles.discountBadge}>
            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
          </div>
        )}
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
            priority={false}
          />
        </div>
      </Link>
      
      <div className={styles.content}>
        <Link href={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>
        <div className={styles.priceContainer}>
          <p className={styles.price}>
            {product.hasVariants && <span className={styles.startsFrom}>Starts from </span>}
            ₹{product.price.toLocaleString()}
          </p>
          {product.mrp && product.mrp > product.price && (
            <p className={styles.mrp}>₹{product.mrp.toLocaleString()}</p>
          )}
        </div>
        
        <div className={styles.specs}>
          <span className={styles.specItem}>{product.ram}</span>
          <span className={styles.specItem}>{product.storage}</span>
        </div>
        
        <motion.button 
          className={`btn btn-primary ${styles.addToCartBtn}`}
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
        >
          Add to Cart
        </motion.button>
      </div>

      <QuickSelectModal 
        product={product}
        isOpen={isQuickSelectOpen}
        onClose={() => setIsQuickSelectOpen(false)}
      />
    </motion.div>
  );
}
