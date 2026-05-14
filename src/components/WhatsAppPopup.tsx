"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./WhatsAppPopup.module.css";

export function WhatsAppPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const pathname = usePathname();

  // User's WhatsApp number (using country code 91 for India based on standard patterns)
  const whatsappNumber = "919792967002";
  const message = "Hi! I'm interested in buying a premium smartphone.";

  useEffect(() => {
    // Check if user has previously dismissed the popup in this session
    const dismissed = sessionStorage.getItem("wa_popup_dismissed");
    if (dismissed) {
      setHasDismissed(true);
      return;
    }

    // Show popup after 3 seconds of landing
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);
    sessionStorage.setItem("wa_popup_dismissed", "true");
  };

  // Hide on admin and auth pages
  if (pathname?.startsWith("/admin") || pathname === "/register" || pathname === "/login") return null;


  if (hasDismissed && !isOpen) {
    // Once dismissed, show a persistent small chat bubble instead of the full popup
    return (
      <a 
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingBubble}
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </a>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.avatar}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className={styles.title}>Sahu Mobiles</h3>
              <p className={styles.status}>Typically replies instantly</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close popup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.message}>
            <p>Hi there! 👋</p>
            <p>Looking for a new phone or need help with your order? Chat with us directly on WhatsApp!</p>
          </div>
        </div>
        
        <div className={styles.footer}>
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
            onClick={handleClose} // Auto-dismiss main popup if they click to chat
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
