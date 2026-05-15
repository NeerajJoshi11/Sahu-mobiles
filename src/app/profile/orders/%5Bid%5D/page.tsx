"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        const found = data.orders?.find((o: any) => o.id === orderId);
        if (found) {
          setOrder(found);
        } else {
          router.push("/profile");
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, router]);

  if (loading) return <div className={styles.loading}>Loading order details...</div>;
  if (!order) return null;

  return (
    <div className={`container ${styles.container}`}>
      <Link href="/profile" className={styles.backLink}>
        ← Back to Profile
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>Order Details</h1>
        <p className={styles.subtitle}>Order ID: #{order.id.toUpperCase()}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Order Items</h2>
            <div className={styles.itemsList}>
              {order.items?.map((item: any) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product?.name || "Product"}</span>
                    <span className={styles.itemMeta}>
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                      {item.selectedVariant && ` | ${item.selectedVariant}`}
                    </span>
                  </div>
                  <div className={styles.itemPrice}>
                    <span>{item.quantity} x ₹{item.price.toLocaleString()}</span>
                    <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span>Grand Total</span>
              <strong>₹{order.total.toLocaleString()}</strong>
            </div>
          </section>
        </div>

        <div className={styles.sidebar}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Order Status</h2>
            <div className={styles.statusBadge + " " + styles[order.status.toLowerCase()]}>
              {order.status}
            </div>
            <div className={styles.metaInfo}>
              <div className={styles.metaRow}>
                <span>Placed on:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Payment:</span>
                <span>{order.paymentMethod} ({order.paymentStatus})</span>
              </div>
              <div className={styles.metaRow}>
                <span>Delivery:</span>
                <span>{order.deliveryMethod}</span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Shipping Address</h2>
            <div className={styles.address}>
              <strong>{order.customerName}</strong>
              <p>{order.address}</p>
              <p>Pincode: {order.pincode}</p>
              <p>Phone: +91 {order.customerPhone}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
