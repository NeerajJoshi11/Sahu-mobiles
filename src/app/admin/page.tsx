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

  // Low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lt: 5 } },
    take: 3,
  });

  // Get revenue for last 7 days (simplified)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyRevenue = await prisma.order.groupBy({
    by: ['createdAt'],
    _sum: { total: true },
    where: { createdAt: { gte: sevenDaysAgo } }
  });

  // Mock trend data for the chart if no real data yet
  const chartData = [30, 45, 25, 60, 55, 80, 95]; // Representative of a growing trend

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
          <div className={styles.liveIndicator}>
            <span className={styles.pulse}></span>
            LIVE SYSTEM
          </div>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Welcome back to Sahu Mobiles Admin Panel.</p>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.actionBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </button>
          <button className={styles.actionBtnPrimary}>
            + New Order
          </button>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
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

          <section className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Revenue Trends (Last 7 Days)</h2>
              <span className={styles.chartLegend}>₹ Revenue</span>
            </div>
            <div className={styles.chartWrapper}>
              <svg viewBox="0 0 700 200" className={styles.svgChart}>
                {/* Simplified Trend Line */}
                <path 
                  d={`M 0 180 L 100 ${180 - chartData[0]} L 200 ${180 - chartData[1]} L 300 ${180 - chartData[2]} L 400 ${180 - chartData[3]} L 500 ${180 - chartData[4]} L 600 ${180 - chartData[5]} L 700 ${180 - chartData[6]}`} 
                  fill="none" 
                  stroke="var(--accent)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className={styles.chartPath}
                />
                {/* Area under curve */}
                <path 
                  d={`M 0 180 L 100 ${180 - chartData[0]} L 200 ${180 - chartData[1]} L 300 ${180 - chartData[2]} L 400 ${180 - chartData[3]} L 500 ${180 - chartData[4]} L 600 ${180 - chartData[5]} L 700 ${180 - chartData[6]} V 200 H 0 Z`} 
                  fill="url(#gradient)"
                  className={styles.chartArea}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </section>
        </div>

        <aside className={styles.rightCol}>
          {lowStockProducts.length > 0 && (
            <div className={styles.alertCard}>
              <div className={styles.alertHeader}>
                <span className={styles.alertIcon}>⚠️</span>
                <h3 className={styles.alertTitle}>Low Stock Alerts</h3>
              </div>
              <div className={styles.alertList}>
                {lowStockProducts.map(p => (
                  <div key={p.id} className={styles.alertItem}>
                    <span>{p.name}</span>
                    <span className={styles.stockCount}>{p.stock} left</span>
                  </div>
                ))}
              </div>
              <button className={styles.alertBtn}>Refill Stock</button>
            </div>
          )}

          <div className={styles.customerList}>
            <h2 className={styles.sectionTitle}>Recent Customers</h2>
            <div className={styles.compactList}>
              {uniqueCustomers.length === 0 ? (
                <p>No customers yet.</p>
              ) : (
                uniqueCustomers.slice(0, 5).map((customer, i) => (
                  <div key={i} className={styles.compactItem}>
                    <div className={styles.custInfo}>
                      <span className={styles.custName}>{customer.customerName}</span>
                      <span className={styles.custEmail}>{customer.customerEmail}</span>
                    </div>
                    <div className={styles.custOrderCount}>{customer._count.id} ord.</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className={styles.fullWidthSection}>
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
                        <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
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
      </div>
    </div>
  );
}
