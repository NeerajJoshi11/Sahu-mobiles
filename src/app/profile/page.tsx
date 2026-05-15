"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        
        if (!userData.user) {
          router.push("/register");
          return;
        }
        setUser(userData.user);

        // Fetch user orders
        const ordersRes = await fetch("/api/user/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return <div className={styles.loading}>Loading your profile...</div>;
  }

  return (
    <div className={`container ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Profile</h1>
        <p className={styles.subtitle}>Manage your account and track your orders.</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Account Details</h2>
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Full Name</span>
              <span className={styles.value}>{user.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Email Address</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Phone Number</span>
              <span className={styles.value}>+91 {user.phone}</span>
            </div>
          </div>
        </section>

        <section className={styles.ordersSection}>
          <h2 className={styles.cardTitle}>Order History</h2>
          {orders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <p>You haven't placed any orders yet.</p>
              <button onClick={() => router.push("/")} className="btn btn-primary">Start Shopping</button>
            </div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>Order #{order.id.slice(-8)}</span>
                      <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </div>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderTotal}>Total: ₹{order.total.toLocaleString()}</span>
                        <span className={styles.paymentMethod}>
                          {order.paymentMethod === 'WHATSAPP' ? '📱 WhatsApp' : 
                           order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                        </span>
                        <span className={styles.deliveryMethod}>
                          {order.deliveryMethod === 'EXPRESS' ? '⚡ 2-Hour' : '📦 Standard'}
                        </span>
                      </div>
                      <button className={styles.viewBtn} onClick={() => router.push(`/profile/orders/${order.id}`)}>View Details</button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
