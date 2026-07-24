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
    appliedCouponDescription,
    discountAmount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string, isError: boolean } | null>(null);

  const buildWhatsAppCartLink = () => {
    const itemLines = items.map((item) => {
      const optionDetails = [];
      if (item.selectedColor) optionDetails.push(`Color: ${item.selectedColor}`);
      if (item.selectedVariant) optionDetails.push(`Variant: ${item.selectedVariant}`);
      const optionsStr = optionDetails.length > 0 ? ` (${optionDetails.join(", ")})` : "";
      return `- *${item.name}* x${item.quantity}${optionsStr} (₹${item.price.toLocaleString()})`;
    });

    const message = `Hello Sahu Mobiles, I have these items in my cart and would like to negotiate a bundle discount:\n\n` +
      `🛒 *Items:*\n${itemLines.join("\n")}\n\n` +
      `💰 *Total Cart Value:* ₹${cartTotal.toLocaleString()}\n\n` +
      `Can we agree on a negotiated bundle price for this order? Thanks!`;

    return `https://wa.me/919792967002?text=${encodeURIComponent(message)}`;
  };

  const whatsappCartLink = buildWhatsAppCartLink();

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
              <div className={styles.activeCouponContainer}>
                <div className={styles.activeCoupon}>
                  <span className={styles.couponBadge}>{appliedCoupon}</span>
                  <span className={styles.couponSuccess}>Applied!</span>
                  <button onClick={removeCoupon} className={styles.removeCouponBtn}>Remove</button>
                </div>
                {appliedCouponDescription && (
                  <p className={styles.activeCouponDesc}>
                    {appliedCouponDescription}
                  </p>
                )}
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
            <a 
              href={whatsappCartLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.whatsappBargainCartBtn}
            >
              <svg className={styles.whatsappIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Bargain on WhatsApp 🤝
            </a>
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
