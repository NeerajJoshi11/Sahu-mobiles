"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minAmount: "0",
    expiresAt: "",
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoupons(data);
      } else {
        setCoupons([]);
        if (data.error) setError(data.error);
      }
    } catch (err) {
      console.error("Failed to fetch coupons");
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");
      
      setIsModalOpen(false);
      setFormData({ code: "", type: "PERCENTAGE", value: "", minAmount: "0", expiresAt: "", isActive: true });
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error("Failed to delete coupon");
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    try {
      await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      fetchCoupons();
    } catch (err) {
      console.error("Failed to update coupon");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupons</h1>
          <p className={styles.subtitle}>Manage your discount codes and promotions</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          + Create Coupon
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loading}>Loading coupons...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className={styles.codeCell}>{coupon.code}</td>
                  <td>
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </td>
                  <td>₹{coupon.minAmount.toLocaleString()}</td>
                  <td>
                    <button 
                      className={`${styles.statusBadge} ${coupon.isActive ? styles.active : styles.inactive}`}
                      onClick={() => toggleStatus(coupon)}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteCoupon(coupon.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.empty}>No coupons created yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleCreateCoupon} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Coupon Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. SUMMER20" 
                  required 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Value</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Min. Order Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.minAmount}
                    onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
