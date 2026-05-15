"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import styles from "./CartDrawer.module.css";
import { useEffect, useState } from "react";
import { PincodeCheckerModal } from "./PincodeCheckerModal";

export function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    updateQuantity, 
    removeFromCart, 
    cartTotal,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string, isError: boolean } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const result = await applyCoupon(couponCode);
    setCouponMessage({ text: result.message, isError: !result.success });
    if (result.success) {
      setCouponCode("");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!mounted) return null;

  return (
    <>
      <div 
        className={`${styles.backdrop} ${isCartOpen ? styles.open : ""}`} 
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button 
            className={styles.closeBtn} 
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <p>Your cart is empty</p>
              <button 
                className="btn btn-outline" 
                onClick={() => setIsCartOpen(false)}
                style={{ marginTop: "1rem" }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item, index) => (
                <li key={`${item.id}-${item.selectedColor}-${item.selectedVariant}-${index}`} className={styles.item}>
                  <div className={styles.itemImageContainer}>
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      sizes="80px"
                      className={styles.itemImage}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    {item.selectedColor && (
                      <p className={styles.itemOption}>Color: <strong>{item.selectedColor}</strong></p>
                    )}
                    {item.selectedVariant && (
                      <p className={styles.itemOption}>Variant: <strong>{item.selectedVariant}</strong></p>
                    )}
                    <p className={styles.itemPrice}>₹{item.price.toLocaleString()}</p>
                    <div className={styles.quantityControls}>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor, item.selectedVariant)}
                      >
                        -
                      </button>
                      <span className={styles.qtySpan}>{item.quantity}</span>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor, item.selectedVariant)}
                      >
                        +
                      </button>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedVariant)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.couponSection}>
            <div className={styles.couponHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              <span>Have a coupon?</span>
            </div>
            {!appliedCoupon ? (
              <div className={styles.couponInputGroup}>
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={styles.couponInput}
                />
                <button 
                  onClick={handleApplyCoupon}
                  className={styles.couponApplyBtn}
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className={styles.activeCoupon}>
                <span className={styles.couponBadge}>{appliedCoupon}</span>
                <span className={styles.couponSuccess}>Applied!</span>
                <button onClick={removeCoupon} className={styles.removeCouponBtn}>Remove</button>
              </div>
            )}
            {couponMessage && (
              <p className={`${styles.couponMessage} ${couponMessage.isError ? styles.error : styles.success}`}>
                {couponMessage.text}
              </p>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.label}>Subtotal</span>
              <span className={styles.value}>₹{cartTotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className={styles.totalRow + " " + styles.discountRow}>
                <span className={styles.label}>Discount</span>
                <span className={styles.value}>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className={styles.totalRow + " " + styles.grandTotal}>
              <span className={styles.label}>Final Total</span>
              <span className={styles.value}>₹{(cartTotal - discountAmount).toLocaleString()}</span>
            </div>
            <button
              className={`btn btn-outline`}
              onClick={() => setIsPincodeModalOpen(true)}
              style={{ width: "100%", marginBottom: "1rem" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Check Delivery
            </button>
            <Link 
              href="/checkout" 
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={() => setIsCartOpen(false)}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
      
      <PincodeCheckerModal 
        isOpen={isPincodeModalOpen} 
        onClose={() => setIsPincodeModalOpen(false)} 
      />
    </>
  );
}
