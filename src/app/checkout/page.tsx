"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

// Declare Razorpay on window for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart, discountAmount, appliedCoupon } = useCart();
  const finalTotal = cartTotal - discountAmount;
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    deliveryMethod: "STANDARD",
  });

  const [paymentMethod, setPaymentMethod] = useState("WHATSAPP"); // WHATSAPP or COD
  const [expressPincodes, setExpressPincodes] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        const pincodeStr = data.settings?.find((s: any) => s.key === "express_pincodes")?.value || "";
        const pincodeList = pincodeStr.split(",").map((p: string) => p.trim()).filter((p: string) => p.length > 0);
        setExpressPincodes(pincodeList);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData({ ...formData, [name]: cleanedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation Check
    const requiredFields = ["email", "firstName", "lastName", "address", "city", "state", "pincode", "phone"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (formData.pincode.length < 6) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // 1. Create order on server via manual payment endpoint
      const orderRes = await fetch("/api/checkout/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentMethod,
          total: finalTotal,
          items: items.map(i => ({ 
            id: i.id, 
            name: i.name, 
            price: i.price, 
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedVariant: i.selectedVariant
          }))
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.error || "Failed to place order");

      if (paymentMethod === "WHATSAPP") {
        // Redirect to WhatsApp
        const message = `Hello Sahu Mobiles, I just placed an order!\n\n*Order ID:* ${orderData.orderId}\n*Total:* ₹${finalTotal.toLocaleString()}\n*Items:* ${items.map(i => `${i.name} (x${i.quantity})`).join(", ")}\n\nPlease send me the payment link. Thank you!`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919792967002?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab and then go to success page
        window.open(whatsappUrl, "_blank");
      }

      clearCart();
      router.push(`/success?orderId=${orderData.orderId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`container ${styles.page} ${styles.emptyState}`}>
        <h1>Your cart is empty</h1>
        <p>Add some products to your cart before checking out.</p>
        <button className="btn btn-primary" onClick={() => router.push("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Checkout</h1>
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.formSection}>
          <form onSubmit={handleCheckout} className={styles.form}>
            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <input 
                type="email" 
                name="email"
                placeholder="Email address" 
                required 
                className={styles.input} 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>
              <div className={styles.row}>
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="First name" 
                  required 
                  className={styles.input} 
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Last name" 
                  required 
                  className={styles.input} 
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <input 
                type="text" 
                name="address"
                placeholder="Address" 
                required 
                className={styles.input} 
                value={formData.address}
                onChange={handleInputChange}
              />
              <input 
                type="text" 
                name="city"
                placeholder="City" 
                required 
                className={styles.input} 
                value={formData.city}
                onChange={handleInputChange}
              />
              <div className={styles.row}>
                <input 
                  type="text" 
                  name="state"
                  placeholder="State" 
                  required 
                  className={styles.input} 
                  value={formData.state}
                  onChange={handleInputChange}
                />
                <input 
                  type="text" 
                  name="pincode"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="6-digit Pincode" 
                  required 
                  className={styles.input} 
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone number (10-digit)" 
                required 
                maxLength={10}
                className={styles.input} 
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Payment Method</h2>
              <div className={styles.deliveryOptions}>
                <label className={`${styles.deliveryOption} ${paymentMethod === "WHATSAPP" ? styles.selected : ""}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="WHATSAPP" 
                    checked={paymentMethod === "WHATSAPP"}
                    onChange={() => setPaymentMethod("WHATSAPP")}
                  />
                  <div className={styles.optionContent}>
                    <span className={styles.optionName}>📱 Pay via WhatsApp Link</span>
                    <span className={styles.optionDesc}>Get payment link in your DM</span>
                  </div>
                </label>
                <label className={`${styles.deliveryOption} ${paymentMethod === "COD" ? styles.selected : ""}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div className={styles.optionContent}>
                    <span className={styles.optionName}>💵 Cash on Delivery</span>
                    <span className={styles.optionDesc}>Pay when you receive your phone</span>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Delivery Options</h2>
              <div className={styles.deliveryOptions}>
                {expressPincodes.includes(formData.pincode.trim()) && (
                  <label className={`${styles.deliveryOption} ${formData.deliveryMethod === "EXPRESS" ? styles.selected : ""}`}>
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="EXPRESS" 
                      checked={formData.deliveryMethod === "EXPRESS"}
                      onChange={() => setFormData({ ...formData, deliveryMethod: "EXPRESS" })}
                    />
                    <div className={styles.optionContent}>
                      <span className={styles.optionName}>⚡ 2 Hour Delivery</span>
                      <span className={styles.optionDesc}>Available in your area! (Amethi Local)</span>
                    </div>
                  </label>
                )}
                <label className={`${styles.deliveryOption} ${formData.deliveryMethod === "STANDARD" ? styles.selected : ""}`}>
                  <input 
                    type="radio" 
                    name="deliveryMethod" 
                    value="STANDARD" 
                    checked={formData.deliveryMethod === "STANDARD"}
                    onChange={() => setFormData({ ...formData, deliveryMethod: "STANDARD" })}
                  />
                  <div className={styles.optionContent}>
                    <span className={styles.optionName}>📦 Shiprocket Standard</span>
                    <span className={styles.optionDesc}>Pan India Delivery (3-5 business days)</span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isProcessing}
            >
              {isProcessing ? "Opening Secure Payment..." : `Proceed to Pay ₹${finalTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          <div className={styles.summaryCard}>
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemImageContainer}>
                    <Image src={item.image} alt={item.name} fill sizes="60px" className={styles.itemImage} />
                  </div>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name} x {item.quantity}</span>
                    <span className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {discountAmount > 0 && (
                <div className={`${styles.totalRow} ${styles.discountRow}`}>
                  <span>Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
