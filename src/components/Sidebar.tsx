"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const fetchUser = () => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setUser(data.user));
  };

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  const categories = [
    { name: "Smartphones", id: "Smartphone" },
    { name: "Tablets", id: "Tablet" },
    { name: "Accessories", id: "Accessories" }
  ];

  const brands = [
    "Apple",
    "Samsung",
    "VIVO",
    "Realme",
    "Oppo",
    "Motorola",
    "Mi"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose}>
          <motion.div
            className={styles.sidebar}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <Link href="/" className={styles.logo} onClick={onClose}>
                SAHU MOBILES
              </Link>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Categories</h3>
                <ul className={styles.navList}>
                  {categories.map((cat) => (
                    <li key={cat.name}>
                      <Link href={`/?category=${cat.id}`} className={styles.navItem} onClick={onClose}>
                        <span>{cat.name}</span>
                        <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Top Brands</h3>
                <ul className={styles.navList}>
                  {brands.map((brand) => (
                    <li key={brand}>
                      <Link href={`/brand/${brand.toLowerCase()}`} className={styles.navItem} onClick={onClose}>
                        <span>{brand}</span>
                        <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Account</h3>
                {mounted && (
                  user ? (
                    <div className={styles.accountBox}>
                      <div className={styles.accountHeader}>
                        <div className={styles.avatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>Hi, {user.name.split(' ')[0]}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </div>
                      <div className={styles.accountActions}>
                        <Link href="/profile" className={styles.navItem} onClick={onClose} style={{ padding: "0.5rem 0" }}>
                          <span>Profile</span>
                        </Link>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link href="/register" className={styles.signInBtn} onClick={onClose}>
                      Sign In / Register
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className={styles.footer}>
              &copy; {new Date().getFullYear()} Sahu Mobiles
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
