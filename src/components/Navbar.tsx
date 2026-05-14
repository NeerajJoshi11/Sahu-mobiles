"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsDropdownOpen(false);
    window.location.reload();
  };

  // Close dropdown when clicking outside (simple version)
  useEffect(() => {
    const handleClick = () => setIsDropdownOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Hide Navbar on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          SAHU MOBILES
        </Link>
        
        <div className={styles.navLinks}>
          {!mounted ? null : user ? (
            <div className={styles.userMenu} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.userToggle} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Hi, {user.name.split(' ')[0]}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDropdownOpen ? styles.rotate : ""}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className={styles.dropdown}>
                  <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/register" className={styles.authLink}>
              Sign In
            </Link>
          )}
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
  );
}
