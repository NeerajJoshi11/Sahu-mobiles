"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newsletter } from "./Newsletter";
import styles from "./Footer.module.css";

export function Footer() {
  const pathname = usePathname();

  // Hide Footer on admin and auth pages
  if (pathname?.startsWith("/admin") || pathname === "/register") return null;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <Newsletter />
      </div>
      
      <div className={`container ${styles.footerContent}`} style={{ marginTop: '3rem' }}>
        <div className={styles.brandSection}>
          <h2 className={styles.brandName}>Sahu Mobiles</h2>
          <p className={styles.brandDesc}>
            Your Trusted Destination for Premium Technology in Amethi.
          </p>
        </div>

        <div className={styles.linksSection}>
          <h3 className={styles.sectionTitle}>Quick Links</h3>
          <ul className={styles.linksList}>
            <li>
              <Link href="/" className={styles.link}>Home</Link>
            </li>
            <li>
              <Link href="/about" className={styles.link}>About Us</Link>
            </li>
            <li>
              <Link href="/contact" className={styles.link}>Contact Us</Link>
            </li>
            <li>
              <Link href="/register" className={styles.link}>Sign In / Register</Link>
            </li>
          </ul>
        </div>

        <div className={styles.contactSection}>
          <h3 className={styles.sectionTitle}>Contact Info</h3>
          <ul className={styles.contactList}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Ramganj, Amethi</span>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+91 9792967002</span>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Care@sahumobilewala.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Sahu Mobiles. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
