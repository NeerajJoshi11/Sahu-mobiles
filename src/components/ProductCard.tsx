"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

import { motion } from "framer-motion";

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className={styles.card}
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
    >
      <Link href={`/product/${product.id}`} className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
          />
        </div>
      </Link>
      
      <div className={styles.content}>
        <Link href={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>
        <p className={styles.price}>₹{product.price.toLocaleString()}</p>
        
        <div className={styles.specs}>
          <span className={styles.specItem}>{product.ram}</span>
          <span className={styles.specItem}>{product.storage}</span>
        </div>
        
        <button 
          className={`btn btn-primary ${styles.addToCartBtn}`}
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
