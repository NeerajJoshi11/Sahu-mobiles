"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/list"); // I'll need to create this list API
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert("Failed to delete user. They may have active orders.");
      }
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  if (loading) return <div className={styles.loading}>Loading customers...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Customer Management</h1>
        <p className={styles.subtitle}>View and manage registered customers.</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined Date</th>
              <th>Total Orders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No registered customers yet.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.userName}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone ? `+91 ${user.phone}` : "N/A"}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.orders?.length || 0} orders</td>
                  <td className={styles.actions}>
                    <button className={styles.viewBtn}>View</button>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(user.id, user.name)}
                    >
                      Delete
                    </button>
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
