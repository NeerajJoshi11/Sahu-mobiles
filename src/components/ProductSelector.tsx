"use client";

import { useState, useEffect } from "react";
import styles from "./ProductSelector.module.css";
import { AddToCartButton } from "./AddToCartButton";

interface Variant {
  id: string;
  ram: string;
  storage: string;
  price: number;
  mrp?: number | null;
  stock: number;
  colorName?: string | null;
  colorCode?: string | null;
  image?: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number | null;
  description: string;
  image: string;
  screen: string;
  processor: string;
  ram: string;
  storage: string;
  stock: number;
  colorName?: string | null;
  colorCode?: string | null;
  hasVariants?: boolean;
  variants?: Variant[];
}
interface ProductSelectorProps {
  product: Product;
  isSticky?: boolean;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  selectedVariant: Variant | null;
  setSelectedVariant: (variant: Variant | null) => void;
  onImageChange?: (image: string) => void;
}

export function ProductSelector({ 
  product, 
  isSticky, 
  selectedColor, 
  setSelectedColor, 
  selectedVariant, 
  setSelectedVariant, 
  onImageChange 
}: ProductSelectorProps) {

  // Group variants by color
  const colorGroups = product.variants?.reduce((acc, variant) => {
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
  }, {} as Record<string, { name: string, code: string, variants: Variant[] }>) || {};

  const colors = Object.values(colorGroups);
  
  // If no variants, we might still have a primary color
  const displayColor = selectedVariant?.colorName || selectedColor || product.colorName || "Standard";

  const availableConfigs = selectedColor ? colorGroups[selectedColor]?.variants || [] : [];

  useEffect(() => {
    // Notify parent of image change whenever the selected variant changes
    const newImage = selectedVariant?.image || product.image;
    if (onImageChange && newImage) {
      onImageChange(newImage);
    }
  }, [selectedVariant, onImageChange, product.image]);

  // Sync pricing
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentImage = selectedVariant?.image || product.image;

  const productForCart = {
    ...product,
    price: currentPrice,
    mrp: currentMrp,
    image: currentImage,
    ram: selectedVariant?.ram || product.ram,
    storage: selectedVariant?.storage || product.storage,
    selectedColor: displayColor,
    selectedVariant: selectedVariant ? `${selectedVariant.ram} / ${selectedVariant.storage}` : undefined,
  };

  if (isSticky) {
    return (
      <div className={styles.stickyContainer}>
        <div className={styles.stickyInfo}>
          <p className={styles.stickyPrice}>₹{currentPrice.toLocaleString()}</p>
          <p className={styles.stickyOption}>
            {displayColor} • {selectedVariant ? `${selectedVariant.ram}/${selectedVariant.storage}` : `${product.ram}/${product.storage}`}
          </p>
        </div>
        <AddToCartButton product={productForCart} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Pricing Sync */}

      {/* 1. Color Selection (Internal to product) */}
      {colors.length > 1 && (
        <div className={styles.optionGroup}>
          <h4 className={styles.optionLabel}>COLOR: <span>{displayColor.toUpperCase()}</span></h4>
          <div className={styles.colorGrid}>
            {colors.map((color) => (
              <button
                key={color.name}
                className={`${styles.colorChip} ${selectedColor === color.name ? styles.activeColor : ""}`}
                onClick={() => setSelectedColor(color.name)}
              >
                <div className={styles.colorPreview} style={{ backgroundColor: color.code }} />
                <span className={styles.colorName}>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Configuration Selection */}
      {availableConfigs.length > 0 && (
        <div className={styles.optionGroup}>
          <h4 className={styles.optionLabel}>STORAGE:</h4>
          <div className={styles.variantGrid}>
            {availableConfigs.map((variant) => {
              const variantDiscount = variant.mrp && variant.price ? 
                Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0;
                
              return (
                <button
                  key={variant.id}
                  className={`${styles.variantChip} ${selectedVariant?.id === variant.id ? styles.activeVariant : ""}`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <div className={styles.variantMain}>
                    <span className={styles.variantName}>{variant.ram} / {variant.storage}</span>
                    <span className={styles.variantPrice}>₹{variant.price.toLocaleString()}</span>
                  </div>
                  {variantDiscount > 0 && (
                    <span className={styles.variantDiscount}>{variantDiscount}% OFF</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Sync moved below variants */}
      <div className={styles.priceSection} style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <div className={styles.priceRow}>
          <div className={styles.mainPriceContainer}>
            <span className={styles.mainPrice}>₹{currentPrice.toLocaleString()}</span>
            {currentMrp && currentMrp > currentPrice && (
              <span className={styles.discountBadge}>
                {Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF
              </span>
            )}
          </div>
          {currentMrp && currentMrp > currentPrice && (
            <span className={styles.mainMrp}>₹{currentMrp.toLocaleString()}</span>
          )}
        </div>
        {currentStock <= 0 ? (
          <span className={styles.outOfStock}>Out of Stock</span>
        ) : currentStock < 5 ? (
          <span className={styles.lowStock}>Only {currentStock} left!</span>
        ) : null}
      </div>

      <div className={styles.actions}>
        <AddToCartButton product={productForCart} />
      </div>
    </div>
  );
}
