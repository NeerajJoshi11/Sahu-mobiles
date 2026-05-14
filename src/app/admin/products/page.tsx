"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "/images/phone1.png",
    screen: "",
    processor: "",
    ram: "",
    storage: "",
    stock: "10",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
        setFormData({
          name: "",
          price: "",
          description: "",
          image: "/images/phone1.png",
          screen: "",
          processor: "",
          ram: "",
          storage: "",
          stock: "10",
        });
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMsg("");
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to delete product. It might be linked to existing orders.");
        return;
      }
      
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setErrorMsg("Network error occurred while trying to delete the product.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Management</h1>
          <p className={styles.subtitle}>Manage your product catalog and stock levels.</p>
        </div>
        <button className={`btn btn-primary`} onClick={() => setIsModalOpen(true)}>
          + Add New Product
        </button>
      </header>

      {errorMsg && (
        <div style={{ padding: "1rem", backgroundColor: "#ff444422", color: "#ff4444", border: "1px solid #ff4444", borderRadius: "8px", marginBottom: "1rem" }}>
          <strong>Action Failed:</strong> {errorMsg}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Loading inventory...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5}>No products found. Add your first phone!</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className={styles.productName}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price.toLocaleString()}</td>
                  <td>
                    <span className={product.stock > 5 ? styles.stockOk : styles.stockLow}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Product</h2>
              <div className={styles.importSection}>
                <input 
                  type="text" 
                  placeholder="Paste product link (Amazon, Flipkart, etc.)"
                  className={styles.importInput}
                  id="importUrl"
                />
                <button 
                  className={styles.importBtn}
                  onClick={async () => {
                    const url = (document.getElementById('importUrl') as HTMLInputElement).value;
                    if (!url) return;
                    const btn = document.activeElement as HTMLButtonElement;
                    btn.disabled = true;
                    btn.innerText = "Parsing...";
                    
                    try {
                      const res = await fetch("/api/admin/products/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url }),
                      });
                      const data = await res.json();
                      if (data.product) {
                        setFormData({
                          ...formData,
                          name: data.product.name,
                          description: data.product.description,
                          price: data.product.price.toString(),
                          image: data.product.image || formData.image,
                        });
                      } else {
                        alert(data.error || "Failed to import");
                      }
                    } catch (err) {
                      alert("Error importing product");
                    } finally {
                      btn.disabled = false;
                      btn.innerText = "Import";
                    }
                  }}
                >
                  Import
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Price (₹)</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Image URL</label>
                  <input 
                    required 
                    value={formData.image} 
                    onChange={(e) => setFormData({...formData, image: e.target.value})} 
                    placeholder="/images/phone1.png"
                  />
                </div>
                <div className={styles.imagePreview}>
                  {formData.image && <img src={formData.image} alt="Preview" />}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Processor</label>
                  <input required value={formData.processor} onChange={(e) => setFormData({...formData, processor: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>RAM</label>
                  <input required value={formData.ram} onChange={(e) => setFormData({...formData, ram: e.target.value})} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Storage</label>
                  <input required value={formData.storage} onChange={(e) => setFormData({...formData, storage: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Screen Size</label>
                  <input required value={formData.screen} onChange={(e) => setFormData({...formData, screen: e.target.value})} />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
