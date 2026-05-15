"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { ProductSelector } from "@/components/ProductSelector";
import { ColorLinker } from "@/components/ColorLinker";
import { MotionSlideIn, MotionFadeIn } from "@/components/MotionWrapper";

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
  category: string;
  stock: number;
  modelId?: string | null;
  colorName?: string | null;
  colorCode?: string | null;
  hasVariants?: boolean;
  variants: any[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [displayImage, setDisplayImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.image) setDisplayImage(data.image);
        
        // Set initial selection
        const initialColor = data.colorName || (data.variants && data.variants.length > 0 ? data.variants[0].colorName : null) || null;
        setSelectedColor(initialColor);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      });
  }, [id]);

  // Sync variant when color changes
  useEffect(() => {
    if (!product || !selectedColor) return;
    
    if (selectedVariant?.colorName !== selectedColor) {
      const variantsInColor = product.variants?.filter((v: any) => 
        (v.colorName || "Standard") === selectedColor
      );
      if (variantsInColor && variantsInColor.length > 0) {
        setSelectedVariant(variantsInColor[0]);
      }
    }
  }, [selectedColor, product, selectedVariant]);

  if (!product) return <div className="container py-20 text-center">Loading product...</div>;

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.grid}>
          <MotionFadeIn className={styles.imageGallery}>
            <div className={styles.mainImageContainer}>
              <Image
                src={displayImage || product.image}
                alt={product.name}
                fill
                className={styles.mainImage}
                priority
              />
            </div>
          </MotionFadeIn>

          <MotionSlideIn className={styles.details} delay={0.2}>
            <h1 className={styles.title}>{product.name}</h1>
            
            <p className={styles.description}>{product.description}</p>

            <div className={styles.specs}>
              <h3 className={styles.specsTitle}>Technical Specifications</h3>
              <dl className={styles.specsList}>
                <div className={styles.specItem}>
                  <dt>Processor</dt>
                  <dd>{product.processor}</dd>
                </div>
                <div className={styles.specItem}>
                  <dt>Display</dt>
                  <dd>{product.screen}</dd>
                </div>
                <div className={styles.specItem}>
                  <dt>Memory</dt>
                  <dd>{product.ram} / {product.storage}</dd>
                </div>
              </dl>
            </div>

            <ProductSelector 
              product={product} 
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              onImageChange={setDisplayImage} 
            />
          </MotionSlideIn>
        </div>
      </div>

      <div className={styles.stickyMobileActions}>
        <ProductSelector 
          product={product} 
          isSticky 
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          onImageChange={setDisplayImage} 
        />
      </div>
    </main>
  );
}
