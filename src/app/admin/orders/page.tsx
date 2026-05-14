"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders/list");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete order #${id.slice(-6).toUpperCase()}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      } else {
        alert("Failed to delete order.");
      }
    } catch (err) {
      alert("Error deleting order.");
    }
  };

  const handleAssign = async (id: string) => {
    const name = prompt("Enter Delivery Boy Name:");
    if (!name) return;

    try {
      const res = await fetch(`/api/admin/orders/${id}/delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryBoyName: name }),
      });

      if (res.ok) {
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      alert("Error assigning delivery boy.");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Order Management</h1>
        <p className={styles.subtitle}>Track and fulfill customer orders.</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Search by ID or Customer..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className={styles.statusSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer & Phone</th>
              <th>Address</th>
              <th>Items</th>
              <th>Total</th>
              <th>Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td></tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{order.customerName}</span>
                      <span className={styles.customerPhone}>📞 {order.customerPhone}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.addressInfo}>
                      {order.address}, {order.pincode}
                    </div>
                  </td>
                  <td>
                    <div className={styles.itemsList}>
                      {order.items?.map((item: any) => (
                        <div key={item.id} className={styles.item}>
                          {item.product?.name} x {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.total}>₹{order.total.toLocaleString()}</td>
                  <td>
                    <div className={styles.deliveryInfo}>
                      <span className={`${styles.deliveryBadge} ${styles[order.deliveryMethod?.toLowerCase() || 'standard']}`}>
                        {order.deliveryMethod === 'EXPRESS' ? '⚡ 2HR' : '📦 STD'}
                      </span>
                      {order.deliveryMethod === 'EXPRESS' && order.status !== 'DELIVERED' && (
                        <CountdownTimer startTime={order.createdAt} />
                      )}
                      <div className={styles.providerBadge}>
                        {order.fulfillmentProvider === 'SHIPROCKET' ? '🚀 Shiprocket' : '🏠 Local'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className={styles.actions}>
                    {order.fulfillmentProvider === 'SAHU_LOCAL' && !order.deliveryBoyName && (
                      <button 
                        className={styles.assignBtn}
                        onClick={() => handleAssign(order.id)}
                      >
                        Assign Boy
                      </button>
                    )}
                    {order.deliveryBoyName && (
                      <span className={styles.boyName}>👤 {order.deliveryBoyName}</span>
                    )}
                    <button className={styles.deleteBtn} onClick={() => handleDelete(order.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CountdownTimer({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const deadline = start + 2 * 60 * 60 * 1000; // 2 hours
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("TIME UP!");
        setIsLate(true);
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className={`${styles.timer} ${isLate ? styles.late : ""}`}>
      {timeLeft}
    </div>
  );
}
