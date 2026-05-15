"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ColorLinker.module.css";

interface Sibling {
  id: string;
  image: string;
  colorName: string | null;
  colorCode: string | null;
}

interface ColorLinkerProps {
  currentProductId: string;
  modelId: string;
}

export function ColorLinker({ currentProductId, modelId }: ColorLinkerProps) {
  const [uniqueColors, setUniqueColors] = useState<Sibling[]>([]);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  useEffect(() => {
    // Fetch all products in this model family
    fetch(`/api/products?modelId=${modelId}`)
      .then(res => res.json())
      .then(data => {
        // 1. Find the current product to show its details
        const thisProduct = data.find((p: any) => p.id === currentProductId);
        setCurrentProduct(thisProduct);

        // Group by colorName
        const colorMap = new Map<string, Sibling>();
        
        data.forEach((p: any) => {
          // Use product color or fallback to first variant color
          const pColor = p.colorName || (p.variants && p.variants[0]?.colorName);
          const pCode = p.colorCode || (p.variants && p.variants[0]?.colorCode);
          
          if (!pColor) return;
          
          if (!colorMap.has(pColor) || p.id === currentProductId) {
            colorMap.set(pColor, {
              id: p.id,
              image: p.image,
              colorName: pColor,
              colorCode: pCode
            });
          }
        });

        setUniqueColors(Array.from(colorMap.values()));
      });
  }, [currentProductId, modelId]);

  const displayColorName = currentProduct?.colorName || (currentProduct?.variants && currentProduct?.variants[0]?.colorName) || "Default";

  if (!currentProduct && uniqueColors.length <= 1) return null;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>
        COLOR: <span>{displayColorName.toUpperCase()}</span>
      </h4>
      <div className={styles.grid}>
        {uniqueColors.map((color) => {
          const isActive = color.id === currentProductId;
          
          if (isActive) {
            return (
              <div key={color.id} className={`${styles.swatch} ${styles.active}`}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={color.image} 
                    alt={color.colorName || "Current color"} 
                    fill 
                    sizes="60px"
                  />
                </div>
                <div 
                  className={styles.colorIndicator} 
                  style={{ backgroundColor: color.colorCode || "#808080" }} 
                />
              </div>
            );
          }

          return (
            <Link 
              key={color.id} 
              href={`/product/${color.id}`}
              className={styles.swatch}
            >
              <div className={styles.imageWrapper}>
                <Image 
                  src={color.image} 
                  alt={color.colorName || "Color option"} 
                  fill 
                  sizes="60px"
                />
              </div>
              <div 
                className={styles.colorIndicator} 
                style={{ backgroundColor: color.colorCode || "#808080" }} 
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
