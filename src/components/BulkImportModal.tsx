"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import styles from "./BulkImportModal.module.css";

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        // Group by ModelId
        const grouped = rawData.reduce((acc: any, row: any) => {
          const modelId = String(row.ModelId || row.modelId || "").trim();
          if (!modelId) return acc;

          if (!acc[modelId]) {
            acc[modelId] = {
              name: row.Name || row.name,
              modelId: modelId,
              description: row.Description || row.description || "",
              category: row.Category || row.category || "Mobiles",
              image: row.Image || row.image || "",
              processor: row.Processor || row.processor || "",
              screen: row.Screen || row.screen || "",
              ram: row.RAM || row.ram || "",
              storage: row.Storage || row.storage || "",
              colorName: row.ColorName || row.colorName || "",
              colorCode: row.ColorCode || row.colorCode || "",
              price: parseFloat(row.Price || row.price || "0"),
              stock: parseInt(row.Stock || row.stock || "0"),
              variants: []
            };
          }

          // Add as a variant
          acc[modelId].variants.push({
            ram: String(row.RAM || row.ram || ""),
            storage: String(row.Storage || row.storage || ""),
            colorName: row.ColorName || row.colorName || "",
            colorCode: row.ColorCode || row.colorCode || "",
            price: parseFloat(row.Price || row.price || "0"),
            mrp: parseFloat(row.MRP || row.mrp || "0"),
            stock: parseInt(row.Stock || row.stock || "0")
          });

          return acc;
        }, {});

        setData(Object.values(grouped as any));
        setError(null);
      } catch (err) {
        setError("Failed to parse file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Import failed");

      alert("Bulk import successful!");
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to import products. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: "iPhone 17 Pro",
        ModelId: "iphone-17-pro",
        Description: "Next-gen flagship",
        Category: "Mobiles",
        Image: "https://example.com/iphone.jpg",
        Processor: "A19 Pro",
        Screen: "6.7 inch OLED",
        RAM: "8GB",
        Storage: "128GB",
        ColorName: "Space Black",
        ColorCode: "#000000",
        Price: 129999,
        MRP: 139999,
        Stock: 50
      },
      {
        Name: "iPhone 17 Pro",
        ModelId: "iphone-17-pro",
        RAM: "8GB",
        Storage: "256GB",
        ColorName: "Natural Titanium",
        ColorCode: "#bebebe",
        Price: 139999,
        MRP: 149999,
        Stock: 30
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "Sahu_Mobiles_Template.xlsx");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Bulk Product Importer</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.content}>
          {data.length === 0 ? (
            <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .csv" 
                style={{ display: "none" }}
              />
              <p>📂 <b>Click to upload</b> or drag and drop</p>
              <p>Supported formats: .xlsx, .csv</p>
              <button onClick={(e) => { e.stopPropagation(); downloadTemplate(); }} className={styles.templateLink}>
                Download Sample Template
              </button>
            </div>
          ) : (
            <>
              <h3>Preview ({data.length} Models)</h3>
              <div style={{ overflowX: "auto" }}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Model ID</th>
                      <th>Variants</th>
                      <th>Price (Starts)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.modelId}</td>
                        <td>{p.variants.length}</td>
                        <td>₹{p.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setData([])} className={styles.templateLink} style={{ marginTop: "1rem" }}>
                Reset and pick another file
              </button>
            </>
          )}

          {error && <p className={styles.errorText}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeBtn}>Cancel</button>
          <button 
            onClick={handleImport} 
            disabled={data.length === 0 || loading} 
            className={styles.importBtn}
          >
            {loading ? "Importing..." : `Import ${data.length} Products`}
          </button>
        </div>
      </div>
    </div>
  );
}
