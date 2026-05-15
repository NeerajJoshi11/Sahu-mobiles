"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { Sidebar } from "./Sidebar";

export function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide Navbar on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <nav className={styles.navbar}>
        <div className={`container ${styles.navContainer}`}>
          <div className={styles.leftNav}>
            <button 
              className={styles.hamburgerBtn}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <Link href="/" className={styles.logo}>
              SAHU MOBILES
            </Link>
          </div>
          
          <div className={styles.navLinks}>
          <button 
            className={styles.cartButton}
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {mounted && cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
    </>
  );
}
