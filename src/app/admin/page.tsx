export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { cookies } from "next/headers";

export default async function AdminDashboard() {
  // Get logged in admin info (username is enough for now)
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  
  // Fetch real stats
  const totalOrders = await prisma.order.count();
  const totalProducts = await prisma.product.count();
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Get unique customers from orders
  const uniqueCustomers = await prisma.order.groupBy({
    by: ['customerEmail', 'customerName'],
    _count: {
      id: true
    },
  });

  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
  });

  const stats = [
    { 
      label: "Total Revenue", 
      value: `₹${(totalRevenue._sum.total || 0).toLocaleString()}`, 
      change: "+0.0%", 
      icon: "💰" 
    },
    { 
      label: "Total Orders", 
      value: totalOrders.toString(), 
      change: "+0.0%", 
      icon: "📦" 
    },
    { 
      label: "Active Products", 
      value: totalProducts.toString(), 
      change: "+0.0%", 
      icon: "📱" 
    },
    { 
      label: "Unique Customers", 
      value: uniqueCustomers.length.toString(),
      change: "+0.0%", 
      icon: "👥" 
    },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Welcome back to Sahu Mobiles Admin Panel.</p>
        </div>
        <div className={styles.adminInfo}>
          <div className={styles.adminAvatar}>M</div>
          <div className={styles.adminText}>
            <span className={styles.adminName}>Mayank@Mobile</span>
            <span className={styles.adminRole}>Super Admin</span>
          </div>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <span className={styles.statChange}>{stat.change}</span>
            </div>
            <h3 className={styles.statValue}>{stat.value}</h3>
            <p className={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.grid2Col}>
        <div className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={4}>No orders found.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id.slice(-4).toUpperCase()}</td>
                      <td>{order.customerName}</td>
                      <td>₹{order.total.toLocaleString()}</td>
                      <td>
                        <span className={order.status === "PENDING" ? styles.statusBadgePending : styles.statusBadge}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.customerList}>
          <h2 className={styles.sectionTitle}>Recent Customers</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {uniqueCustomers.length === 0 ? (
                  <tr><td colSpan={2}>No customers yet.</td></tr>
                ) : (
                  uniqueCustomers.slice(0, 5).map((customer, i) => (
                    <tr key={i}>
                      <td>
                        <div className={styles.custInfo}>
                          <span className={styles.custName}>{customer.customerName}</span>
                          <span className={styles.custEmail}>{customer.customerEmail}</span>
                        </div>
                      </td>
                      <td>{customer._count.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
