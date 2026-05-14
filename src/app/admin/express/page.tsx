"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function AdminExpressPage() {
  const [pincodes, setPincodes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Delivery Staff State
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({ name: "", phone: "" });

  const fetchData = async () => {
    // Fetch Settings
    const settingsRes = await fetch("/api/admin/settings");
    const settingsData = await settingsRes.json();
    
    const p = settingsData.settings?.find((s: any) => s.key === "express_pincodes")?.value || "";
    
    setPincodes(p);

    // Fetch Staff
    const staffRes = await fetch("/api/admin/express/staff");
    const staffData = await staffRes.json();
    setStaff(staffData.staff || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "express_pincodes", value: pincodes }),
      });
      setMessage("Zones updated!");
    } catch (err) {
      setMessage("Failed to update zones.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/express/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      if (res.ok) {
        setNewStaff({ name: "", phone: "" });
        fetchData();
      }
    } catch (err) {
      alert("Error adding staff.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Express Delivery Management</h1>
        <p className={styles.subtitle}>Configure local 2-hour delivery zones and credentials.</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Express Delivery Zones</h2>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Service Pincodes (Comma Separated)</label>
              <textarea 
                className={styles.textarea} 
                value={pincodes} 
                onChange={(e) => setPincodes(e.target.value)}
                placeholder="208001, 208002..."
              />
            </div>
            <button className="btn btn-primary" onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Zones"}
            </button>
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Local Delivery Boys</h2>
          <form className={styles.addStaffForm} onSubmit={handleAddStaff}>
            <input 
              type="text" 
              placeholder="Full Name" 
              className={styles.input} 
              required
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              className={styles.input} 
              required
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            />
            <button type="submit" className="btn btn-primary">Add Boy</button>
          </form>

          <div className={styles.staffList}>
            {staff.map((s) => (
              <div key={s.id} className={styles.staffItem}>
                <div className={styles.staffInfo}>
                  <span className={styles.staffName}>{s.name}</span>
                  <span className={styles.staffPhone}>{s.phone}</span>
                </div>
                <span className={`${styles.staffStatus} ${styles[s.status.toLowerCase()]}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
