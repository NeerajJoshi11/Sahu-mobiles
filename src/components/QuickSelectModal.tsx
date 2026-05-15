"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Product, useCart } from "@/context/CartContext";
import styles from "./QuickSelectModal.module.css";

interface QuickSelectModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSelectModal({ product, isOpen, onClose }: QuickSelectModalProps) {
  const { addToCart } = useCart();
  
  // Get initial values
  const variants = (product as any).variants || [];
  const initialColor = product.colorName || (variants.length > 0 ? variants[0].colorName : null) || "Standard";
  
  const [selectedColor, setSelectedColor] = useState<string | null>(initialColor);
  const [selectedVariant, setSelectedVariant] = useState<any>(
    variants.length > 0 ? variants[0] : null
  );

  // Group variants by color
  const colorGroups = useMemo(() => {
    return variants.reduce((acc: any, variant: any) => {
      const color = variant.colorName || "Standard";
      if (!acc[color]) {
        acc[color] = {
          name: color,
          code: variant.colorCode || "#808080",
          variants: []
        };
      }
      acc[color].variants.push(variant);
      return acc;
    }, {});
  }, [variants]);

  const colors = Object.values(colorGroups);
  const availableConfigs = selectedColor ? colorGroups[selectedColor]?.variants || [] : [];

  // Sync variant when color changes
  useEffect(() => {
    if (selectedColor && selectedVariant?.colorName !== selectedColor) {
      const firstInColor = colorGroups[selectedColor]?.variants[0];
      if (firstInColor) setSelectedVariant(firstInColor);
    }
  }, [selectedColor, colorGroups, selectedVariant]);

  const handleConfirm = () => {
    const productForCart = {
      ...product,
      price: selectedVariant ? selectedVariant.price : product.price,
      mrp: selectedVariant ? selectedVariant.mrp : product.mrp,
      image: selectedVariant?.image || product.image,
      ram: selectedVariant?.ram || product.ram,
      storage: selectedVariant?.storage || product.storage,
      selectedColor: selectedColor || undefined,
      selectedVariant: selectedVariant ? `${selectedVariant.ram} / ${selectedVariant.storage}` : undefined,
    };
    
    addToCart(productForCart);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose}>
          <motion.div 
            className={styles.modal} 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button className={styles.closeBtn} onClick={onClose}>×</button>
            
            <div className={styles.header}>
              <div className={styles.imageContainer}>
                <Image 
                  src={selectedVariant?.image || product.image} 
                  alt={product.name} 
                  fill 
                  className={styles.image}
                />
              </div>
              <div className={styles.info}>
                <h3>{product.name}</h3>
                <p className={styles.price}>₹{(selectedVariant?.price || product.price).toLocaleString()}</p>
              </div>
            </div>

            <div className={styles.options}>
              {colors.length > 0 && (
                <div className={styles.optionGroup}>
                  <label>Select Color: <span>{selectedColor}</span></label>
                  <div className={styles.chipGrid}>
                    {colors.map((color: any) => (
                      <button
                        key={color.name}
                        className={`${styles.colorChip} ${selectedColor === color.name ? styles.active : ""}`}
                        onClick={() => setSelectedColor(color.name)}
                      >
                        <div className={styles.colorPreview} style={{ backgroundColor: color.code }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableConfigs.length > 0 && (
                <div className={styles.optionGroup}>
                  <label>Select Storage:</label>
                  <div className={styles.chipGrid}>
                    {availableConfigs.map((v: any) => (
                      <button
                        key={v.id}
                        className={`${styles.variantChip} ${selectedVariant?.id === v.id ? styles.active : ""}`}
                        onClick={() => setSelectedVariant(v)}
                      >
                        {v.ram} / {v.storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className={styles.confirmBtn} onClick={handleConfirm}>
              Add to Cart
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
