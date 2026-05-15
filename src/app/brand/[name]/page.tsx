"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import styles from "./page.module.css";

const brandKeywords: Record<string, string[]> = {
  "apple": ["apple", "iphone", "ipad", "macbook", "airpods", "watch"],
  "samsung": ["samsung", "galaxy"],
  "mi": ["mi", "redmi", "xiaomi", "poco"],
};

const brandThemes: Record<string, { primary: string; glow: string; textGradient: string }> = {
  "apple": { primary: "rgba(100, 100, 100, 0.2)", glow: "rgba(255, 255, 255, 0.2)", textGradient: "linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%)" },
  "samsung": { primary: "rgba(0, 114, 255, 0.2)", glow: "rgba(0, 114, 255, 0.4)", textGradient: "linear-gradient(90deg, #ffffff 0%, #7db5ff 100%)" },
  "mi": { primary: "rgba(255, 103, 0, 0.2)", glow: "rgba(255, 103, 0, 0.4)", textGradient: "linear-gradient(90deg, #ffffff 0%, #ffad6b 100%)" },
  "vivo": { primary: "rgba(65, 105, 225, 0.2)", glow: "rgba(65, 105, 225, 0.4)", textGradient: "linear-gradient(90deg, #ffffff 0%, #8cafff 100%)" },
  "oppo": { primary: "rgba(0, 175, 80, 0.2)", glow: "rgba(0, 175, 80, 0.4)", textGradient: "linear-gradient(90deg, #ffffff 0%, #6beb9e 100%)" },
  "realme": { primary: "rgba(255, 190, 0, 0.2)", glow: "rgba(255, 190, 0, 0.4)", textGradient: "linear-gradient(90deg, #ffffff 0%, #ffde6b 100%)" },
  "default": { primary: "rgba(100, 100, 100, 0.1)", glow: "rgba(255, 255, 255, 0.1)", textGradient: "linear-gradient(90deg, #ffffff 0%, #a3a3a3 100%)" }
};


export default function BrandPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name).toLowerCase();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const keywords = brandKeywords[decodedName] || [decodedName];

  const brandProducts = products.filter(product => {
    const productName = product.name.toLowerCase();
    const productDesc = product.description.toLowerCase();
    
    return keywords.some((kw: string) => {
      // Use word boundaries to prevent matching "mi" inside "premium" or "dynamic"
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(productName) || regex.test(productDesc);
    });
  });

  // Capitalize first letter for display, or handle specific capitalizations
  const displayBrand = decodedName === "mi" ? "Mi" : decodedName === "vivo" ? "VIVO" : decodedName === "oppo" ? "Oppo" : decodedName === "realme" ? "Realme" : decodedName.charAt(0).toUpperCase() + decodedName.slice(1);

  const theme = brandThemes[decodedName] || brandThemes["default"];

  return (
    <div 
      className={styles.page} 
      style={{
        "--brand-primary": theme.primary,
        "--brand-glow": theme.glow,
        "--brand-text-gradient": theme.textGradient
      } as React.CSSProperties}
    >
      <div className={styles.brandHeaderWrapper}>
        <div className={styles.brandHeaderGlow} />
        <div className={styles.brandHeader}>
          <motion.h1 
            className={styles.brandTitle}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {displayBrand}
          </motion.h1>
          <motion.p 
            className={styles.brandSubtitle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 20 }}
          >
            Discover the latest premium devices from {displayBrand}.
          </motion.p>
        </div>
      </div>

      <div className="container">
        {!mounted || loading ? (
          <div className={styles.productGrid}>
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : brandProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.noResults}
          >
            <p>No products found for {displayBrand} at the moment. Check back soon!</p>
          </motion.div>
        ) : (
          <motion.div 
            className={styles.productGrid}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            } as Variants}
          >
            <AnimatePresence mode="popLayout">
              {brandProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
