"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Newsletter.module.css";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Thanks for subscribing! Check your inbox soon.");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed to connect. Please try again.");
    }
  };

  return (
    <div className={styles.newsletterWrapper}>
      <div className={styles.newsletterContent}>
        <div className={styles.textSection}>
          <h3 className={styles.title}>Stay Updated</h3>
          <p className={styles.description}>
            Subscribe to our newsletter for exclusive deals, new product launches, and tech news.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.formSection}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Enter your email address"
              className={styles.input}
              disabled={status === "loading" || status === "success"}
              required
            />
            <motion.button
              type="submit"
              className={styles.button}
              disabled={status === "loading" || status === "success"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === "loading" ? (
                <span className={styles.spinner}></span>
              ) : (
                "Subscribe"
              )}
            </motion.button>
          </div>
          
          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.successMessage}
              >
                {message}
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.errorMessage}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
