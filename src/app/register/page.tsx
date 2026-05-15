"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./page.module.css";

function AuthContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate phone number if registering
    if (!isLogin && formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.tabs}>
          <button 
            className={isLogin ? styles.activeTab : styles.tab} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? styles.activeTab : styles.tab} 
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className={styles.subtitle}>
            {isLogin 
              ? "Sign in to track your orders and manage your profile." 
              : "Join Sahu Mobiles for a premium shopping experience."}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="Enter your name"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <div className={styles.phoneInputWrapper}>
                <span className={styles.countryCode}>+91</span>
                <input 
                  type="tel" 
                  required 
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                />
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="name@example.com"
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register now" : "Login here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
