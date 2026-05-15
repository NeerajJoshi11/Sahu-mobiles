"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { BulkImportModal } from "@/components/BulkImportModal";

interface Variant {
  ram: string;
  storage: string;
  colorName: string;
  colorCode: string;
  image: string;
  price: string;
  mrp: string;
  stock: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number | null;
  stock: number;
  category: string;
  description: string;
  image: string;
  screen: string;
  processor: string;
  ram: string;
  storage: string;
  modelId?: string | null;
  colorName?: string | null;
  colorCode?: string | null;
  hasVariants: boolean;
  variants: Variant[];
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    mrp: "",
    description: "",
    image: "/images/phone1.png",
    screen: "",
    processor: "",
    ram: "",
    storage: "",
    stock: "10",
    modelId: "",
    colorName: "",
    colorCode: "#000000",
    hasVariants: false,
    variants: [] as Variant[],
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
      const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
      const method = editingProductId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          mrp: formData.mrp ? parseFloat(formData.mrp) : null,
          stock: parseInt(formData.stock),
          variants: formData.hasVariants ? formData.variants.map(v => ({
            ...v,
            price: parseFloat(v.price),
            mrp: v.mrp ? parseFloat(v.mrp) : null,
            stock: parseInt(v.stock)
          })) : []
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProductId(null);
        fetchProducts();
        resetForm();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to save product.");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      setErrorMsg("Network error occurred.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      mrp: "",
      description: "",
      image: "/images/phone1.png",
      screen: "",
      processor: "",
      ram: "",
      storage: "",
      stock: "10",
      modelId: "",
      colorName: "",
      colorCode: "#000000",
      hasVariants: false,
      variants: [] as Variant[],
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      mrp: product.mrp ? product.mrp.toString() : "",
      description: product.description,
      image: product.image,
      screen: product.screen,
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      stock: product.stock.toString(),
      modelId: product.modelId || "",
      colorName: product.colorName || "",
      colorCode: product.colorCode || "#000000",
      hasVariants: product.hasVariants || false,
      variants: product.variants?.map(v => ({
        ram: v.ram,
        storage: v.storage,
        colorName: v.colorName || "",
        colorCode: v.colorCode || "#000000",
        image: v.image || "",
        price: v.price.toString(),
        mrp: v.mrp ? v.mrp.toString() : "",
        stock: v.stock.toString(),
      })) || [],
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    setEditingProductId(null);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      mrp: product.mrp ? product.mrp.toString() : "",
      description: product.description,
      image: product.image,
      screen: product.screen,
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      stock: product.stock.toString(),
      modelId: product.modelId || "",
      colorName: "", // Clear color to force new one
      colorCode: "#000000",
      hasVariants: product.hasVariants || false,
      variants: product.variants?.map(v => ({
        ram: v.ram,
        storage: v.storage,
        colorName: v.colorName || "",
        colorCode: v.colorCode || "#000000",
        image: v.image || "",
        price: v.price.toString(),
        mrp: v.mrp ? v.mrp.toString() : "",
        stock: v.stock.toString(),
      })) || [],
    });
    setIsModalOpen(true);
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
        <div className={styles.headerActions}>
          <button 
            className="btn btn-outline" 
            style={{ marginRight: "1rem" }}
            onClick={() => setIsBulkModalOpen(true)}
          >
            📊 Bulk Import
          </button>
          <button className={`btn btn-primary`} onClick={() => {
            setEditingProductId(null);
            resetForm();
            setIsModalOpen(true);
          }}>
            + Add New Product
          </button>
        </div>
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
              <th>Color</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Variants</th>
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
                  <td>
                    <div className={styles.colorCell}>
                      {product.colorCode && (
                        <div 
                          className={styles.colorSwatch} 
                          style={{ backgroundColor: product.colorCode }} 
                        />
                      )}
                      <span>{product.colorName || "N/A"}</span>
                    </div>
                  </td>
                  <td>₹{product.price.toLocaleString()}</td>
                  <td>
                    <span className={product.stock > 5 ? styles.stockOk : styles.stockLow}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td>
                    {product.variants && product.variants.length > 0 ? (
                      <span className={styles.variantBadge}>
                        {product.variants.length} Variants
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>Single</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => handleEdit(product)} style={{ marginRight: '0.5rem', padding: '0.5rem', background: 'var(--accent)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button className={styles.duplicateBtn} onClick={() => handleDuplicate(product)} style={{ marginRight: '0.5rem', padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent)', borderRadius: '4px', border: '1px solid var(--accent)', cursor: 'pointer' }}>
                        + Color
                      </button>
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
              <h2 className={styles.modalTitle}>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
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
                  <label>MRP (₹)</label>
                  <input type="number" placeholder="Original Price (Optional)" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Selling Price (₹)</label>
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
                  <label>Model ID (Group ID)</label>
                  <input 
                    placeholder="e.g., apple-iphone-15-pro" 
                    value={formData.modelId} 
                    onChange={(e) => setFormData({...formData, modelId: e.target.value})} 
                  />
                  <small style={{ color: "var(--muted-foreground)", fontSize: "0.7rem" }}>Used to link different colors of the same model.</small>
                </div>
                <div className={styles.formRow} style={{ gridTemplateColumns: "2fr 1fr" }}>
                  <div className={styles.formGroup}>
                    <label>Color Name</label>
                    <input 
                      placeholder="e.g., Deep Purple" 
                      value={formData.colorName} 
                      onChange={(e) => setFormData({...formData, colorName: e.target.value})} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Color Hex</label>
                    <input 
                      type="color" 
                      value={formData.colorCode} 
                      onChange={(e) => setFormData({...formData, colorCode: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={formData.hasVariants} 
                    onChange={(e) => setFormData({...formData, hasVariants: e.target.checked})} 
                  />
                  This product has multiple variants (RAM/Storage/Price)
                </label>
              </div>

              {formData.hasVariants && (
                <div className={styles.variantsSection}>
                  <div className={styles.variantsHeader}>
                    <h3 className={styles.sectionTitle}>Product Variants</h3>
                    <button type="button" className={styles.addVariantBtn} onClick={() => {
                      setFormData({
                        ...formData,
                        variants: [...formData.variants, { ram: "", storage: "", colorName: "", colorCode: "#000000", image: "", price: "", mrp: "", stock: "10" }]
                      });
                    }}>
                      + Add Variant
                    </button>
                  </div>
                  
                  {formData.variants.map((variant, index) => {
                    const discount = variant.mrp && variant.price ? 
                      Math.round(((parseFloat(variant.mrp) - parseFloat(variant.price)) / parseFloat(variant.mrp)) * 100) : 0;

                    return (
                      <div key={index} className={styles.variantRow}>
                        <div className={styles.variantInputs}>
                          <input placeholder="Color" value={variant.colorName} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].colorName = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} />
                          <input type="color" value={variant.colorCode} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].colorCode = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} className={styles.variantColorPicker} />
                          <input placeholder="RAM" value={variant.ram} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].ram = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} />
                          <input placeholder="Storage" value={variant.storage} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].storage = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} />
                          <input placeholder="Variant Image URL" value={variant.image} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].image = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} />
                          <div className={styles.variantImagePreview}>
                            {variant.image ? (
                              <img src={variant.image} alt="V" />
                            ) : (
                              <div className={styles.noImagePlaceholder}>No Img</div>
                            )}
                          </div>
                          <input type="number" placeholder="MRP" value={variant.mrp} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].mrp = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} />
                          <div className={styles.priceWithDiscount}>
                            <input type="number" placeholder="Price" value={variant.price} onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].price = e.target.value;
                              setFormData({...formData, variants: newVariants});
                            }} />
                            {discount > 0 && <span className={styles.discountBadge}>{discount}%</span>}
                          </div>
                          <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index].stock = e.target.value;
                            setFormData({...formData, variants: newVariants});
                          }} />
                        </div>
                        <button type="button" className={styles.removeBtn} onClick={() => {
                          const newVariants = formData.variants.filter((_, i) => i !== index);
                          setFormData({...formData, variants: newVariants});
                        }}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isBulkModalOpen && (
        <BulkImportModal 
          onClose={() => setIsBulkModalOpen(false)} 
          onSuccess={() => fetchProducts()} 
        />
      )}
    </div>
  );
}
