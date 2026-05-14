import React from "react";
import styles from "./ProductSkeleton.module.css";

export function ProductSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.imagePlaceholder} />
      <div className={styles.content}>
        <div className={styles.titlePlaceholder} />
        <div className={styles.pricePlaceholder} />
        <div className={styles.specsPlaceholder}>
          <div className={styles.specPlaceholder} />
          <div className={styles.specPlaceholder} />
          <div className={styles.specPlaceholder} />
        </div>
        <div className={styles.buttonPlaceholder} />
      </div>
    </div>
  );
}
