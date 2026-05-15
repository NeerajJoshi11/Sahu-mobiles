"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [staff, setStaff] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

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

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/express/staff");
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      console.error("Failed to load staff");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStaff();
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

  const handleAssign = async (orderId: string, staffName: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryBoyName: staffName }),
      });

      if (res.ok) {
        setShowAssignModal(null);
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      alert("Error assigning delivery boy.");
    }
  };

  const handlePrint = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = order.items?.map((item: any) => `
      <tr>
        <td>
          <div style="font-weight: bold;">${item.product?.name}</div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">
            ${item.selectedColor ? `Color: ${item.selectedColor}` : ""}
            ${item.selectedColor && item.selectedVariant ? " | " : ""}
            ${item.selectedVariant ? `Variant: ${item.selectedVariant}` : ""}
          </div>
        </td>
        <td>${item.quantity}</td>
        <td>₹${item.price.toLocaleString()}</td>
        <td>₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #d4af37; }
            .invoice-title { font-size: 32px; font-weight: bold; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 14px; text-transform: uppercase; color: #888; margin-bottom: 10px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total-section { text-align: right; font-size: 18px; font-weight: bold; }
            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; text-align: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SAHU MOBILES</div>
            <div class="invoice-title">Invoice</div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Billed To</div>
              <div style="font-weight: bold; font-size: 18px;">${order.customerName}</div>
              <div>${order.customerPhone}</div>
              <div style="margin-top: 10px;">${order.address}</div>
              <div>Pincode: ${order.pincode}</div>
            </div>
            <div style="text-align: right;">
              <div class="section-title">Order Details</div>
              <div>Order ID: #${order.id.slice(-6).toUpperCase()}</div>
              <div>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
              <div>Status: ${order.status}</div>
              <div>Delivery: ${order.deliveryMethod}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            Grand Total: ₹${order.total.toLocaleString()}
          </div>

          <div class="footer">
            <p>Thank you for shopping with Sahu Mobiles!</p>
            <p>This is a computer generated invoice.</p>
          </div>
          
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
              <th>Payment</th>
              <th>Total</th>
              <th>Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td></tr>
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
                          <div className={styles.itemName}>{item.product?.name} x {item.quantity}</div>
                          {(item.selectedColor || item.selectedVariant) && (
                            <div className={styles.itemOptions}>
                              {item.selectedColor && <span>🎨 {item.selectedColor}</span>}
                              {item.selectedVariant && <span>⚙️ {item.selectedVariant}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className={styles.paymentInfo}>
                      <span className={`${styles.paymentBadge} ${styles[(order.paymentMethod || 'online').toLowerCase()]}`}>
                        {order.paymentMethod === 'WHATSAPP' ? '📱 WA' : order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                      </span>
                      <div className={styles.paymentStatus}>{order.paymentStatus || 'Pending'}</div>
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
                      <div className={`${styles.providerBadge} ${styles[(order.fulfillmentProvider || 'sahu_local').toLowerCase()]}`}>
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
                        onClick={() => setShowAssignModal(order.id)}
                      >
                        Assign Boy
                      </button>
                    )}
                    {order.deliveryBoyName && (
                      <span className={styles.boyName}>👤 {order.deliveryBoyName}</span>
                    )}
                    <button className={styles.printBtn} onClick={() => handlePrint(order)}>Print</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(order.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAssignModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Assign Delivery Boy</h2>
            <p className={styles.modalSubtitle}>Select a staff member for this express delivery.</p>
            <div className={styles.staffGrid}>
              {staff.filter(s => s.status === 'AVAILABLE').length === 0 ? (
                <p>No available delivery boys. Add them in Express Delivery settings.</p>
              ) : (
                staff.filter(s => s.status === 'AVAILABLE').map((s) => (
                  <button 
                    key={s.id} 
                    className={styles.staffBtn}
                    onClick={() => handleAssign(showAssignModal, s.name)}
                  >
                    <div className={styles.staffName}>{s.name}</div>
                    <div className={styles.staffPhone}>{s.phone}</div>
                  </button>
                ))
              )}
            </div>
            <button className={styles.cancelBtn} onClick={() => setShowAssignModal(null)}>Cancel</button>
          </div>
        </div>
      )}
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
