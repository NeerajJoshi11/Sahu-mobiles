"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function AdminSettingsPage() {
  const [expressPincodes, setExpressPincodes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        const pincodes = data.settings?.find((s: any) => s.key === "express_pincodes")?.value || "";
        setExpressPincodes(pincodes);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "express_pincodes", value: expressPincodes }),
      });

      if (res.ok) {
        setMessage("Settings updated successfully!");
      } else if (res.status === 401) {
        setMessage("Session expired. Please log in again.");
      } else {
        setMessage("Failed to update settings. Check server logs.");
      }
    } catch (err) {
      setMessage("Error updating settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Store Settings</h1>
        <p className={styles.subtitle}>Configure delivery options and store-wide parameters.</p>
      </header>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Delivery Configuration</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Express Delivery Pincodes (2-Hour Delivery)</label>
          <textarea 
            className={styles.textarea}
            placeholder="Enter pincodes separated by commas (e.g. 208001, 208012)"
            value={expressPincodes}
            onChange={(e) => setExpressPincodes(e.target.value)}
          />
          <p className={styles.hint}>Enter the 6-digit pincodes where you want to offer 2-hour express delivery. Separate multiple codes with commas.</p>
        </div>

        <button 
          className={`btn btn-primary ${styles.saveBtn}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>

        {message && <div className={styles.message}>{message}</div>}
      </div>
    </div>
  );
}
