"use client";

import { useState } from "react";
import styles from "./PincodeCheckerModal.module.css";

interface PincodeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PincodeCheckerModal({ isOpen, onClose }: PincodeCheckerModalProps) {
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setError("Please enter a valid 6-digit Indian pincode.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/shiprocket/serviceability?pincode=${pincode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check pincode");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Check Delivery Availability</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <form onSubmit={handleCheck} className={styles.form}>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={styles.input}
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.checkBtn}`} disabled={isLoading}>
              {isLoading ? "Checking..." : "Check"}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          {result && (
            <div className={styles.resultContainer}>
              {result.available_courier_companies?.length > 0 ? (
                <div className={styles.success}>
                  <p className={styles.successMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Delivery is available to {pincode}!
                  </p>
                  <div className={styles.deliveryDetails}>
                    <p style={{ margin: 0, color: "var(--foreground)", fontWeight: 500, lineHeight: 1.5 }}>
                      Great news! 🎉 We deliver right to your doorstep in this area. Get ready to experience the future!
                    </p>
                  </div>
                </div>
              ) : (
                <div className={styles.unserviceable}>
                  <p className={styles.unserviceableMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    Sorry, delivery is not available for this pincode.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
