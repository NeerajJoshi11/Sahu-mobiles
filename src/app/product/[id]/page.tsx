import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/AddToCartButton";
import { MotionFadeIn, MotionSlideIn } from "@/components/MotionWrapper";
import styles from "./page.module.css";

import { ProductSEO } from "@/components/ProductSEO";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className={`container ${styles.page}`}>
      <ProductSEO product={product} />
      <div className={styles.grid}>
        <MotionFadeIn className={styles.imageGallery}>
          <div className={styles.mainImageContainer}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className={styles.mainImage}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </MotionFadeIn>

        <MotionSlideIn className={styles.details} delay={0.2}>
          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.pricingSection}>
            <div className={styles.priceRow}>
              <p className={styles.price}>₹{product.price.toLocaleString()}</p>
              {product.mrp && product.mrp > product.price && (
                <>
                  <p className={styles.mrp}>₹{product.mrp.toLocaleString()}</p>
                  <div className={styles.discountBadge}>
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </div>
                </>
              )}
            </div>
            {product.mrp && product.mrp > product.price && (
              <p className={styles.savings}>
                You save: ₹{(product.mrp - product.price).toLocaleString()}
              </p>
            )}
          </div>

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
                <dd>{product.ram}</dd>
              </div>
              <div className={styles.specItem}>
                <dt>Storage</dt>
                <dd>{product.storage}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.actions}>
            <AddToCartButton product={product} />
          </div>
        </MotionSlideIn>
      </div>
    </div>
  );
}
