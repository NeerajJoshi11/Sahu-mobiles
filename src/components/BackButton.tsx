"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./BackButton.module.css";

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show back button on the home page, admin pages, or auth pages
  if (pathname === "/" || pathname?.startsWith("/admin") || pathname === "/register") return null;

  return (
    <div className="container">
      <button 
        className={styles.backButton} 
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Back</span>
      </button>
    </div>
  );
}
