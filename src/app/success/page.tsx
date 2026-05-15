"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import styles from "./page.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // We can't use the admin API, so we'll use a new public order fetch API or just rely on the summary
      // For now, let's try to fetch from the user orders API
      fetch("/api/user/orders")
        .then(res => res.json())
        .then(data => {
          const found = data.orders?.find((o: any) => o.id === orderId);
          if (found) setOrder(found);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h1 className={styles.title}>Order Placed!</h1>
        
        <div className={styles.orderBadge}>
          {orderId ? `Order ID: #${orderId.slice(-8).toUpperCase()}` : "Order Successful"}
        </div>

        <p className={styles.description}>
          Thank you for choosing Sahu Mobiles. We've received your order and are currently processing it.
        </p>

        {order && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Status:</span>
              <span className={styles.statusBadge}>{order.status}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Amount:</span>
              <span className={styles.totalAmount}>₹{order.total?.toLocaleString()}</span>
            </div>
            <div className={styles.productNames}>
              {order.items?.map((item: any) => (
                <div key={item.id} className={styles.productItem}>
                  {item.product?.name} <span className={styles.qty}>x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryRow}>
              <span>Payment:</span>
              <span>{order.paymentMethod === 'WHATSAPP' ? 'WhatsApp Link' : order.paymentMethod}</span>
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <div className={styles.infoItem}>
            <strong>Next Steps:</strong>
            <p>You can track your order status in your profile dashboard.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/profile" className="btn btn-outline">
            View Order History
          </Link>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
